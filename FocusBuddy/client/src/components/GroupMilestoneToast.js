import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useTheme } from '../services/ThemeContext';

export default function GroupMilestoneToast({
    visible,
    memberName,
    memberAvatar,
    duration = '1 hour',
    onHighFive,
    onDismiss
}) {
    const { theme } = useTheme();
    const slideAnim = useRef(new Animated.Value(400)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const styles = createStyles(theme);

    useEffect(() => {
        if (visible) {
            // Slide in
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 80,
                    friction: 12,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto dismiss after 8 seconds
            const timer = setTimeout(() => {
                handleDismiss();
            }, 8000);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 400,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss?.();
        });
    };

    const handleHighFive = () => {
        onHighFive?.();
        handleDismiss();
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateX: slideAnim }],
                    opacity: opacityAnim,
                }
            ]}
        >
            {/* Glow effect */}
            <View style={styles.glowBackground} />

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.celebrationIcon}>🎉</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
                        <Text style={styles.closeText}>×</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.messageSection}>
                    <Text style={styles.avatar}>{memberAvatar || '👨‍💻'}</Text>
                    <View style={styles.messageContent}>
                        <Text style={styles.memberName}>{memberName}</Text>
                        <Text style={styles.achievement}>completed a {duration} focus session!</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.highFiveButton} onPress={handleHighFive}>
                    <Text style={styles.highFiveIcon}>🙌</Text>
                    <Text style={styles.highFiveText}>High Five</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        position: 'absolute',
        top: 100,
        right: theme.spacing.l,
        width: 300,
        zIndex: 1000,
        ...(Platform.OS === 'web' ? {
            position: 'fixed',
        } : {}),
    },
    glowBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.colors.primary,
        opacity: 0.15,
        borderRadius: theme.borderRadius.xl,
        ...(Platform.OS === 'web' ? {
            filter: 'blur(20px)',
        } : {}),
    },
    content: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.l,
        borderWidth: 1,
        borderColor: theme.colors.primary + '40',
        ...theme.shadows.medium,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    celebrationIcon: {
        fontSize: 24,
    },
    closeButton: {
        padding: theme.spacing.xs,
    },
    closeText: {
        fontSize: 24,
        color: theme.colors.textMuted,
        lineHeight: 24,
    },
    messageSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.l,
    },
    avatar: {
        fontSize: 36,
        marginRight: theme.spacing.m,
    },
    messageContent: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    achievement: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    highFiveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        ...theme.shadows.glow,
    },
    highFiveIcon: {
        fontSize: 20,
        marginRight: theme.spacing.s,
    },
    highFiveText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
