import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useAuth } from '../services/AuthContext';

export default function HomeScreen({ navigation }) {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.headerLeft} />
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.title}>FocusBuddy</Text>
                <Text style={styles.subtitle}>Execution Protocol</Text>
            </View>

            <View style={styles.main}>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => navigation.navigate('Session')}
                >
                    <Text style={styles.startButtonText}>INITIATE SESSION</Text>
                </TouchableOpacity>

                <View style={styles.stats}>
                    <Text style={styles.welcomeText}>Welcome, {user?.handle || 'Operative'}</Text>
                    <View style={styles.streakContainer}>
                        <Text style={styles.streakNumber}>{user?.currentStreak || 0}</Text>
                        <Text style={styles.streakLabel}>Day Streak</Text>
                    </View>
                    {user?.graceDaysRemaining > 0 && (
                        <Text style={styles.graceText}>
                            {user.graceDaysRemaining} grace day{user.graceDaysRemaining > 1 ? 's' : ''} remaining
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.feedStub}>
                <Text style={styles.feedTitle}>Mission Status</Text>
                <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                    <Text style={styles.feedText}>Backend: Secure (JWT Auth)</Text>
                </View>
                <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                    <Text style={styles.feedText}>Database: Persistent (H2 File)</Text>
                </View>
                <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={styles.feedText}>Groups: Coming Soon</Text>
                </View>
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
        marginTop: theme.spacing.l,
        alignItems: 'center',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: theme.spacing.m,
    },
    headerLeft: {
        width: 60,
    },
    logoutButton: {
        paddingVertical: theme.spacing.s,
        paddingHorizontal: theme.spacing.m,
    },
    logoutText: {
        color: theme.colors.gray,
        fontSize: 14,
    },
    title: {
        ...theme.typography.header,
        letterSpacing: 4,
    },
    subtitle: {
        ...theme.typography.subHeader,
        color: theme.colors.primary,
        marginTop: theme.spacing.s,
    },
    main: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.l,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFF',
        elevation: 10,
    },
    startButtonText: {
        ...theme.typography.button,
        fontSize: 24,
        letterSpacing: 2,
    },
    stats: {
        marginTop: theme.spacing.xl,
        alignItems: 'center',
    },
    welcomeText: {
        ...theme.typography.body,
        color: theme.colors.gray,
        marginBottom: theme.spacing.m,
    },
    streakContainer: {
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    streakNumber: {
        fontSize: 48,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    streakLabel: {
        ...theme.typography.body,
        color: theme.colors.text,
    },
    graceText: {
        marginTop: theme.spacing.s,
        color: theme.colors.gray,
        fontSize: 12,
    },
    feedStub: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray,
        paddingTop: theme.spacing.m,
        paddingBottom: theme.spacing.m,
    },
    feedTitle: {
        ...theme.typography.subHeader,
        marginBottom: theme.spacing.m,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.s,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: theme.spacing.s,
    },
    feedText: {
        ...theme.typography.body,
        fontSize: 14,
    }
});
