import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Image } from 'react-native';
import { useTheme } from '../services/ThemeContext';

export default function QuickActionHeader({
    isSessionActive,
    timeLeft,
    onStartSession,
    onEndSession,
    taskName
}) {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const scrollY = useRef(new Animated.Value(0)).current;
    const [isCompact, setIsCompact] = useState(false);

    const styles = createStyles(theme, isCompact, isDarkMode);

    const formatTime = (seconds) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View style={styles.container}>
            {/* Left: Brand */}
            <View style={styles.brandSection}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.brandIcon}
                    resizeMode="contain"
                />
                <Text style={styles.brandName}>FocusBuddy</Text>
            </View>

            {/* Center: Timer (when active) */}
            {isSessionActive && (
                <View style={styles.timerSection}>
                    <View style={styles.timerPill}>
                        <View style={styles.timerDot} />
                        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                        {taskName && <Text style={styles.timerTask} numberOfLines={1}>• {taskName}</Text>}
                    </View>
                </View>
            )}

            {/* Right: Theme Toggle + End Button */}
            <View style={styles.actionSection}>
                {/* Theme Toggle Button */}
                <TouchableOpacity
                    style={styles.themeButton}
                    onPress={toggleTheme}
                    activeOpacity={0.8}
                >
                    <Text style={styles.themeIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
                    <Text style={styles.themeText}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</Text>
                </TouchableOpacity>

                {/* End Button (only when session active) */}
                {isSessionActive && (
                    <TouchableOpacity
                        style={styles.endButton}
                        onPress={onEndSession}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.endButtonText}>End</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const createStyles = (theme, isCompact) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.l,
        paddingVertical: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        ...(Platform.OS === 'web' ? {
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(12px)',
            backgroundColor: theme.glass.background,
        } : {}),
    },
    brandSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandIcon: {
        width: 32,
        height: 32,
        marginRight: theme.spacing.s,
    },
    brandName: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    timerSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.m,
    },
    timerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.round,
        borderWidth: 1,
        borderColor: theme.colors.primary + '40',
    },
    timerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
        marginRight: theme.spacing.s,
    },
    timerText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
        fontVariant: ['tabular-nums'],
    },
    timerTask: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing.s,
        maxWidth: 120,
    },
    actionSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    themeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceSecondary,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    themeIcon: {
        fontSize: 16,
        marginRight: theme.spacing.s,
    },
    themeText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
        ...theme.shadows.glow,
    },
    startIcon: {
        fontSize: 16,
        color: '#FFFFFF',
        marginRight: 6,
        fontWeight: '700',
    },
    startText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    endButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.error,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
    },
    endButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.error,
    },
});
