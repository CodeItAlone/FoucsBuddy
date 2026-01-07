import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../services/ThemeContext';

export default function DashboardCard({
    title,
    children,
    showMenu = false,
    onMenuPress,
    style
}) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={[styles.container, style]}>
            {title && (
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    {showMenu && (
                        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
                            <Text style={styles.menuIcon}>•••</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
    menuButton: {
        padding: theme.spacing.xs,
    },
    menuIcon: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        letterSpacing: 2,
    },
    content: {
        flex: 1,
    },
});
