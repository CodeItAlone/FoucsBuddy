import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../services/ThemeContext';

// Enhanced activity data
const activities = [
    { start: 9, duration: 0.75, type: 'focus', task: 'Deep Work - API' },
    { start: 10, duration: 1.5, type: 'focus', task: 'Code Review' },
    { start: 12, duration: 0.5, type: 'break', task: 'Lunch' },
    { start: 13, duration: 2, type: 'focus', task: 'UI Implementation' },
    { start: 15.5, duration: 0.5, type: 'meeting', task: 'Team Standup' },
    { start: 16, duration: 1.5, type: 'focus', task: 'Bug Fixes' },
    { start: 18, duration: 0.5, type: 'break', task: 'Coffee Break' },
    { start: 18.5, duration: 1, type: 'focus', task: 'Documentation' },
];

const timeLabels = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export default function InteractiveTimeline({ currentTime = 19.5 }) {
    const { theme } = useTheme();
    const [hoveredActivity, setHoveredActivity] = useState(null);
    const styles = createStyles(theme);

    const startHour = 9;
    const endHour = 20;
    const totalHours = endHour - startHour;

    const getPosition = (hour) => ((hour - startHour) / totalHours) * 100;
    const getWidth = (duration) => (duration / totalHours) * 100;

    const getActivityColor = (type) => {
        switch (type) {
            case 'focus': return theme.colors.primary;
            case 'break': return theme.colors.secondary;
            case 'meeting': return theme.colors.chartOrange;
            default: return theme.colors.border;
        }
    };

    const getActivityGlow = (type) => {
        if (Platform.OS !== 'web') return {};
        const color = getActivityColor(type);
        return {
            boxShadow: `0 0 12px ${color}80`,
        };
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Activity Timeline</Text>
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                        <Text style={styles.legendText}>Focus</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: theme.colors.secondary }]} />
                        <Text style={styles.legendText}>Break</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: theme.colors.chartOrange }]} />
                        <Text style={styles.legendText}>Meeting</Text>
                    </View>
                </View>
            </View>

            {/* Timeline track */}
            <View style={styles.timelineContainer}>
                {/* Background track */}
                <View style={styles.track}>
                    {/* Activity blocks */}
                    {activities.map((activity, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.activityBlock,
                                {
                                    left: `${getPosition(activity.start)}%`,
                                    width: `${getWidth(activity.duration)}%`,
                                    backgroundColor: getActivityColor(activity.type),
                                    ...(Platform.OS === 'web' ? getActivityGlow(activity.type) : {}),
                                },
                                hoveredActivity === index && styles.activityBlockHovered,
                            ]}
                            onPress={() => setHoveredActivity(hoveredActivity === index ? null : index)}
                            activeOpacity={0.8}
                        >
                            {hoveredActivity === index && (
                                <View style={styles.tooltip}>
                                    <Text style={styles.tooltipText}>{activity.task}</Text>
                                    <Text style={styles.tooltipTime}>
                                        {Math.floor(activity.start)}:{(activity.start % 1) * 60 || '00'} -
                                        {Math.floor(activity.start + activity.duration)}:{((activity.start + activity.duration) % 1) * 60 || '00'}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}

                    {/* Current time indicator */}
                    <View style={[styles.currentTimeMarker, { left: `${getPosition(currentTime)}%` }]}>
                        <View style={styles.currentTimeLine} />
                        <View style={styles.currentTimeLabel}>
                            <Text style={styles.currentTimeText}>
                                {Math.floor(currentTime)}:{String(Math.round((currentTime % 1) * 60)).padStart(2, '0')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Time axis */}
                <View style={styles.timeAxis}>
                    {timeLabels.map((label, index) => (
                        <View
                            key={label}
                            style={[styles.timeLabelContainer, { left: `${(index / (timeLabels.length - 1)) * 100}%` }]}
                        >
                            <Text style={styles.timeLabel}>{label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Stats bar */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>6h 45m</Text>
                    <Text style={styles.statLabel}>Focus Time</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>1h 00m</Text>
                    <Text style={styles.statLabel}>Breaks</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>30m</Text>
                    <Text style={styles.statLabel}>Meetings</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.colors.secondary }]}>82%</Text>
                    <Text style={styles.statLabel}>Productivity</Text>
                </View>
            </View>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        marginBottom: theme.spacing.l,
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
    legend: {
        flexDirection: 'row',
        gap: theme.spacing.m,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: theme.spacing.xs,
    },
    legendText: {
        fontSize: 11,
        color: theme.colors.textMuted,
    },
    timelineContainer: {
        position: 'relative',
        height: 80,
    },
    track: {
        height: 48,
        backgroundColor: theme.colors.surfaceSecondary,
        borderRadius: theme.borderRadius.m,
        position: 'relative',
        overflow: 'visible',
    },
    activityBlock: {
        position: 'absolute',
        top: 8,
        height: 32,
        borderRadius: theme.borderRadius.s,
        minWidth: 4,
    },
    activityBlockHovered: {
        zIndex: 10,
    },
    tooltip: {
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: [{ translateX: -50 }],
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.s,
        padding: theme.spacing.s,
        marginBottom: theme.spacing.xs,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minWidth: 100,
        ...theme.shadows.medium,
    },
    tooltipText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.text,
    },
    tooltipTime: {
        fontSize: 10,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    currentTimeMarker: {
        position: 'absolute',
        top: 0,
        height: '100%',
        alignItems: 'center',
        zIndex: 20,
    },
    currentTimeLine: {
        width: 2,
        height: '100%',
        backgroundColor: theme.colors.text,
    },
    currentTimeLabel: {
        position: 'absolute',
        bottom: -24,
        backgroundColor: theme.colors.text,
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.s,
    },
    currentTimeText: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.colors.background,
    },
    timeAxis: {
        position: 'relative',
        height: 24,
        marginTop: 8,
    },
    timeLabelContainer: {
        position: 'absolute',
        transform: [{ translateX: -15 }],
    },
    timeLabel: {
        fontSize: 10,
        color: theme.colors.textMuted,
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: theme.spacing.l,
        paddingTop: theme.spacing.m,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    statLabel: {
        fontSize: 11,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
});
