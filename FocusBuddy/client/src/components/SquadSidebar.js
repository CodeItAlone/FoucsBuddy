import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useTheme } from '../services/ThemeContext';

// Sample squad data
const squadMembers = [
    { id: 1, name: 'Alex Chen', avatar: '👨‍💻', status: 'active', task: 'Deep work session' },
    { id: 2, name: 'Sam Wilson', avatar: '👩‍🎨', status: 'focus', task: 'UI Design' },
    { id: 3, name: 'Maya Patel', avatar: '👨‍🔬', status: 'active', task: 'Code review' },
    { id: 4, name: 'Chris Lee', avatar: '👩‍💼', status: 'offline', task: 'Last seen 2h ago' },
    { id: 5, name: 'Jordan Park', avatar: '🧑‍🚀', status: 'focus', task: 'Sprint planning' },
];

function StatusRing({ status, size = 56, children }) {
    const { theme } = useTheme();

    const getStatusColor = () => {
        switch (status) {
            case 'active': return theme.colors.statusActive;
            case 'focus': return theme.colors.statusFocus;
            default: return theme.colors.statusOffline;
        }
    };

    const glowStyle = status !== 'offline' ? {
        shadowColor: getStatusColor(),
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 6,
    } : {};

    return (
        <View style={[
            {
                width: size + 6,
                height: size + 6,
                borderRadius: (size + 6) / 2,
                borderWidth: 2,
                borderColor: getStatusColor(),
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
            },
            glowStyle
        ]}>
            {children}
        </View>
    );
}

function MemberCard({ member }) {
    const { theme } = useTheme();
    const styles = createMemberStyles(theme);

    return (
        <View style={styles.memberCard}>
            <StatusRing status={member.status}>
                <Text style={styles.avatar}>{member.avatar}</Text>
            </StatusRing>
            <View style={styles.memberInfo}>
                <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                <Text style={styles.memberTask} numberOfLines={1}>{member.task}</Text>
            </View>
            <View style={[styles.statusDot, {
                backgroundColor:
                    member.status === 'active' ? theme.colors.statusActive :
                        member.status === 'focus' ? theme.colors.statusFocus :
                            theme.colors.statusOffline
            }]} />
        </View>
    );
}

export default function SquadSidebar() {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Squad</Text>
                <View style={styles.onlineCount}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>3 online</Text>
                </View>
            </View>

            {/* Members List */}
            <ScrollView
                style={styles.membersList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.membersContent}
            >
                {squadMembers.map(member => (
                    <MemberCard key={member.id} member={member} />
                ))}
            </ScrollView>

            {/* Invite Button */}
            <TouchableOpacity style={styles.inviteButton}>
                <Text style={styles.inviteIcon}>+</Text>
                <Text style={styles.inviteText}>Invite Friends</Text>
            </TouchableOpacity>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.surface,
        borderLeftWidth: 1,
        borderLeftColor: theme.colors.border,
        paddingVertical: theme.spacing.l,
        paddingHorizontal: theme.spacing.m,
    },
    header: {
        marginBottom: theme.spacing.l,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    onlineCount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.statusActive,
        marginRight: theme.spacing.s,
    },
    onlineText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    membersList: {
        flex: 1,
    },
    membersContent: {
        gap: theme.spacing.m,
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
        paddingVertical: theme.spacing.s,
    },
    avatar: {
        fontSize: 24,
    },
    memberInfo: {
        flex: 1,
        marginLeft: theme.spacing.m,
    },
    memberName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
    memberTask: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
