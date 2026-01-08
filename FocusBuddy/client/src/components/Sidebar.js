import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../services/ThemeContext';
import { useAuth } from '../services/AuthContext';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'groups', label: 'Groups', icon: '👥' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'projects', label: 'Projects & tasks', icon: '📋' },
    { id: 'timer', label: 'Timer', icon: '⏱️' },
    { id: 'history', label: 'History', icon: '📈' },
];

const bottomItems = [
    { id: 'help', label: 'Help', icon: 'ℹ️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ activeItem = 'dashboard', onItemPress, isCollapsed = false }) {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { logout } = useAuth();

    const styles = createStyles(theme);

    const renderMenuItem = (item, isActive) => (
        <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, isActive && styles.menuItemActive]}
            onPress={() => onItemPress?.(item.id)}
        >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            {!isCollapsed && (
                <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                    {item.label}
                </Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Logo */}
            <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                    <Text style={styles.logoText}>⚡</Text>
                </View>
                {!isCollapsed && <Text style={styles.brandName}>FocusBuddy</Text>}
            </View>

            {/* Main Menu */}
            <View style={styles.menuSection}>
                {menuItems.map(item => renderMenuItem(item, activeItem === item.id))}
            </View>

            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Bottom Menu */}
            <View style={styles.bottomSection}>
                {bottomItems.map(item => renderMenuItem(item, activeItem === item.id))}

                {/* Theme Toggle */}
                <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
                    <Text style={styles.menuIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
                    {!isCollapsed && (
                        <Text style={styles.menuLabel}>
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity style={styles.menuItem} onPress={logout}>
                    <Text style={styles.menuIcon}>🚪</Text>
                    {!isCollapsed && <Text style={styles.menuLabel}>Log Out</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.sidebar,
        paddingVertical: theme.spacing.l,
        paddingHorizontal: theme.spacing.m,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.s,
    },
    logoIcon: {
        width: 36,
        height: 36,
        borderRadius: theme.borderRadius.m,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 18,
    },
    brandName: {
        marginLeft: theme.spacing.m,
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    menuSection: {
        gap: theme.spacing.xs,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
    },
    menuItemActive: {
        backgroundColor: theme.colors.sidebarActiveBg,
    },
    menuIcon: {
        fontSize: 18,
        marginRight: theme.spacing.m,
    },
    menuLabel: {
        fontSize: 14,
        color: theme.colors.sidebarText,
        fontWeight: '500',
    },
    menuLabelActive: {
        color: theme.colors.sidebarActive,
        fontWeight: '600',
    },
    spacer: {
        flex: 1,
    },
    bottomSection: {
        gap: theme.spacing.xs,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: theme.spacing.m,
    },
});
