import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '../services/ThemeContext';
import { groupApi } from '../services/api';
import { connect, subscribeToGroup, isConnected } from '../services/websocket';

function StatusPulse({ status, theme }) {
    const getColor = () => {
        switch (status) {
            case 'DEEP_WORK':
            case 'deepWork': return theme.colors.primary;
            case 'ACTIVE':
            case 'active': return theme.colors.secondary;
            default: return theme.colors.textMuted;
        }
    };

    const color = getColor();
    const isAnimated = status !== 'IDLE' && status !== 'idle';

    return (
        <View style={[styles.pulseContainer]}>
            {isAnimated && (
                <View style={[styles.pulseRing, { borderColor: color, opacity: 0.3 }]} />
            )}
            <View style={[styles.pulseDot, { backgroundColor: color }]} />
        </View>
    );
}

function ProgressMini({ progress, color }) {
    return (
        <View style={styles.progressMini}>
            <View style={[styles.progressMiniFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
        </View>
    );
}

function SquadMember({ member, theme, onHighFive }) {
    const memberStyles = createMemberStyles(theme);

    const getStatusLabel = () => {
        switch (member.status) {
            case 'DEEP_WORK':
            case 'deepWork': return 'Deep Work';
            case 'ACTIVE':
            case 'active': return 'Active';
            default: return 'Idle';
        }
    };

    const getStatusColor = () => {
        switch (member.status) {
            case 'DEEP_WORK':
            case 'deepWork': return theme.colors.primary;
            case 'ACTIVE':
            case 'active': return theme.colors.secondary;
            default: return theme.colors.textMuted;
        }
    };

    // Calculate progress from timeLeftMinutes if available
    const duration = member.timeLeftMinutes || member.duration || 0;
    const total = member.total || 60; // Default to 60 min session
    const progress = total > 0 ? Math.max(0, (total - duration) / total) : 0;

    // Generate avatar from handle/name
    const getAvatar = () => {
        const avatars = ['👨‍💻', '👩‍🎨', '👨‍🔬', '👩‍💼', '🧑‍🚀', '👩‍🔧', '👨‍🎓'];
        return avatars[(member.userId || member.id) % avatars.length];
    };

    const isIdle = member.status === 'IDLE' || member.status === 'idle';

    return (
        <View style={memberStyles.memberCard}>
            <View style={memberStyles.avatarSection}>
                <View style={[memberStyles.avatarRing, { borderColor: getStatusColor() }]}>
                    <Text style={memberStyles.avatar}>{member.avatar || getAvatar()}</Text>
                </View>
                <StatusPulse status={member.status} theme={theme} />
            </View>

            <View style={memberStyles.infoSection}>
                <View style={memberStyles.nameRow}>
                    <Text style={memberStyles.name}>{member.handle || member.name}</Text>
                    <View style={[memberStyles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
                        <Text style={[memberStyles.statusText, { color: getStatusColor() }]}>{getStatusLabel()}</Text>
                    </View>
                </View>

                <Text style={memberStyles.project} numberOfLines={1}>
                    {member.currentTask || member.project || (isIdle ? 'Not in session' : 'Working...')}
                </Text>

                {!isIdle && (
                    <View style={memberStyles.progressRow}>
                        <ProgressMini progress={progress} color={getStatusColor()} />
                        <Text style={memberStyles.duration}>{duration}min</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

export default function LiveSquadWidget({ groupId, onHighFive, onNavigateToGroups }) {
    const { theme } = useTheme();
    const widgetStyles = createStyles(theme);

    const [squadMembers, setSquadMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wsConnected, setWsConnected] = useState(false);

    // Fetch members from API
    const fetchMembers = useCallback(async () => {
        if (!groupId) {
            setLoading(false);
            return;
        }

        try {
            const response = await groupApi.getMemberStatuses(groupId);
            setSquadMembers(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch squad members:', err);
            setError('Failed to load squad');
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    // Connect to WebSocket and subscribe to group updates
    useEffect(() => {
        if (!groupId) return;

        fetchMembers();

        // Connect to WebSocket
        connect(
            () => {
                setWsConnected(true);
                // Subscribe to group updates
                subscribeToGroup(groupId, (event) => {
                    // Update member status when we receive an event
                    setSquadMembers(prev => {
                        const index = prev.findIndex(m => m.handle === event.userHandle);
                        if (index >= 0) {
                            const updated = [...prev];
                            updated[index] = {
                                ...updated[index],
                                status: event.status === 'ACTIVE' ? 'DEEP_WORK' : event.status,
                                currentTask: event.task,
                                timeLeftMinutes: event.timeLeft
                            };
                            return updated;
                        }
                        return prev;
                    });
                });
            },
            (err) => {
                console.error('WebSocket error:', err);
                setWsConnected(false);
            }
        );
    }, [groupId, fetchMembers]);

    const activeCount = squadMembers.filter(m => m.status !== 'IDLE' && m.status !== 'idle').length;

    if (!groupId) {
        return (
            <View style={widgetStyles.container}>
                <View style={widgetStyles.header}>
                    <Text style={widgetStyles.title}>Live Squad</Text>
                </View>
                <View style={widgetStyles.emptyState}>
                    <Text style={widgetStyles.emptyText}>Join a group to see your squad</Text>
                    <TouchableOpacity style={widgetStyles.inviteButton} onPress={onNavigateToGroups}>
                        <Text style={widgetStyles.inviteText}>Browse Groups</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={widgetStyles.container}>
                <View style={widgetStyles.header}>
                    <Text style={widgetStyles.title}>Live Squad</Text>
                </View>
                <View style={widgetStyles.loadingState}>
                    <ActivityIndicator color={theme.colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={widgetStyles.container}>
            {/* Header */}
            <View style={widgetStyles.header}>
                <View style={widgetStyles.titleRow}>
                    <Text style={widgetStyles.title}>Live Squad</Text>
                    <View style={widgetStyles.liveBadge}>
                        <View style={[widgetStyles.liveIndicator, { backgroundColor: wsConnected ? theme.colors.secondary : theme.colors.textMuted }]} />
                        <Text style={widgetStyles.liveText}>{wsConnected ? 'Live' : 'Offline'}</Text>
                    </View>
                </View>
                <Text style={widgetStyles.subtitle}>{activeCount} of {squadMembers.length} focusing</Text>
            </View>

            {/* Members List */}
            <ScrollView
                style={widgetStyles.membersList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={widgetStyles.membersContent}
            >
                {squadMembers.map(member => (
                    <SquadMember
                        key={member.userId || member.id}
                        member={member}
                        theme={theme}
                        onHighFive={onHighFive}
                    />
                ))}
            </ScrollView>

            {/* Invite Button */}
            <TouchableOpacity style={widgetStyles.inviteButton}>
                <Text style={widgetStyles.inviteIcon}>+</Text>
                <Text style={widgetStyles.inviteText}>Invite to Squad</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    pulseContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseRing: {
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    progressMini: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressMiniFill: {
        height: '100%',
        borderRadius: 2,
    },
});

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.m,
        ...(Platform.OS === 'web' ? {
            backdropFilter: 'blur(12px)',
        } : {}),
    },
    header: {
        marginBottom: theme.spacing.m,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.secondary + '20',
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.round,
    },
    liveIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.secondary,
        marginRight: 4,
    },
    liveText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.secondary,
    },
    subtitle: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    membersList: {
        flex: 1,
    },
    membersContent: {
        gap: theme.spacing.s,
    },
    inviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primaryLight,
        borderRadius: theme.borderRadius.m,
        paddingVertical: theme.spacing.m,
        marginTop: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
    },
    inviteIcon: {
        fontSize: 18,
        color: theme.colors.primary,
        marginRight: theme.spacing.s,
        fontWeight: '600',
    },
    inviteText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xl,
    },
    emptyText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.m,
        textAlign: 'center',
    },
    loadingState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xl,
    },
});

const createMemberStyles = (theme) => StyleSheet.create({
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceSecondary,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
    },
    avatarSection: {
        position: 'relative',
        marginRight: theme.spacing.m,
    },
    avatarRing: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
    },
    avatar: {
        fontSize: 22,
    },
    infoSection: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.round,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    project: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 6,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.s,
    },
    duration: {
        fontSize: 11,
        color: theme.colors.textMuted,
        minWidth: 35,
    },
});
