import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../services/ThemeContext';

// Helper to transform backend session data to chart format
const transformSessionsToActivities = (sessions) => {
    if (!sessions) return [];

    return sessions.map(session => {
        const startDate = new Date(session.startedAt);
        const startHour = startDate.getHours() + (startDate.getMinutes() / 60);

        // duration in seconds -> hours
        // If session is active (no actualDuration yet), we might want to show planned duration or time elapsed
        // but backend returns actualDuration which is 0 if not ended.
        // For simplicity, let's look at plannedDuration if actual is 0 (or undefined) AND status is not ENDED?
        // Actually, for history, we want completed sessions. 
        // If session is ended, actualDuration > 0 usually.

        // Let's assume actualDuration is populated for ended sessions.
        // The service logic sets actualDuration on END.

        const durationHours = (session.actualDuration || 0) / 3600;

        return {
            start: startHour,
            duration: Math.max(durationHours, 0.1), // Minimum width
            type: session.sessionType?.toLowerCase() || 'focus',
            task: session.taskDescription || 'Session'
        };
    });
};

const timeLabels = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export default function InteractiveTimeline({ currentTime = new Date().getHours() + new Date().getMinutes() / 60, sessions }) {
    const { theme } = useTheme();
    const [hoveredActivity, setHoveredActivity] = useState(null);
    const styles = createStyles(theme);

    const activities = React.useMemo(() => transformSessionsToActivities(sessions), [sessions]);

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

    // Compute stats from sessions data
    const computeStats = React.useMemo(() => {
        if (!sessions || sessions.length === 0) {
            return { focusTime: 0, breakTime: 0, meetingTime: 0, productivity: 0 };
        }

        let focusSeconds = 0;
        let breakSeconds = 0;
        let meetingSeconds = 0;

        sessions.forEach(session => {
            const duration = session.actualDuration || 0;
            const type = (session.sessionType || '').toLowerCase();

            if (type === 'focus') {
                focusSeconds += duration;
            } else if (type === 'break') {
                breakSeconds += duration;
            } else if (type === 'meeting') {
                meetingSeconds += duration;
            }
        });

        const totalActive = focusSeconds + breakSeconds + meetingSeconds;
        const productivity = totalActive > 0 ? Math.round((focusSeconds / totalActive) * 100) : 0;

        return { focusSeconds, breakSeconds, meetingSeconds, productivity };
    }, [sessions]);

    const formatDuration = (seconds) => {
        if (!seconds || isNaN(seconds) || seconds <= 0) {
            return '0m';
        }
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
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
                    <Text style={styles.statValue}>{formatDuration(computeStats.focusSeconds)}</Text>
                    <Text style={styles.statLabel}>Focus Time</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formatDuration(computeStats.breakSeconds)}</Text>
                    <Text style={styles.statLabel}>Breaks</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formatDuration(computeStats.meetingSeconds)}</Text>
                    <Text style={styles.statLabel}>Meetings</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.colors.secondary }]}>{computeStats.productivity}%</Text>
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
