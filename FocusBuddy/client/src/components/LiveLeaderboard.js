import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../services/ThemeContext';
import GlassmorphismCard from './GlassmorphismCard';

// Sample leaderboard data
const leaderboardData = [
    { id: 1, name: 'Alex Chen', avatar: '👨‍💻', focusTime: '12h 45m', streak: 28, position: 1 },
    { id: 2, name: 'You', avatar: '🦸', focusTime: '10h 32m', streak: 15, position: 2, isCurrentUser: true },
    { id: 3, name: 'Maya Patel', avatar: '👨‍🔬', focusTime: '9h 18m', streak: 12, position: 3 },
    { id: 4, name: 'Sam Wilson', avatar: '👩‍🎨', focusTime: '8h 05m', streak: 8, position: 4 },
    { id: 5, name: 'Jordan Park', avatar: '🧑‍🚀', focusTime: '6h 22m', streak: 5, position: 5 },
];

function PositionBadge({ position, theme }) {
    const getBadgeStyle = () => {
        switch (position) {
            case 1:
                return { backgroundColor: '#FFD700', color: '#000' };
            case 2:
                return { backgroundColor: '#C0C0C0', color: '#000' };
            case 3:
                return { backgroundColor: '#CD7F32', color: '#FFF' };
            default:
                return { backgroundColor: theme.colors.border, color: theme.colors.textSecondary };
        }
    };

    const style = getBadgeStyle();

    return (
        <View style={[{
            width: 24,
            height: 24,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: style.backgroundColor,
        }]}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: style.color }}>
                {position}
            </Text>
        </View>
    );
}

function LeaderboardRow({ item, theme }) {
    const styles = createRowStyles(theme, item.isCurrentUser);

    return (
        <View style={styles.row}>
            <PositionBadge position={item.position} theme={theme} />

            <Text style={styles.avatar}>{item.avatar}</Text>

            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.focusTime}>{item.focusTime} this week</Text>
            </View>

            <View style={styles.streakContainer}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.streakValue}>{item.streak}</Text>
            </View>
        </View>
    );
}

export default function LiveLeaderboard({ style }) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <GlassmorphismCard title="Live Leaderboard" style={style}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerLabel}>This Week's Top Performers</Text>
                <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Live</Text>
                </View>
            </View>

            {/* Leaderboard rows */}
            <View style={styles.list}>
                {leaderboardData.map((item) => (
                    <LeaderboardRow key={item.id} item={item} theme={theme} />
                ))}
            </View>
        </GlassmorphismCard>
    );
}

const createStyles = (theme) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    headerLabel: {
        fontSize: 12,
        color: theme.colors.textMuted,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.secondary,
        marginRight: theme.spacing.xs,
    },
    liveText: {
        fontSize: 11,
        color: theme.colors.secondary,
        fontWeight: '600',
    },
    list: {
        gap: theme.spacing.s,
    },
});

const createRowStyles = (theme, isCurrentUser) => StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        backgroundColor: isCurrentUser ? theme.colors.primaryLight : 'transparent',
        borderWidth: isCurrentUser ? 1 : 0,
        borderColor: theme.colors.primary + '40',
    },
    avatar: {
        fontSize: 24,
        marginLeft: theme.spacing.m,
    },
    info: {
        flex: 1,
        marginLeft: theme.spacing.m,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: isCurrentUser ? theme.colors.primary : theme.colors.text,
    },
    focusTime: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceSecondary,
        paddingHorizontal: theme.spacing.s,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.m,
    },
    streakIcon: {
        fontSize: 12,
    },
    streakValue: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.text,
        marginLeft: 4,
    },
});
