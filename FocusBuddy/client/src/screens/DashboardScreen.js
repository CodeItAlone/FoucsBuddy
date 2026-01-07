import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useWindowDimensions,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../services/ThemeContext';
import { useAuth } from '../services/AuthContext';
import Sidebar from '../components/Sidebar';
import GlowingTimerButton from '../components/GlowingTimerButton';
import SquadSidebar from '../components/SquadSidebar';
import InteractiveTimeline from '../components/TimelineChart';
import ProductivityHeatmap from '../components/ProductivityHeatmap';
import LiveLeaderboard from '../components/LiveLeaderboard';
import GlassmorphismCard from '../components/GlassmorphismCard';

const formatDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
};

export default function DashboardScreen({ navigation }) {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { user } = useAuth();
    const { width } = useWindowDimensions();
    const [activeView, setActiveView] = useState('Day');

    // Responsive breakpoints
    const isDesktop = width >= 1200;
    const isTablet = width >= 768 && width < 1200;
    const isMobile = width < 768;

    const styles = createStyles(theme, isDesktop, isTablet, isMobile);

    const handleNavItemPress = (itemId) => {
        if (itemId === 'timer') {
            navigation.navigate('Session');
        }
    };

    const handleStartSession = () => {
        navigation.navigate('Session');
    };

    return (
        <View style={styles.container}>
            {/* Left Sidebar - hidden on mobile */}
            {!isMobile && (
                <View style={styles.sidebar}>
                    <Sidebar
                        activeItem="dashboard"
                        onItemPress={handleNavItemPress}
                        isCollapsed={isTablet}
                    />
                </View>
            )}

            {/* Main Content Area */}
            <ScrollView
                style={styles.mainContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.mainContentContainer}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {isMobile && (
                            <TouchableOpacity style={styles.menuButton} onPress={toggleTheme}>
                                <Text style={styles.menuButtonText}>{isDarkMode ? '☀️' : '🌙'}</Text>
                            </TouchableOpacity>
                        )}
                        <View>
                            <Text style={styles.greeting}>
                                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.handle || 'Champion'} 👋
                            </Text>
                            <Text style={styles.dateText}>{formatDate()}</Text>
                        </View>
                    </View>

                    <View style={styles.headerRight}>
                        <View style={styles.viewToggle}>
                            {['Day', 'Week', 'Month'].map((view) => (
                                <TouchableOpacity
                                    key={view}
                                    style={[styles.viewButton, activeView === view && styles.viewButtonActive]}
                                    onPress={() => setActiveView(view)}
                                >
                                    <Text style={[styles.viewButtonText, activeView === view && styles.viewButtonTextActive]}>
                                        {view}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Quick Start Button */}
                <GlowingTimerButton onPress={handleStartSession} />

                {/* Activity Timeline */}
                <GlassmorphismCard style={styles.timelineCard}>
                    <InteractiveTimeline />
                </GlassmorphismCard>

                {/* Heatmap and Leaderboard Grid */}
                <View style={styles.cardsGrid}>
                    <ProductivityHeatmap style={styles.heatmapCard} />
                    <LiveLeaderboard style={styles.leaderboardCard} />
                </View>

                {/* Mobile Bottom Nav */}
                {isMobile && (
                    <View style={styles.mobileNav}>
                        {[
                            { icon: '📊', id: 'dashboard' },
                            { icon: '📅', id: 'calendar' },
                            { icon: '⏱️', id: 'timer' },
                            { icon: '👥', id: 'squad' },
                            { icon: '⚙️', id: 'settings' },
                        ].map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.mobileNavItem}
                                onPress={() => item.id === 'timer' && navigation.navigate('Session')}
                            >
                                <Text style={styles.mobileNavIcon}>{item.icon}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Right Sidebar - Squad (desktop only) */}
            {isDesktop && (
                <View style={styles.squadSidebar}>
                    <SquadSidebar />
                </View>
            )}
        </View>
    );
}

const createStyles = (theme, isDesktop, isTablet, isMobile) => StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: theme.colors.background,
    },
    sidebar: {
        width: isTablet ? 70 : 220,
        backgroundColor: theme.colors.sidebar,
    },
    mainContent: {
        flex: 1,
    },
    mainContentContainer: {
        padding: isMobile ? theme.spacing.m : theme.spacing.l,
        paddingBottom: isMobile ? 100 : theme.spacing.l,
    },
    header: {
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: theme.spacing.m,
        gap: isMobile ? theme.spacing.m : 0,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    menuButton: {
        width: 44,
        height: 44,
        borderRadius: theme.borderRadius.m,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    menuButtonText: {
        fontSize: 20,
    },
    greeting: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.text,
    },
    dateText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    viewButton: {
        paddingVertical: theme.spacing.s,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.s,
    },
    viewButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    viewButtonText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    viewButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    timelineCard: {
        marginBottom: theme.spacing.l,
    },
    cardsGrid: {
        flexDirection: isDesktop || isTablet ? 'row' : 'column',
        gap: theme.spacing.l,
    },
    heatmapCard: {
        flex: 1,
        minWidth: isDesktop ? 300 : undefined,
    },
    leaderboardCard: {
        flex: 1,
        minWidth: isDesktop ? 300 : undefined,
    },
    squadSidebar: {
        width: 280,
    },
    mobileNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.spacing.m,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        ...(Platform.OS === 'web' ? {
            backdropFilter: 'blur(12px)',
            backgroundColor: theme.glass.background,
        } : {}),
    },
    mobileNavItem: {
        padding: theme.spacing.m,
    },
    mobileNavIcon: {
        fontSize: 24,
    },
});
