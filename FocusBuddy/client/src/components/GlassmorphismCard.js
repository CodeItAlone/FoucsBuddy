import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../services/ThemeContext';

export default function GlassmorphismCard({ title, children, style }) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={[styles.container, style]}>
            {/* Glass effect background */}
            <View style={styles.glassBackground} />

            {/* Content */}
            <View style={styles.content}>
                {title && (
                    <Text style={styles.title}>{title}</Text>
                )}
                {children}
            </View>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        position: 'relative',
        borderRadius: theme.borderRadius.xl,
        overflow: 'hidden',
    },
    glassBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.glass.background,
        ...(Platform.OS === 'web' ? {
            backdropFilter: `blur(${theme.glass.blur}px)`,
            WebkitBackdropFilter: `blur(${theme.glass.blur}px)`,
        } : {}),
        borderWidth: 1,
        borderColor: theme.glass.border,
        borderRadius: theme.borderRadius.xl,
    },
    content: {
        padding: theme.spacing.l,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.m,
    },
});
