import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { sessionApi } from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function SessionScreen({ navigation, route }) {
    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [isActive, setIsActive] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [taskName, setTaskName] = useState('Deep Work');

    useEffect(() => {
        // Start Session on Mount
        const startSession = async () => {
            try {
                const task = "Deep Work"; // Hardcoded for MVP or passed via route params
                setTaskName(task);
                const duration = 25; // Minutes
                setTimeLeft(duration * 60);

                const response = await sessionApi.start(user.id, task, duration);
                setSessionId(response.data.id);
                setIsActive(true);
            } catch (error) {
                Alert.alert("Error", "Could not start session. " + error.message);
                navigation.goBack();
            }
        };

        if (user && !sessionId) {
            startSession();
        }
    }, [user]);

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

    const handleComplete = async () => {
        try {
            await sessionApi.complete(sessionId, "Session completed successfully.");
            Alert.alert("Session Complete", "Great work! Streak updated.");
            navigation.goBack();
        } catch (e) {
            Alert.alert("Error", "Failed to sync completion.");
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleGiveUp = () => {
        console.log("handleGiveUp called. SessionId:", sessionId);

        // Web compatibility check
        if (Platform.OS === 'web') {
            const confirm = window.confirm("Abandon Session? Giving up will mark this session as FAILED and reset your streak. Are you sure?");
            if (confirm) {
                console.log("User confirmed abandon on web");
                if (sessionId) {
                    sessionApi.abandon(sessionId)
                        .then(() => console.log("Session abandoned"))
                        .catch(e => console.error(e));
                }
                navigation.goBack();
            }
            return;
        }

        Alert.alert(
            "Abandon Session?",
            "Giving up will mark this session as FAILED and reset your streak progress logic. Are you sure?",
            [
                { text: "Cancel", style: "cancel", onPress: () => console.log("Abandon cancelled") },
                {
                    text: "I Give Up",
                    style: "destructive",
                    onPress: async () => {
                        console.log("Abandon confirmed");
                        if (sessionId) {
                            try {
                                await sessionApi.abandon(sessionId);
                                console.log("Abandon API called successfully");
                            } catch (e) { console.error("Abandon API failed", e); }
                        }
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.statusText}>FOCUS MODE ENGAGED</Text>
            </View>

            <View style={styles.timerContainer}>
                <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
                <Text style={styles.taskLabel}>Current Task: Deep Work</Text>
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
        justifyContent: 'space-between',
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
    timerContainer: {
        alignItems: 'center',
    },
    timer: {
        ...theme.typography.timer,
    },
    taskLabel: {
        ...theme.typography.body,
        marginTop: theme.spacing.m,
        fontSize: 24,
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
