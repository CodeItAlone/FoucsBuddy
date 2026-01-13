import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useWindowDimensions,
    Platform
} from 'react-native';
import { sessionApi } from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../services/ThemeContext';
import { useAuth } from '../services/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import Sidebar from '../components/Sidebar';
import InlineSession from '../components/InlineSession';
import QuickActionHeader from '../components/QuickActionHeader';
import CompactDailySummary from '../components/CompactDailySummary';
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

    // Session state for header integration
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
    const [sessionTaskName, setSessionTaskName] = useState('');
    const [showSetupForm, setShowSetupForm] = useState(false);

    // Data state
    const [dailyData, setDailyData] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDailyData = useCallback(async () => {
        try {
            const response = await sessionApi.getDailySummary();
            setDailyData(response.data);
        } catch (error) {
            console.error('Failed to fetch daily summary:', error);
        }
    }, []);

    useEffect(() => {
        fetchDailyData();
    }, [refreshKey, fetchDailyData]);

    useFocusEffect(
        useCallback(() => {
            fetchDailyData();
        }, [fetchDailyData])
    );



    const inlineSessionRef = useRef(null);

    // Responsive breakpoints
    const isDesktop = width >= 1200;
    const isTablet = width >= 768 && width < 1200;
    const isMobile = width < 768;

    const styles = createStyles(theme, isDesktop, isTablet, isMobile);

    const handleNavItemPress = (itemId) => {
        console.log('Nav item pressed:', itemId);
    };



    const handleSessionChange = useCallback((status, data) => {
        console.log('Session status:', status, data);
        if (status === 'active') {
            setIsSessionActive(true);
            setSessionTaskName(data?.taskName || '');
        } else if (status === 'ended' || status === 'completed') {
            setIsSessionActive(false);
            setSessionTaskName('');
            setRefreshKey(prev => prev + 1);
        }
    }, []);

    const handleStartSessionFromHeader = () => {
        setShowSetupForm(true);
    };

    const handleEndSessionFromHeader = () => {
        // This would trigger the InlineSession to end
        setIsSessionActive(false);
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
            <View style={styles.mainWrapper}>
                {/* Sticky Quick Action Header */}
                <QuickActionHeader
                    isSessionActive={isSessionActive}
                    timeLeft={sessionTimeLeft}
                    taskName={sessionTaskName}
                    onStartSession={handleStartSessionFromHeader}
                    onEndSession={handleEndSessionFromHeader}
                />

                <ScrollView
                    style={styles.mainContent}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.mainContentContainer}
                >
                    {/* Greeting Header */}
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

                    {/* Inline Session Component */}
                    <InlineSession
                        ref={inlineSessionRef}
                        onSessionChange={handleSessionChange}
                        showSetup={showSetupForm}
                        onSetupClose={() => setShowSetupForm(false)}
                    />

                    {/* Compact Daily Summary */}
                    <CompactDailySummary data={dailyData} />

                    {/* Activity Timeline */}
                    <GlassmorphismCard style={styles.timelineCard}>
                        <InteractiveTimeline sessions={dailyData?.sessions} />
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
                                    onPress={() => item.id === 'timer' && handleStartSessionFromHeader()}
                                >
                                    <Text style={styles.mobileNavIcon}>{item.icon}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>


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
    mainWrapper: {
        flex: 1,
        flexDirection: 'column',
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
        marginTop: theme.spacing.l,
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
        width: 300,
        padding: theme.spacing.m,
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
