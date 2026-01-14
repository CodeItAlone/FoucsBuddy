import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated, Platform } from 'react-native';
import { useTheme } from '../services/ThemeContext';
import { sessionApi } from '../services/api';

const DURATION_OPTIONS = [
    { label: '25 min', value: 25 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
];

export default function InlineSession({ onSessionChange }) {
    const { theme } = useTheme();
    const [phase, setPhase] = useState('idle'); // idle, setup, active, completed
    const [taskName, setTaskName] = useState('');
    const [selectedDuration, setSelectedDuration] = useState(25);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;
    const timerRef = useRef(null);

    const styles = createStyles(theme, phase);

    // Pulsing animation for idle state
    useEffect(() => {
        if (phase === 'idle') {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                ])
            );
            const glow = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 0.6, duration: 1500, useNativeDriver: false }),
                    Animated.timing(glowAnim, { toValue: 0.3, duration: 1500, useNativeDriver: false }),
                ])
            );
            pulse.start();
            glow.start();
            return () => { pulse.stop(); glow.stop(); };
        }
    }, [phase]);

    // Timer countdown
    useEffect(() => {
        if (phase === 'active' && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timerRef.current);
        }
    }, [phase]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleStartClick = useCallback(() => {
        setPhase('setup');
        setError('');
    }, []);

    const handleBeginSession = useCallback(async () => {
        if (!taskName.trim()) {
            setError('Please enter a task name');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('Initiating backend session start...');
            console.log('Payload:', { task: taskName.trim(), duration: selectedDuration });

            // CRITICAL: Call backend and wait for success
            const response = await sessionApi.start(taskName.trim(), selectedDuration);

            console.log('Backend response success:', response.status, response.data);
            setSessionId(response.data.id);

            // ONLY start timer if backend succeeds
            setTimeLeft(selectedDuration * 60);
            setPhase('active');
            onSessionChange?.('active');
        } catch (err) {
            console.error('Backend API failed to start session:', err);
            // DO NOT start local timer on failure
            setError(err.response?.data?.message || 'Failed to start session. Check network connection.');
        } finally {
            setIsLoading(false);
        }
    }, [taskName, selectedDuration, onSessionChange]);

    const handleComplete = useCallback(async () => {
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            if (sessionId) {
                // Use new API format: end(id, reflection, status)
                await sessionApi.end(sessionId, 'Session completed successfully.', 'COMPLETED');
            }
        } catch (err) {
            console.error('Failed to complete session:', err);
        }

        setPhase('completed');
        onSessionChange?.('completed');

        // Auto-reset after showing completion
        setTimeout(() => {
            resetSession();
        }, 3000);
    }, [sessionId, onSessionChange]);

    const handleEndSession = useCallback(async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsLoading(true);

        try {
            if (sessionId) {
                // Use new API format: end(id, reflection, status)
                await sessionApi.end(sessionId, null, 'ABORTED');
            }
        } catch (err) {
            console.error('Failed to abandon session:', err);
        }

        resetSession();
        setIsLoading(false);
        onSessionChange?.('ended');
    }, [sessionId, onSessionChange]);

    const resetSession = useCallback(() => {
        setPhase('idle');
        setTaskName('');
        setSelectedDuration(25);
        setTimeLeft(25 * 60);
        setSessionId(null);
        setError('');
    }, []);

    const handleCancel = useCallback(() => {
        resetSession();
    }, [resetSession]);

    // IDLE STATE - Show glowing button
    if (phase === 'idle') {
        return (
            <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
                <Animated.View style={[styles.glowOuter, { opacity: glowAnim }]} />
                <TouchableOpacity
                    style={styles.idleButton}
                    onPress={handleStartClick}
                    activeOpacity={0.8}
                >
                    <Text style={styles.timerIcon}>⏱️</Text>
                    <Text style={styles.idleButtonText}>START FOCUS SESSION</Text>
                    <Text style={styles.sublabel}>Click to begin a productivity session</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    // SETUP STATE - Show configuration form
    if (phase === 'setup') {
        return (
            <View style={styles.setupContainer}>
                <Text style={styles.setupTitle}>Configure Session</Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TextInput
                    style={styles.input}
                    placeholder="What will you focus on?"
                    placeholderTextColor={theme.colors.textMuted}
                    value={taskName}
                    onChangeText={setTaskName}
                    maxLength={60}
                    autoFocus
                />

                <View style={styles.durationRow}>
                    {DURATION_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.durationButton,
                                selectedDuration === option.value && styles.durationButtonActive
                            ]}
                            onPress={() => setSelectedDuration(option.value)}
                        >
                            <Text style={[
                                styles.durationText,
                                selectedDuration === option.value && styles.durationTextActive
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.setupActions}>
                    <TouchableOpacity
                        style={[styles.beginButton, isLoading && styles.buttonDisabled]}
                        onPress={handleBeginSession}
                        disabled={isLoading}
                    >
                        <Text style={styles.beginButtonText}>
                            {isLoading ? 'Starting...' : 'BEGIN SESSION'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ACTIVE STATE - Show timer
    if (phase === 'active') {
        const progress = 1 - (timeLeft / (selectedDuration * 60));

        return (
            <View style={styles.activeContainer}>
                <View style={styles.timerRing}>
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                    <Text style={styles.taskText}>{taskName}</Text>
                </View>

                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>

                <Text style={styles.focusMessage}>🔥 Stay focused! You're doing great.</Text>

                <TouchableOpacity
                    style={[styles.endButton, isLoading && styles.buttonDisabled]}
                    onPress={handleEndSession}
                    disabled={isLoading}
                >
                    <Text style={styles.endButtonText}>
                        {isLoading ? 'Ending...' : 'END SESSION'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // COMPLETED STATE - Show success
    if (phase === 'completed') {
        return (
            <View style={styles.completedContainer}>
                <Text style={styles.completedIcon}>🎉</Text>
                <Text style={styles.completedTitle}>Session Complete!</Text>
                <Text style={styles.completedSubtitle}>Great work on "{taskName}"</Text>
            </View>
        );
    }

    return null;
}

const createStyles = (theme, phase) => StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: theme.spacing.l,
    },
    glowOuter: {
        position: 'absolute',
        width: 320,
        height: 140,
        borderRadius: theme.borderRadius.xxl,
        backgroundColor: theme.colors.primary,
        ...(Platform.OS === 'web' ? { filter: 'blur(40px)' } : {}),
    },
    idleButton: {
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
    idleButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary,
        letterSpacing: 2,
    },
    sublabel: {
        marginTop: theme.spacing.s,
        fontSize: 12,
        color: theme.colors.textMuted,
    },

    // Setup styles
    setupContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.l,
        marginVertical: theme.spacing.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
    setupTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.m,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 13,
        textAlign: 'center',
        marginBottom: theme.spacing.m,
    },
    input: {
        backgroundColor: theme.colors.surfaceSecondary,
        color: theme.colors.text,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    durationRow: {
        flexDirection: 'row',
        marginTop: theme.spacing.m,
        gap: theme.spacing.s,
    },
    durationButton: {
        flex: 1,
        paddingVertical: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    durationButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    durationText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    durationTextActive: {
        color: '#FFFFFF',
    },
    setupActions: {
        marginTop: theme.spacing.l,
    },
    beginButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
    },
    beginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
    cancelButton: {
        paddingVertical: theme.spacing.m,
        alignItems: 'center',
    },
    cancelText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    buttonDisabled: {
        opacity: 0.6,
    },

    // Active styles
    activeContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        marginVertical: theme.spacing.l,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
        ...theme.shadows.glow,
    },
    timerRing: {
        alignItems: 'center',
        marginBottom: theme.spacing.l,
    },
    timerText: {
        fontSize: 56,
        fontWeight: '700',
        color: theme.colors.primary,
        fontVariant: ['tabular-nums'],
    },
    taskText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.s,
    },
    progressBar: {
        width: '100%',
        height: 6,
        backgroundColor: theme.colors.border,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: theme.spacing.m,
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.secondary,
        borderRadius: 3,
    },
    focusMessage: {
        fontSize: 14,
        color: theme.colors.secondary,
        marginBottom: theme.spacing.l,
    },
    endButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.error,
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.m,
    },
    endButtonText: {
        color: theme.colors.error,
        fontSize: 14,
        fontWeight: '600',
    },

    // Completed styles
    completedContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        marginVertical: theme.spacing.l,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.secondary,
    },
    completedIcon: {
        fontSize: 48,
        marginBottom: theme.spacing.m,
    },
    completedTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.secondary,
    },
    completedSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.s,
    },
});
