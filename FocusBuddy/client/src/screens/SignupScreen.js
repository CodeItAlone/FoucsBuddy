import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useAuth } from '../services/AuthContext';

export default function SignupScreen({ navigation }) {
    const { signup, isLoading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [handle, setHandle] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        const cleanEmail = email.trim();
        const cleanHandle = handle.trim();
        const cleanPassword = password.trim();

        if (!cleanEmail || !cleanPassword || !cleanHandle) {
            Alert.alert("Missing Fields", "Please fill all fields.");
            return;
        }
        const success = await signup(cleanEmail, cleanHandle, cleanPassword);
        if (success) {
            // Navigation handled by App.js state change
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>INITIATE</Text>
                <Text style={styles.subtitle}>CREATE NEW OPERATIVE</Text>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TextInput
                    style={styles.input}
                    placeholder="Operative Handle (Username)"
                    placeholderTextColor="#666"
                    value={handle}
                    onChangeText={setHandle}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email Frequency"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Secure Key (Password)"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>ESTABLISH IDENTITY</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkContainer}>
                    <Text style={styles.linkText}>Already active? Return to Login</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
    },
    content: {
        padding: theme.spacing.xl,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    title: {
        ...theme.typography.header,
        textAlign: 'center',
        marginBottom: theme.spacing.s,
    },
    subtitle: {
        ...theme.typography.subHeader,
        textAlign: 'center',
        marginBottom: theme.spacing.xxl,
        color: theme.colors.primary,
        letterSpacing: 3,
        fontSize: 14,
    },
    input: {
        backgroundColor: theme.colors.surface,
        color: theme.colors.text,
        padding: theme.spacing.m,
        borderRadius: 4,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.gray,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.m,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: theme.spacing.m,
    },
    buttonText: {
        ...theme.typography.button,
        letterSpacing: 2,
    },
    linkContainer: {
        marginTop: theme.spacing.l,
        alignItems: 'center',
    },
    linkText: {
        color: '#888',
        textDecorationLine: 'underline',
    },
    errorText: {
        color: theme.colors.error,
        textAlign: 'center',
        marginBottom: theme.spacing.m,
    }
});
