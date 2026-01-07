import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../services/ThemeContext';

// Sample activity data for demonstration
const sampleActivities = [
    { start: 9, duration: 0.5, color: '#7C3AED', type: 'focus' },
    { start: 10, duration: 1.5, color: '#7C3AED', type: 'focus' },
    { start: 11.5, duration: 1, color: '#7C3AED', type: 'focus' },
    { start: 13, duration: 0.5, color: '#10B981', type: 'break' },
    { start: 14, duration: 1.5, color: '#7C3AED', type: 'focus' },
    { start: 15.5, duration: 0.5, color: '#F59E0B', type: 'meeting' },
    { start: 16, duration: 1, color: '#7C3AED', type: 'focus' },
    { start: 17, duration: 0.5, color: '#10B981', type: 'break' },
    { start: 17.5, duration: 1.5, color: '#7C3AED', type: 'focus' },
];

const timeLabels = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

export default function TimelineChart({ activities = sampleActivities, currentTime = 19.7 }) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const startHour = 9;
    const endHour = 20;
    const totalHours = endHour - startHour;

    const getPositionPercent = (hour) => {
        return ((hour - startHour) / totalHours) * 100;
    };

    const getWidthPercent = (duration) => {
        return (duration / totalHours) * 100;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Timeline</Text>

            {/* Main activity blocks */}
            <View style={styles.mainTrack}>
                {activities.filter(a => a.type === 'focus').map((activity, index) => (
                    <View
                        key={`main-${index}`}
                        style={[
                            styles.activityBlock,
                            {
                                left: `${getPositionPercent(activity.start)}%`,
                                width: `${getWidthPercent(activity.duration)}%`,
                                backgroundColor: activity.color,
                            }
                        ]}
                    />
                ))}
            </View>

            {/* Secondary track for breaks/meetings */}
            <View style={styles.secondaryTrack}>
                {activities.filter(a => a.type !== 'focus').map((activity, index) => (
                    <View
                        key={`secondary-${index}`}
                        style={[
                            styles.secondaryBlock,
                            {
                                left: `${getPositionPercent(activity.start)}%`,
                                width: `${getWidthPercent(activity.duration)}%`,
                                backgroundColor: activity.color,
                            }
                        ]}
                    />
                ))}
            </View>

            {/* Time axis */}
            <View style={styles.timeAxis}>
                {timeLabels.map((label, index) => (
                    <View
                        key={label}
                        style={[
                            styles.timeLabelContainer,
                            { left: `${(index / (timeLabels.length - 1)) * 100}%` }
                        ]}
                    >
                        <View style={styles.tickMark} />
                        <Text style={styles.timeLabel}>{label}</Text>
                    </View>
                ))}
            </View>

            {/* Current time indicator */}
            <View
                style={[
                    styles.currentTimeIndicator,
                    { left: `${getPositionPercent(currentTime)}%` }
                ]}
            >
                <View style={styles.currentTimeLine} />
                <View style={styles.currentTimeBox}>
                    <Text style={styles.currentTimeText}>
                        {Math.floor(currentTime)}:{String(Math.round((currentTime % 1) * 60)).padStart(2, '0')}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        marginBottom: theme.spacing.l,
        paddingBottom: theme.spacing.xl,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.m,
    },
    mainTrack: {
        height: 40,
        backgroundColor: theme.colors.surfaceSecondary,
        borderRadius: theme.borderRadius.s,
        marginBottom: theme.spacing.xs,
        position: 'relative',
        overflow: 'hidden',
    },
    activityBlock: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        borderRadius: theme.borderRadius.s,
    },
    secondaryTrack: {
        height: 8,
        position: 'relative',
        marginBottom: theme.spacing.m,
    },
    secondaryBlock: {
        position: 'absolute',
        height: 8,
        borderRadius: 4,
    },
    timeAxis: {
        height: 30,
        position: 'relative',
        marginTop: theme.spacing.s,
    },
    timeLabelContainer: {
        position: 'absolute',
        alignItems: 'center',
        transform: [{ translateX: -20 }],
    },
    tickMark: {
        width: 1,
        height: 6,
        backgroundColor: theme.colors.border,
        marginBottom: 4,
    },
    timeLabel: {
        fontSize: 11,
        color: theme.colors.textMuted,
    },
    currentTimeIndicator: {
        position: 'absolute',
        top: 24,
        alignItems: 'center',
        transform: [{ translateX: -1 }],
    },
    currentTimeLine: {
        width: 2,
        height: 55,
        backgroundColor: theme.colors.text,
    },
    currentTimeBox: {
        backgroundColor: theme.colors.text,
        paddingHorizontal: theme.spacing.s,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.s,
        marginTop: 2,
    },
    currentTimeText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.background,
    },
});
