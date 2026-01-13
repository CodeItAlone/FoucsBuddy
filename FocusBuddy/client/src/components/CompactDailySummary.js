import React from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '../services/ThemeContext';

// Mini circular progress component
function MiniProgress({ percentage, label, color, theme }) {
    const size = 60;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    return (
        <View style={styles.miniProgressContainer}>
            <View style={[styles.progressRingContainer, { width: size, height: size }]}>
                {/* Background ring */}
                <View style={[styles.backgroundRing, {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: theme.colors.border,
                }]} />

                {/* For web, use CSS conic-gradient */}
                {Platform.OS === 'web' ? (
                    <View style={[styles.progressRing, {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        background: `conic-gradient(${color} ${percentage * 3.6}deg, transparent 0deg)`,
                        mask: `radial-gradient(farthest-side, transparent calc(100% - ${strokeWidth}px), #fff calc(100% - ${strokeWidth}px))`,
                        WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${strokeWidth}px), #fff calc(100% - ${strokeWidth}px))`,
                    }]} />
                ) : (
                    <View style={[styles.progressRing, {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: strokeWidth,
                        borderColor: color,
                        borderRightColor: 'transparent',
                        borderBottomColor: percentage > 50 ? color : 'transparent',
                        transform: [{ rotate: '-45deg' }],
                    }]} />
                )}

                {/* Center text */}
                <View style={styles.centerText}>
                    <Text style={[styles.percentageText, { color }]}>{Math.round(percentage)}%</Text>
                </View>
            </View>
            <Text style={[styles.labelText, { color: theme.colors.textSecondary }]}>{label}</Text>
        </View>
    );
}

export default function CompactDailySummary({ data }) {
    const { theme } = useTheme();
    const componentStyles = createStyles(theme);

    // Use data from prop if available
    const { totalFocusMinutes = 0, totalBreakMinutes = 0 } = data || {};

    // Convert to seconds for existing logic
    const focusSeconds = totalFocusMinutes * 60;
    const breakSeconds = totalBreakMinutes * 60;
    const meetingSeconds = 0; // Not yet tracked
    const otherSeconds = 0;
    const totalSeconds = focusSeconds + breakSeconds + meetingSeconds + otherSeconds;
    const goalSeconds = 8 * 3600; // Hardcoded daily goal for now

    // Calculate percentages safely
    const calculatePercentage = (seconds) => {
        return totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0;
    };

    const summaryData = [
        { label: 'Focus', percentage: calculatePercentage(focusSeconds), color: theme.colors.primary },
        { label: 'Meetings', percentage: calculatePercentage(meetingSeconds), color: theme.colors.chartOrange },
        { label: 'Breaks', percentage: calculatePercentage(breakSeconds), color: theme.colors.secondary },
        { label: 'Other', percentage: calculatePercentage(otherSeconds), color: theme.colors.chartBlue },
    ];

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const goalPercentage = goalSeconds > 0 ? Math.min(100, Math.round((totalSeconds / goalSeconds) * 100)) : 0;

    return (
        <View style={componentStyles.container}>
            {/* Header */}
            <View style={componentStyles.header}>
                <Text style={componentStyles.title}>Daily Summary</Text>
                <Text style={componentStyles.date}>Today</Text>
            </View>

            {/* Content Row */}
            <View style={componentStyles.contentRow}>
                {/* Progress Rings */}
                <View style={componentStyles.ringsRow}>
                    {summaryData.map((item, index) => (
                        <MiniProgress
                            key={index}
                            percentage={item.percentage}
                            label={item.label}
                            color={item.color}
                            theme={theme}
                        />
                    ))}
                </View>

                {/* Summary Stats */}
                <View style={componentStyles.statsSection}>
                    <View style={componentStyles.statItem}>
                        <Text style={componentStyles.statValue}>{formatTime(totalSeconds)}</Text>
                        <Text style={componentStyles.statLabel}>Total Time</Text>
                    </View>
                    <View style={componentStyles.statDivider} />
                    <View style={componentStyles.statItem}>
                        <Text style={[componentStyles.statValue, { color: theme.colors.secondary }]}>{goalPercentage}%</Text>
                        <Text style={componentStyles.statLabel}>of Goal</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    miniProgressContainer: {
        alignItems: 'center',
    },
    progressRingContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backgroundRing: {
        position: 'absolute',
    },
    progressRing: {
        position: 'absolute',
    },
    centerText: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    percentageText: {
        fontSize: 12,
        fontWeight: '700',
    },
    labelText: {
        fontSize: 11,
        marginTop: 4,
    },
});

const createStyles = (theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...(Platform.OS === 'web' ? {
            backdropFilter: 'blur(12px)',
            backgroundColor: theme.glass.background,
        } : {}),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    date: {
        fontSize: 12,
        color: theme.colors.textMuted,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ringsRow: {
        flexDirection: 'row',
        gap: theme.spacing.m,
    },
    statsSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceSecondary,
        borderRadius: theme.borderRadius.m,
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.l,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    statLabel: {
        fontSize: 11,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.spacing.m,
    },
});
