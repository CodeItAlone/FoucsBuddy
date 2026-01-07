import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../services/ThemeContext';

// Sample squad data with enhanced info
const squadMembers = [
    { id: 1, name: 'Alex Chen', avatar: '👨‍💻', status: 'deepWork', project: 'API Design', duration: 45, total: 60 },
    { id: 2, name: 'Sam Wilson', avatar: '👩‍🎨', status: 'active', project: 'UI Review', duration: 23, total: 45 },
    { id: 3, name: 'Maya Patel', avatar: '👨‍🔬', status: 'deepWork', project: 'Code Review', duration: 52, total: 60 },
    { id: 4, name: 'Chris Lee', avatar: '👩‍💼', status: 'idle', project: 'Last: Sprint Planning', duration: 0, total: 0 },
    { id: 5, name: 'Jordan Park', avatar: '🧑‍🚀', status: 'active', project: 'Documentation', duration: 15, total: 25 },
];

function StatusPulse({ status, theme }) {
    const getColor = () => {
        switch (status) {
            case 'deepWork': return theme.colors.primary;
            case 'active': return theme.colors.secondary;
            default: return theme.colors.textMuted;
        }
    };

    const color = getColor();
    const isAnimated = status !== 'idle';

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
    const styles = createMemberStyles(theme);

    const getStatusLabel = () => {
        switch (member.status) {
            case 'deepWork': return 'Deep Work';
            case 'active': return 'Active';
            default: return 'Idle';
        }
    };

    const getStatusColor = () => {
        switch (member.status) {
            case 'deepWork': return theme.colors.primary;
            case 'active': return theme.colors.secondary;
            default: return theme.colors.textMuted;
        }
    };

    const progress = member.total > 0 ? member.duration / member.total : 0;

    return (
        <View style={styles.memberCard}>
            <View style={styles.avatarSection}>
                <View style={[styles.avatarRing, { borderColor: getStatusColor() }]}>
                    <Text style={styles.avatar}>{member.avatar}</Text>
                </View>
                <StatusPulse status={member.status} theme={theme} />
            </View>

            <View style={styles.infoSection}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{member.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusLabel()}</Text>
                    </View>
                </View>

                <Text style={styles.project} numberOfLines={1}>{member.project}</Text>

                {member.status !== 'idle' && (
                    <View style={styles.progressRow}>
                        <ProgressMini progress={progress} color={getStatusColor()} />
                        <Text style={styles.duration}>{member.duration}min</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

export default function LiveSquadWidget({ onHighFive }) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const activeCount = squadMembers.filter(m => m.status !== 'idle').length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Live Squad</Text>
                    <View style={styles.liveBadge}>
                        <View style={styles.liveIndicator} />
                        <Text style={styles.liveText}>Live</Text>
                    </View>
                </View>
                <Text style={styles.subtitle}>{activeCount} of {squadMembers.length} focusing</Text>
            </View>

            {/* Members List */}
            <ScrollView
                style={styles.membersList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.membersContent}
            >
                {squadMembers.map(member => (
                    <SquadMember
                        key={member.id}
                        member={member}
                        theme={theme}
                        onHighFive={onHighFive}
                    />
                ))}
            </ScrollView>

            {/* Invite Button */}
            <TouchableOpacity style={styles.inviteButton}>
                <Text style={styles.inviteIcon}>+</Text>
                <Text style={styles.inviteText}>Invite to Squad</Text>
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
