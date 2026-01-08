import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useTheme } from '../services/ThemeContext';
import { useAuth } from '../services/AuthContext';
import { groupApi } from '../services/api';

export default function GroupsScreen({ navigation }) {
    const { theme } = useTheme();
    const { user } = useAuth();
    const styles = createStyles(theme);

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchGroups = useCallback(async () => {
        try {
            const response = await groupApi.getMyGroups();
            setGroups(response.data);
        } catch (err) {
            console.error('Failed to fetch groups:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchGroups();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return theme.colors.secondary;
            case 'RECRUITING': return theme.colors.primary;
            default: return theme.colors.textMuted;
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>My Groups</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate('CreateGroup')}
                >
                    <Text style={styles.createButtonText}>+ Create</Text>
                </TouchableOpacity>
            </View>

            {/* Groups List */}
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                {groups.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>👥</Text>
                        <Text style={styles.emptyTitle}>No Groups Yet</Text>
                        <Text style={styles.emptyText}>
                            Create or join a group to start focusing with friends
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => navigation.navigate('CreateGroup')}
                        >
                            <Text style={styles.emptyButtonText}>Create Your First Group</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    groups.map(group => (
                        <TouchableOpacity
                            key={group.id}
                            style={styles.groupCard}
                            onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
                        >
                            <View style={styles.groupHeader}>
                                <Text style={styles.groupName}>{group.name}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(group.status) + '20' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(group.status) }]}>
                                        {group.status}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.groupCategory}>{group.category}</Text>
                            <View style={styles.groupFooter}>
                                <Text style={styles.memberCount}>
                                    👥 {group.members?.length || 0} members
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text,
    },
    createButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
        padding: theme.spacing.m,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xl * 2,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: theme.spacing.m,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
    },
    emptyText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.l,
    },
    emptyButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.l,
        paddingVertical: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    groupCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.s,
    },
    groupName: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.round,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    groupCategory: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.m,
    },
    groupFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberCount: {
        fontSize: 13,
        color: theme.colors.textMuted,
    },
});
