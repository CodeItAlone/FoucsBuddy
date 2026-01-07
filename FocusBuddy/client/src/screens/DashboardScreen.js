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
import DashboardCard from '../components/DashboardCard';
import ProgressBar from '../components/ProgressBar';
import TimelineChart from '../components/TimelineChart';
import { CircularProgressSimple as CircularProgress } from '../components/CircularProgress';

// Sample data
const projectsData = [
    { id: 1, name: 'Finwall app', percentage: 49, time: '3 hr 26 min', color: '#7C3AED' },
    { id: 2, name: 'DS12 – Dark version', percentage: 32, time: '1 hr 51 min', color: '#A1A1A1', sublabel: true },
    { id: 3, name: 'DS42 – Settings section', percentage: 14, time: '55 min', color: '#A1A1A1', sublabel: true },
    { id: 4, name: 'System update', percentage: 5, time: '40 min', color: '#A1A1A1', sublabel: true },
];

const appsData = [
    { name: 'Figma', percentage: 47, time: '2 hr 58 min' },
    { name: 'Adobe Photoshop...', percentage: 12, time: '46 min' },
    { name: 'zoom.us', percentage: 12, time: '45 min' },
    { name: 'Slack', percentage: 7, time: '26 min' },
    { name: 'pinterest.com', percentage: 6, time: '23 min' },
    { name: 'HEY', percentage: 3, time: '11 min' },
    { name: 'nicelydone.com', percentage: 3, time: '11 min' },
    { name: 'twitter.com', percentage: 2, time: '8 min' },
    { name: 'crunchbase.com', percentage: 2, time: '7 min' },
    { name: 'instagram.com', percentage: 1, time: '4 min' },
    { name: 'Other', percentage: 5, time: '19 min' },
];

