import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../services/ThemeContext';
import GlassmorphismCard from './GlassmorphismCard';

// Sample heatmap data (7 days x 4 weeks)
const generateHeatmapData = () => {
    const data = [];
    for (let week = 0; week < 4; week++) {
        const weekData = [];
        for (let day = 0; day < 7; day++) {
            weekData.push(Math.floor(Math.random() * 5)); // 0-4 intensity
        }
        data.push(weekData);
    }
    return data;
};

const heatmapData = generateHeatmapData();
const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function HeatmapCell({ value, theme }) {
    const getColor = () => {
        const colors = [
            theme.colors.border,           // 0 - no activity
            theme.colors.primaryLight,     // 1 - low
            theme.colors.primary + '80',   // 2 - medium-low
            theme.colors.primary + 'CC',   // 3 - medium-high
            theme.colors.primary,          // 4 - high
        ];
        return colors[value] || colors[0];
    };

    return (
        <View
            style={{
                width: 16,
                height: 16,
                borderRadius: 3,
                backgroundColor: getColor(),
                margin: 2,
            }}
        />
    );
}

export default function ProductivityHeatmap({ style }) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    // Calculate stats
    const totalSessions = heatmapData.flat().reduce((a, b) => a + b, 0);
    const avgPerDay = (totalSessions / 28).toFixed(1);

    return (
        <GlassmorphismCard title="Productivity Heatmap" style={style}>
            {/* Stats row */}
            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{totalSessions}</Text>
                    <Text style={styles.statLabel}>Sessions</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{avgPerDay}</Text>
                    <Text style={styles.statLabel}>Avg/Day</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>4</Text>
                    <Text style={styles.statLabel}>Week Streak</Text>
                </View>
            </View>

            {/* Day labels */}
            <View style={styles.dayLabels}>
                {dayLabels.map((day, index) => (
                    <Text key={index} style={styles.dayLabel}>{day}</Text>
                ))}
            </View>

            {/* Heatmap grid */}
            <View style={styles.heatmapContainer}>
                {heatmapData.map((week, weekIndex) => (
                    <View key={weekIndex} style={styles.weekRow}>
                        {week.map((value, dayIndex) => (
                            <HeatmapCell key={dayIndex} value={value} theme={theme} />
                        ))}
                    </View>
                ))}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <Text style={styles.legendLabel}>Less</Text>
                {[0, 1, 2, 3, 4].map((value) => (
                    <HeatmapCell key={value} value={value} theme={theme} />
                ))}
                <Text style={styles.legendLabel}>More</Text>
            </View>
        </GlassmorphismCard>
    );
}

const createStyles = (theme) => StyleSheet.create({
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: theme.spacing.l,
        paddingBottom: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    statLabel: {
        fontSize: 11,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    dayLabels: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: theme.spacing.xs,
        paddingHorizontal: 2,
    },
    dayLabel: {
        width: 20,
        fontSize: 10,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
    heatmapContainer: {
        alignItems: 'center',
    },
    weekRow: {
        flexDirection: 'row',
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.m,
        gap: 4,
    },
    legendLabel: {
        fontSize: 10,
        color: theme.colors.textMuted,
        marginHorizontal: theme.spacing.xs,
    },
});
