import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../services/ThemeContext';

export default function ProgressBar({
    percentage = 0,
    label,
    sublabel,
    time,
    color,
    showPercentage = true
}) {
    const { theme } = useTheme();
    const barColor = color || theme.colors.primary;
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.labelContainer}>
                    {showPercentage && (
                        <Text style={styles.percentage}>{percentage}%</Text>
                    )}
                    <View style={styles.labelWrapper}>
                        <View style={[styles.dot, { backgroundColor: barColor }]} />
                        <Text style={styles.label} numberOfLines={1}>{label}</Text>
                    </View>
                </View>
                {time && <Text style={styles.time}>{time}</Text>}
            </View>

            {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}

            <View style={styles.barBackground}>
                <View
                    style={[
                        styles.barFill,
                        { width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }
                    ]}
                />
            </View>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        marginBottom: theme.spacing.m,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    percentage: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        width: 36,
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: theme.spacing.s,
    },
    label: {
        fontSize: 13,
        color: theme.colors.text,
        fontWeight: '500',
        flex: 1,
    },
    sublabel: {
        fontSize: 11,
        color: theme.colors.textMuted,
        marginLeft: 44,
        marginBottom: theme.spacing.xs,
    },
    time: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    barBackground: {
        height: 4,
        backgroundColor: theme.colors.borderLight,
        borderRadius: 2,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 2,
    },
});
