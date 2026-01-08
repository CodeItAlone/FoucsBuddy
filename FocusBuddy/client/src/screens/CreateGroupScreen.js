import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useTheme } from '../services/ThemeContext';
import { groupApi } from '../services/api';

const CATEGORIES = [
    { id: 'deep_work', label: 'Deep Work', icon: '🧠' },
    { id: 'coding', label: 'Coding', icon: '💻' },
    { id: 'studying', label: 'Studying', icon: '📚' },
    { id: 'writing', label: 'Writing', icon: '✍️' },
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'general', label: 'General', icon: '⚡' },
];

export default function CreateGroupScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const [name, setName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a group name');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        setLoading(true);
        try {
            await groupApi.createGroup(name.trim(), selectedCategory.label);
            navigation.goBack();
        } catch (err) {
            console.error('Failed to create group:', err);
            Alert.alert('Error', 'Failed to create group. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Create Group</Text>
                <TouchableOpacity onPress={handleCreate} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                        <Text style={styles.createButton}>Create</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Group Name */}
                <View style={styles.section}>
                    <Text style={styles.label}>Group Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter group name"
                        placeholderTextColor={theme.colors.textMuted}
                        maxLength={50}
                    />
                </View>

                {/* Category Selection */}
                <View style={styles.section}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.categoriesGrid}>
                        {CATEGORIES.map(category => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryCard,
                                    selectedCategory?.id === category.id && styles.categoryCardSelected
                                ]}
                                onPress={() => setSelectedCategory(category)}
                            >
                                <Text style={styles.categoryIcon}>{category.icon}</Text>
                                <Text style={[
                                    styles.categoryLabel,
                                    selectedCategory?.id === category.id && styles.categoryLabelSelected
                                ]}>
                                    {category.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>💡 Group Tips</Text>
                    <Text style={styles.infoText}>
                        • Invite friends to join your group{'\n'}
                        • See real-time status of squad members{'\n'}
                        • Celebrate milestones together
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
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
    cancelButton: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    createButton: {
        fontSize: 16,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: theme.spacing.m,
    },
    section: {
        marginBottom: theme.spacing.l,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        fontSize: 16,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.s,
    },
    categoryCard: {
        width: '30%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    categoryCardSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight,
    },
    categoryIcon: {
        fontSize: 32,
        marginBottom: theme.spacing.s,
    },
    categoryLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    categoryLabelSelected: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    infoBox: {
        backgroundColor: theme.colors.surfaceSecondary,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        marginTop: theme.spacing.m,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
    },
    infoText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
});
