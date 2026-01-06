import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { sessionApi } from '../services/api';
import { useAuth } from '../services/AuthContext';

const DURATION_OPTIONS = [
    { label: '25 min', value: 25 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
];

export default function SessionScreen({ navigation, route }) {
    const { user } = useAuth();
    const [phase, setPhase] = useState('setup'); // 'setup' or 'active'
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [taskName, setTaskName] = useState('');
    const [selectedDuration, setSelectedDuration] = useState(25);

    // Timer effect
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            handleComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const startSession = async () => {
        if (!taskName.trim()) {
            Alert.alert("Missing Task", "Please enter what you'll be working on.");
            return;
        }

        try {
            const response = await sessionApi.start(taskName.trim(), selectedDuration);
            setSessionId(response.data.id);
            setTimeLeft(selectedDuration * 60);
            setIsActive(true);
            setPhase('active');
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            Alert.alert("Error", "Could not start session. " + message);
        }
    };

    const handleComplete = async () => {
        try {
            await sessionApi.complete(sessionId, "Session completed successfully.");
            Alert.alert("Session Complete", "Great work! Your streak has been updated.");
            navigation.goBack();
        } catch (e) {
            Alert.alert("Error", "Failed to sync completion.");
            navigation.goBack();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleGiveUp = () => {
        const doAbandon = async () => {
            if (sessionId) {
                try {
                    await sessionApi.abandon(sessionId);
                } catch (e) {
                    console.error("Abandon API failed", e);
                }
            }
            navigation.goBack();
        };

        if (Platform.OS === 'web') {
            const confirm = window.confirm("Abandon Session?\n\nGiving up will mark this session as FAILED. Are you sure?");
            if (confirm) {
                doAbandon();
            }
            return;
        }

        Alert.alert(
            "Abandon Session?",
            "Giving up will mark this session as FAILED. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "I Give Up",
                    style: "destructive",
                    onPress: doAbandon
                }
            ]
        );
    };

    // Setup Phase
    if (phase === 'setup') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.statusText}>CONFIGURE SESSION</Text>
                </View>

                <View style={styles.setupContainer}>
                    <Text style={styles.label}>What will you focus on?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Deep Work, Coding, Study..."
                        placeholderTextColor="#666"
                        value={taskName}
                        onChangeText={setTaskName}
                        maxLength={60}
                    />

                    <Text style={[styles.label, { marginTop: 24 }]}>Duration</Text>
                    <View style={styles.durationContainer}>
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

                    <TouchableOpacity style={styles.startButton} onPress={startSession}>
                        <Text style={styles.startButtonText}>BEGIN SESSION</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Active Session Phase
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.statusText}>FOCUS MODE ENGAGED</Text>
            </View>

            <View style={styles.timerContainer}>
                <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
                <Text style={styles.taskLabel}>{taskName}</Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.warningText}>DO NOT LEAVE THIS SCREEN</Text>

                <TouchableOpacity style={styles.giveUpButton} onPress={handleGiveUp}>
                    <Text style={styles.giveUpText}>GIVE UP</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.m,
    },
    header: {
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    },
    statusText: {
        color: theme.colors.primary,
        fontSize: 16,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    setupContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.m,
    },
    label: {
        ...theme.typography.subHeader,
        marginBottom: theme.spacing.s,
    },
    input: {
        backgroundColor: theme.colors.surface,
        color: theme.colors.text,
        padding: theme.spacing.m,
        borderRadius: 8,
        fontSize: 18,
        borderWidth: 1,
        borderColor: theme.colors.gray,
    },
    durationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.s,
    },
    durationButton: {
        flex: 1,
        paddingVertical: theme.spacing.m,
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.gray,
        alignItems: 'center',
    },
    durationButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    durationText: {
        color: theme.colors.gray,
        fontSize: 16,
        fontWeight: '600',
    },
    durationTextActive: {
        color: theme.colors.text,
    },
    startButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.l,
        borderRadius: 8,
        marginTop: theme.spacing.xl,
        alignItems: 'center',
    },
    startButtonText: {
        ...theme.typography.button,
        fontSize: 20,
        letterSpacing: 2,
    },
    cancelButton: {
        paddingVertical: theme.spacing.m,
        marginTop: theme.spacing.m,
        alignItems: 'center',
    },
    cancelText: {
        color: theme.colors.gray,
        fontSize: 16,
    },
    timerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timer: {
        ...theme.typography.timer,
    },
    taskLabel: {
        ...theme.typography.body,
        marginTop: theme.spacing.m,
        fontSize: 24,
        textAlign: 'center',
    },
    footer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    warningText: {
        color: theme.colors.error,
        fontWeight: 'bold',
        marginBottom: theme.spacing.l,
        letterSpacing: 1,
    },
    giveUpButton: {
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.xl,
        borderWidth: 1,
        borderColor: theme.colors.error,
        borderRadius: 8,
    },
    giveUpText: {
        color: theme.colors.error,
        fontWeight: 'bold',
    },
});
