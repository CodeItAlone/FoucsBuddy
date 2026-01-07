import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../services/ThemeContext';

// Mini circular progress component
function MiniProgress({ percentage, label, color, theme }) {
    const size = 60;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
                    <Text style={[styles.percentageText, { color }]}>{percentage}%</Text>
                </View>
            </View>
            <Text style={[styles.labelText, { color: theme.colors.textSecondary }]}>{label}</Text>
        </View>
    );
}

export default function CompactDailySummary() {
    const { theme } = useTheme();
    const componentStyles = createStyles(theme);

    const summaryData = [
        { label: 'Focus', percentage: 62, color: theme.colors.primary },
        { label: 'Meetings', percentage: 15, color: theme.colors.chartOrange },
        { label: 'Breaks', percentage: 11, color: theme.colors.secondary },
        { label: 'Other', percentage: 12, color: theme.colors.chartBlue },
    ];

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
                        <Text style={componentStyles.statValue}>6h 45m</Text>
                        <Text style={componentStyles.statLabel}>Total Time</Text>
                    </View>
                    <View style={componentStyles.statDivider} />
                    <View style={componentStyles.statItem}>
                        <Text style={[componentStyles.statValue, { color: theme.colors.secondary }]}>79%</Text>
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
