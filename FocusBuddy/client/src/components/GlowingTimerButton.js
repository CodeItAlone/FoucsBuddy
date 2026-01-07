import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { useTheme } from '../services/ThemeContext';

export default function GlowingTimerButton({ onPress, label = 'START FOCUS SESSION' }) {
    const { theme } = useTheme();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        // Pulsing animation
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.02,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        );

        // Glow animation
        const glow = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 0.6,
                    duration: 1500,
                    useNativeDriver: false,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.3,
                    duration: 1500,
                    useNativeDriver: false,
                }),
            ])
        );

        pulse.start();
        glow.start();

        return () => {
            pulse.stop();
            glow.stop();
        };
    }, []);

    const styles = createStyles(theme);

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
            {/* Outer glow effect */}
            <Animated.View
                style={[
                    styles.glowOuter,
                    { opacity: glowAnim }
                ]}
            />

            {/* Inner glow */}
            <View style={styles.glowInner} />

            {/* Main button */}
            <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
                <Text style={styles.timerIcon}>⏱️</Text>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.sublabel}>Click to begin a productivity session</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: theme.spacing.xl,
    },
    glowOuter: {
        position: 'absolute',
        width: 320,
        height: 140,
        borderRadius: theme.borderRadius.xxl,
        backgroundColor: theme.colors.primary,
        ...(Platform.OS === 'web' ? {
            filter: 'blur(40px)',
        } : {}),
    },
    glowInner: {
        position: 'absolute',
        width: 280,
        height: 100,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.colors.primary,
        opacity: 0.2,
        ...(Platform.OS === 'web' ? {
            filter: 'blur(20px)',
        } : {}),
    },
    button: {
        backgroundColor: theme.colors.surface,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        borderRadius: theme.borderRadius.xl,
        paddingVertical: theme.spacing.l,
        paddingHorizontal: theme.spacing.xxl,
        alignItems: 'center',
        minWidth: 280,
        ...theme.shadows.glow,
    },
    timerIcon: {
        fontSize: 32,
        marginBottom: theme.spacing.s,
    },
    label: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    sublabel: {
        marginTop: theme.spacing.s,
        fontSize: 12,
        color: theme.colors.textMuted,
    },
});
