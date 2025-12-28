import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useAuth } from '../services/AuthContext';

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
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
                    <Text style={styles.statsText}>Hello, {user?.handle}</Text>
                    <Text style={styles.statsText}>Streak: {user?.streak?.currentStreak || 0} Days</Text>
                </View>
            </View>

            <View style={styles.feedStub}>
                <Text style={styles.feedTitle}>Live Activity</Text>
                <Text style={styles.feedText}>User_X started Deep Work (45m)</Text>
                <Text style={styles.feedText}>User_Y completed Java Study</Text>
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
        marginTop: theme.spacing.xl,
        alignItems: 'center',
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
    statsText: {
        ...theme.typography.body,
        color: theme.colors.gray,
    },
    feedStub: {
        height: 150,
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray,
        paddingTop: theme.spacing.m,
    },
    feedTitle: {
        ...theme.typography.subHeader,
        marginBottom: theme.spacing.s,
    },
    feedText: {
        ...theme.typography.body,
        marginBottom: theme.spacing.s,
    }
});