const categoriesData = [
    { name: 'Design', percentage: 59, time: '3 hr 44 min' },
    { name: 'Video Conference', percentage: 12, time: '45 min' },
    { name: 'Work Messaging', percentage: 10, time: '37 min' },
];

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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(width < 1024);

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

    return (
        <View style={styles.container}>
            {/* Sidebar - hidden on mobile */}
            {!isMobile && (
                <View style={[styles.sidebar, sidebarCollapsed && styles.sidebarCollapsed]}>
                    <Sidebar
                        activeItem="dashboard"
                        onItemPress={handleNavItemPress}
                        isCollapsed={sidebarCollapsed}
                    />
                </View>
            )}

            {/* Main Content Area */}
            <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {isMobile && (
                            <TouchableOpacity style={styles.menuButton} onPress={toggleTheme}>
                                <Text style={styles.menuButtonText}>{isDarkMode ? '☀️' : '🌙'}</Text>
                            </TouchableOpacity>
                        )}
                        <View>
                            <Text style={styles.dateText}>{formatDate()}</Text>
                            <View style={styles.trackingStatus}>
                                <Text style={styles.trackingLabel}>Tracking:</Text>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>Active</Text>
                            </View>
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
                        <TouchableOpacity style={styles.todayButton}>
                            <Text style={styles.todayButtonText}>Today</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content Grid */}
                <View style={styles.contentGrid}>
                    {/* Left Column - Timeline and Projects/Apps */}
                    <View style={styles.leftColumn}>
                        {/* Timeline */}
                        <DashboardCard style={styles.timelineCard}>
                            <TimelineChart />
                        </DashboardCard>

                        {/* Projects and Apps Row */}
                        <View style={styles.projectsAppsRow}>
                            {/* Projects & Tasks */}
                            <DashboardCard title="Projects & tasks" showMenu style={styles.projectsCard}>
                                {projectsData.map((project) => (
                                    <ProgressBar
                                        key={project.id}
                                        percentage={project.percentage}
                                        label={project.name}
                                        time={project.time}
                                        color={project.color}
                                    />
                                ))}
                            </DashboardCard>

                            {/* Apps & Websites */}
                            <DashboardCard title="Apps & Websites" style={styles.appsCard}>
                                <ScrollView style={styles.appsList} showsVerticalScrollIndicator={false}>
                                    {appsData.map((app, index) => (
                                        <View key={index} style={styles.appItem}>
                                            <Text style={styles.appPercentage}>{app.percentage}%</Text>
                                            <Text style={styles.appName} numberOfLines={1}>{app.name}</Text>
                                            <View style={styles.appBar}>
                                                <View
                                                    style={[
                                                        styles.appBarFill,
                                                        { width: `${app.percentage * 2}%` }
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.appTime}>{app.time}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </DashboardCard>
                        </View>
                    </View>

                    {/* Right Column - Daily Summary */}
                    <View style={styles.rightColumn}>
                        <DashboardCard title="Daily Summary" style={styles.summaryCard}>
                            {/* Summary Message */}
                            <View style={styles.summaryMessage}>
                                <Text style={styles.summaryIcon}>⚡</Text>
                                <Text style={styles.summaryText}>
                                    Today you had <Text style={styles.highlightPrimary}>20%</Text> more meetings than usual,
                                    you closed <Text style={styles.highlightPrimary}>2 tasks</Text> on two projects, but
                                    the focus was <Text style={styles.highlightPrimary}>12%</Text> lower than yesterday.
                                </Text>
                            </View>

                            {/* Stats Row */}
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Total time worked</Text>
                                    <Text style={styles.statValue}>6 hr 18 min</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Percent of work day</Text>
                                    <Text style={styles.statValue}>○ 79% <Text style={styles.statSubtext}>of 8 hr 0 min</Text></Text>
                                </View>
                            </View>

                            {/* Circular Progress Charts */}
                            <View style={styles.circularChartsRow}>
                                <CircularProgress
                                    percentage={62}
                                    label="Focus"
                                    color={theme.colors.chartPurple}
                                    size={65}
                                />
                                <CircularProgress
                                    percentage={15}
                                    label="Meetings"
                                    color={theme.colors.chartGreen}
                                    size={65}
                                />
                                <CircularProgress
                                    percentage={11}
                                    label="Breaks"
                                    color={theme.colors.chartOrange}
                                    size={65}
                                />
                                <CircularProgress
                                    percentage={12}
                                    label="Other"
                                    color={theme.colors.chartBlue}
                                    size={65}
                                />
                            </View>

                            {/* Top Categories */}
                            <View style={styles.categoriesSection}>
                                <Text style={styles.categoriesTitle}>Top categories</Text>
                                {categoriesData.map((category, index) => (
                                    <View key={index} style={styles.categoryItem}>
                                        <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
                                        <Text style={styles.categoryName}>{category.name}</Text>
                                        <View style={styles.categoryBar}>
                                            <View
                                                style={[
                                                    styles.categoryBarFill,
                                                    { width: `${category.percentage}%` }
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.categoryTime}>{category.time}</Text>
                                    </View>
                                ))}
                            </View>
                        </DashboardCard>
                    </View>
                </View>

                {/* Mobile Bottom Nav */}
                {isMobile && (
                    <View style={styles.mobileNav}>
                        {['📊', '📅', '📋', '⏱️', '📈'].map((icon, index) => (
                            <TouchableOpacity key={index} style={styles.mobileNavItem}>
                                <Text style={styles.mobileNavIcon}>{icon}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
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
        width: 220,
        backgroundColor: theme.colors.sidebar,
    },
    sidebarCollapsed: {
        width: 70,
    },
    mainContent: {
        flex: 1,
        padding: isMobile ? theme.spacing.m : theme.spacing.l,
    },
    header: {
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: theme.spacing.l,
        gap: isMobile ? theme.spacing.m : 0,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.m,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuButtonText: {
        fontSize: 20,
    },
    dateText: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.text,
    },
    trackingStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
    },
    trackingLabel: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginRight: theme.spacing.s,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.success,
        marginRight: theme.spacing.xs,
    },
    statusText: {
        fontSize: 13,
        color: theme.colors.success,
        fontWeight: '500',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surfaceSecondary,
        borderRadius: theme.borderRadius.m,
        padding: 4,
    },
    viewButton: {
        paddingVertical: theme.spacing.s,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.s,
    },
    viewButtonActive: {
        backgroundColor: theme.colors.surface,
        ...theme.shadows.small,
    },
    viewButtonText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    viewButtonTextActive: {
        color: theme.colors.text,
        fontWeight: '600',
    },
    todayButton: {
        paddingVertical: theme.spacing.s,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    todayButtonText: {
        fontSize: 13,
        color: theme.colors.text,
        fontWeight: '500',
    },
    contentGrid: {
        flexDirection: isDesktop ? 'row' : 'column',
        gap: theme.spacing.l,
    },
    leftColumn: {
        flex: isDesktop ? 1 : undefined,
        gap: theme.spacing.l,
    },
    rightColumn: {
        width: isDesktop ? 320 : '100%',
    },
    timelineCard: {
        minHeight: 140,
    },
    projectsAppsRow: {
        flexDirection: isTablet || isDesktop ? 'row' : 'column',
        gap: theme.spacing.l,
    },
    projectsCard: {
        flex: 1,
        minWidth: isDesktop ? 280 : undefined,
    },
    appsCard: {
        flex: 1,
        minWidth: isDesktop ? 280 : undefined,
        maxHeight: 350,
    },
    appsList: {
        maxHeight: 280,
    },
    appItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    appPercentage: {
        width: 36,
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    appName: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.text,
        marginRight: theme.spacing.m,
    },
    appBar: {
        width: 60,
        height: 4,
        backgroundColor: theme.colors.borderLight,
        borderRadius: 2,
        marginRight: theme.spacing.m,
        overflow: 'hidden',
    },
    appBarFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
    },
    appTime: {
        width: 60,
        fontSize: 12,
        color: theme.colors.textSecondary,
        textAlign: 'right',
    },
    summaryCard: {
        minHeight: 400,
    },
    summaryMessage: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surfaceSecondary,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.l,
    },
    summaryIcon: {
        fontSize: 16,
        marginRight: theme.spacing.m,
    },
    summaryText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.text,
        lineHeight: 20,
    },
    highlightPrimary: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.l,
        gap: theme.spacing.m,
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    statSubtext: {
        fontSize: 12,
        fontWeight: '400',
        color: theme.colors.textMuted,
    },
    circularChartsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.l,
        paddingVertical: theme.spacing.m,
    },
    categoriesSection: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: theme.spacing.m,
    },
    categoriesTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.m,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    categoryPercentage: {
        width: 36,
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    categoryName: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.text,
        fontWeight: '500',
    },
    categoryBar: {
        width: 80,
        height: 4,
        backgroundColor: theme.colors.borderLight,
        borderRadius: 2,
        marginHorizontal: theme.spacing.m,
        overflow: 'hidden',
    },
    categoryBarFill: {
        height: '100%',
        backgroundColor: theme.colors.text,
        borderRadius: 2,
    },
    categoryTime: {
        width: 70,
        fontSize: 12,
        color: theme.colors.textSecondary,
        textAlign: 'right',
    },
    mobileNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.spacing.m,
        marginTop: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    mobileNavItem: {
        padding: theme.spacing.m,
    },
    mobileNavIcon: {
        fontSize: 24,
    },
});
