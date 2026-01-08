import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useTheme } from '../services/ThemeContext';
import { useAuth } from '../services/AuthContext';
import { groupApi } from '../services/api';
import { connect, subscribeToGroup } from '../services/websocket';

export default function GroupDetailScreen({ route, navigation }) {
    const { groupId } = route.params;
    const { theme } = useTheme();
    const { user } = useAuth();
    const styles = createStyles(theme);

    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wsConnected, setWsConnected] = useState(false);

    const fetchGroupData = useCallback(async () => {
        try {
            const [groupRes, membersRes] = await Promise.all([
                groupApi.getGroup(groupId),
                groupApi.getMemberStatuses(groupId),
            ]);
            setGroup(groupRes.data);
            setMembers(membersRes.data);
        } catch (err) {
            console.error('Failed to fetch group data:', err);
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        fetchGroupData();

        // Connect to WebSocket for live updates
        connect(
            () => {
                setWsConnected(true);
                subscribeToGroup(groupId, (event) => {
                    setMembers(prev => {
                        const index = prev.findIndex(m => m.handle === event.userHandle);
                        if (index >= 0) {
                            const updated = [...prev];
                            updated[index] = {
                                ...updated[index],
                                status: event.status,
                                currentTask: event.task,
                                timeLeftMinutes: event.timeLeft
                            };
                            return updated;
                        }
                        return prev;
                    });
                });
            },
            () => setWsConnected(false)
        );
    }, [groupId, fetchGroupData]);

    const handleLeaveGroup = async () => {
        Alert.alert(
            'Leave Group',
            'Are you sure you want to leave this group?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await groupApi.leaveGroup(groupId);
                            navigation.goBack();
                        } catch (err) {
                            console.error('Failed to leave group:', err);
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DEEP_WORK':
            case 'ACTIVE': return theme.colors.primary;
            default: return theme.colors.textMuted;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'DEEP_WORK': return 'Deep Work';
            case 'ACTIVE': return 'Active';
            default: return 'Idle';
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={styles.title}>{group?.name}</Text>
                    <View style={styles.liveIndicator}>
                        <View style={[styles.liveDot, { backgroundColor: wsConnected ? theme.colors.secondary : theme.colors.textMuted }]} />
                        <Text style={styles.liveText}>{wsConnected ? 'Live' : 'Offline'}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleLeaveGroup}>
                    <Text style={styles.leaveButton}>Leave</Text>
                </TouchableOpacity>
            </View>

            {/* Group Info */}
            <View style={styles.infoCard}>
                <Text style={styles.infoCategory}>{group?.category}</Text>
                <Text style={styles.infoMembers}>{members.length} members</Text>
            </View>

            {/* Members List */}
            <Text style={styles.sectionTitle}>Squad Members</Text>
            <ScrollView style={styles.membersList}>
                {members.map(member => (
                    <View key={member.userId} style={styles.memberCard}>
                        <View style={styles.memberAvatar}>
                            <Text style={styles.avatarText}>
                                {['👨‍💻', '👩‍🎨', '👨‍🔬', '👩‍💼'][member.userId % 4]}
                            </Text>
                        </View>
                        <View style={styles.memberInfo}>
                            <View style={styles.memberHeader}>
                                <Text style={styles.memberName}>{member.handle}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(member.status) + '20' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(member.status) }]}>
                                        {getStatusLabel(member.status)}
                                    </Text>
                                </View>
                            </View>
                            {member.currentTask && (
                                <Text style={styles.memberTask}>{member.currentTask}</Text>
                            )}
                            {member.timeLeftMinutes > 0 && (
                                <Text style={styles.memberTime}>{member.timeLeftMinutes} min left</Text>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        fontSize: 16,
        color: theme.colors.primary,
    },
    headerTitle: {
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    liveText: {
        fontSize: 11,
        color: theme.colors.textSecondary,
    },
    leaveButton: {
        fontSize: 14,
        color: theme.colors.error || '#EF4444',
    },
    infoCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        margin: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
    },
    infoCategory: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
    },
    infoMembers: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        paddingHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.s,
    },
    membersList: {
        flex: 1,
        paddingHorizontal: theme.spacing.m,
    },
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
    },
    memberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.m,
    },
    avatarText: {
        fontSize: 24,
    },
    memberInfo: {
        flex: 1,
    },
    memberHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    memberName: {
        fontSize: 16,
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
    memberTask: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginBottom: 2,
    },
    memberTime: {
        fontSize: 12,
        color: theme.colors.textMuted,
    },
});
