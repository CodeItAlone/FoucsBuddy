import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../services/ThemeContext';

export default function CircularProgress({
    percentage = 0,
    label,
    color,
    size = 70
}) {
    const { theme } = useTheme();
    const progressColor = color || theme.colors.primary;
    const styles = createStyles(theme, size, progressColor);

    // Calculate stroke properties
    const strokeWidth = size * 0.12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <View style={styles.container}>
            <View style={styles.circleContainer}>
                {/* Background circle */}
                <View style={styles.backgroundCircle} />

                {/* Progress arc using border trick */}
                <View style={styles.progressWrapper}>
                    <View
                        style={[
                            styles.progressCircle,
                            {
                                borderTopColor: progressColor,
                                borderRightColor: percentage > 25 ? progressColor : 'transparent',
                                borderBottomColor: percentage > 50 ? progressColor : 'transparent',
                                borderLeftColor: percentage > 75 ? progressColor : 'transparent',
                                transform: [{ rotate: `${(percentage / 100) * 360 - 90}deg` }],
                            }
                        ]}
                    />
                </View>

                {/* Percentage text */}
                <View style={styles.textContainer}>
                    <Text style={styles.percentageText}>{percentage}%</Text>
                </View>
            </View>

            {label && <Text style={styles.label}>{label}</Text>}
        </View>
    );
}

// Simple circular progress with SVG-like appearance using views
export function CircularProgressSimple({
    percentage = 0,
    label,
    color,
    size = 70
}) {
    const { theme } = useTheme();
    const progressColor = color || theme.colors.primary;
    const styles = createStyles(theme, size, progressColor);

    return (
        <View style={styles.container}>
            <View style={[styles.simpleCircle, { borderColor: theme.colors.borderLight }]}>
                <View
                    style={[
                        styles.simpleProgress,
                        {
                            borderColor: progressColor,
                            borderTopColor: progressColor,
                            borderRightColor: percentage > 25 ? progressColor : theme.colors.borderLight,
                            borderBottomColor: percentage > 50 ? progressColor : theme.colors.borderLight,
                            borderLeftColor: percentage > 75 ? progressColor : theme.colors.borderLight,
                        }
                    ]}
                />
                <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
            {label && <Text style={styles.label}>{label}</Text>}
        </View>
    );
}

const createStyles = (theme, size, progressColor) => StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    circleContainer: {
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundCircle: {
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: size * 0.08,
        borderColor: theme.colors.borderLight,
    },
    progressWrapper: {
        position: 'absolute',
        width: size,
        height: size,
    },
    progressCircle: {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: size * 0.08,
        borderColor: 'transparent',
    },
    textContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentageText: {
        fontSize: size * 0.22,
        fontWeight: '700',
        color: theme.colors.text,
    },
    label: {
        marginTop: theme.spacing.s,
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    simpleCircle: {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: size * 0.08,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
    },
    simpleProgress: {
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: size * 0.08,
    },
});
