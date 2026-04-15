import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import Svg, { Path, Circle } from 'react-native-svg';
import BottomNavigation from '../components/BottomNavigation';

const ActivityScreen = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // const activityData = {
  //   day: {
  //     stats: { sessions: '3', time: '1.2h', streak: '12d', rating: '4.8' },
  //     chartTitle: 'Today\'s Interactions',
  //     chartData: [
  //       { day: 'Morning', sessions: 1, duration: 20 },
  //       { day: 'Noon', sessions: 1, duration: 15 },
  //       { day: 'Evening', sessions: 1, duration: 40 },
  //     ],
  //     emotions: [
  //       { emotion: 'Happy', count: 12, percentage: 60, color: COLORS.success },
  //       { emotion: 'Calm', count: 5, percentage: 25, color: COLORS.secondary },
  //       { emotion: 'Neutral', count: 3, percentage: 15, color: COLORS.info },
  //     ],
  //     totalInteractions: 20,
  //   },
  //   week: {
  //     stats: { sessions: '27', time: '6.2h', streak: '12d', rating: '4.3' },
  //     chartTitle: 'Weekly Sessions',
  //     chartData: [
  //       { day: 'Mon', sessions: 3, duration: 45 },
  //       { day: 'Tue', sessions: 5, duration: 68 },
  //       { day: 'Wed', sessions: 2, duration: 32 },
  //       { day: 'Thu', sessions: 4, duration: 55 },
  //       { day: 'Fri', sessions: 6, duration: 78 },
  //       { day: 'Sat', sessions: 3, duration: 42 },
  //       { day: 'Sun', sessions: 4, duration: 51 },
  //     ],
  //     emotions: [
  //       { emotion: 'Happy', count: 45, percentage: 35, color: COLORS.success },
  //       { emotion: 'Calm', count: 38, percentage: 30, color: COLORS.secondary },
  //       { emotion: 'Neutral', count: 25, percentage: 20, color: COLORS.info },
  //       { emotion: 'Sad', count: 12, percentage: 10, color: COLORS.warning },
  //       { emotion: 'Anxious', count: 6, percentage: 5, color: COLORS.error },
  //     ],
  //     totalInteractions: 126,
  //   },
  //   month: {
  //     stats: { sessions: '104', time: '28.5h', streak: '12d', rating: '4.5' },
  //     chartTitle: 'Monthly Sessions',
  //     chartData: [
  //       { day: 'Wk 1', sessions: 24, duration: 320 },
  //       { day: 'Wk 2', sessions: 32, duration: 415 },
  //       { day: 'Wk 3', sessions: 18, duration: 240 },
  //       { day: 'Wk 4', sessions: 30, duration: 390 },
  //     ],
  //     emotions: [
  //       { emotion: 'Happy', count: 180, percentage: 40, color: COLORS.success },
  //       { emotion: 'Calm', count: 135, percentage: 30, color: COLORS.secondary },
  //       { emotion: 'Neutral', count: 67, percentage: 15, color: COLORS.info },
  //       { emotion: 'Sad', count: 45, percentage: 10, color: COLORS.warning },
  //       { emotion: 'Anxious', count: 23, percentage: 5, color: COLORS.error },
  //     ],
  //     totalInteractions: 450,
  //   }
  // };

  // const currentData = activityData[selectedPeriod];

  const insights = [
    {
      icon: '📈',
      title: 'Improvement Trend',
      description: 'Your emotional wellbeing improved 23% this week',
      color: COLORS.success,
    },
    {
      icon: '🎯',
      title: 'Consistency Streak',
      description: '12 days of daily check-ins',
      color: COLORS.primary,
    },
    {
      icon: '💬',
      title: 'Most Active Time',
      description: 'You engage most between 6-8 PM',
      color: COLORS.secondary,
    },
  ];

  const maxDuration = Math.max(...currentData.chartData.map(d => d.duration));

  const StatCard = ({ label, value, change, icon }) => (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {change && (
        <View style={[styles.changebadge, change > 0 && styles.changeBadgePositive]}>
          <Text style={styles.changeText}>{change > 0 ? '+' : ''}{change}%</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Activity</Text>
          <Text style={styles.subtitle}>Your emotional wellness journey</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['day', 'week', 'month'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <StatCard label="Sessions" value={currentData.stats.sessions} change={15} icon="🎯" />
          <StatCard label="Total Time" value={currentData.stats.time} change={8} icon="⏱️" />
          <StatCard label="Streak" value={currentData.stats.streak} change={20} icon="🔥" />
          <StatCard label="Avg Rating" value={currentData.stats.rating} change={5} icon="⭐" />
        </View>

        {/* Dynamic Activity Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{currentData.chartTitle}</Text>
          <View style={styles.chart}>
            {currentData.chartData.map((item, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(item.duration / maxDuration) * 100}%`,
                        backgroundColor: COLORS.primaryLight,
                      },
                    ]}
                  >
                    <Text style={styles.barValue}>{item.sessions}</Text>
                  </View>
                </View>
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Emotion Distribution */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Emotion Distribution</Text>
          <Text style={styles.cardSubtitle}>Based on {currentData.totalInteractions} interactions this {selectedPeriod}</Text>
          
          <View style={styles.emotionList}>
            {currentData.emotions.map((item, index) => (
              <View key={index} style={styles.emotionItem}>
                <View style={styles.emotionInfo}>
                  <Text style={styles.emotionName}>{item.emotion}</Text>
                  <Text style={styles.emotionCount}>{item.count} times</Text>
                </View>
                <View style={styles.emotionBarContainer}>
                  <View
                    style={[
                      styles.emotionBar,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.emotionPercentage}>{item.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Insights */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Insights & Patterns</Text>
          <View style={styles.insightsList}>
            {insights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <View style={[styles.insightIcon, { backgroundColor: insight.color + '15' }]}>
                  <Text style={styles.insightIconText}>{insight.icon}</Text>
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNavigation navigation={navigation} currentRoute="Activity" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.md,
    paddingBottom: SIZES.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.lg,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: 4,
    marginBottom: SIZES.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: SIZES.radiusMd,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  periodTextActive: {
    color: COLORS.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: SIZES.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    margin: '1%',
    alignItems: 'center',
    position: 'relative',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  statIconText: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  changeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.error + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  changeBadgePositive: {
    backgroundColor: COLORS.success + '15',
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.success,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  cardTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.lg,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 180,
    marginTop: SIZES.md,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 4,
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  barLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  emotionList: {
    gap: SIZES.md,
  },
  emotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  emotionInfo: {
    width: 80,
  },
  emotionName: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emotionCount: {
    fontSize: SIZES.tiny,
    color: COLORS.textSecondary,
  },
  emotionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  emotionBar: {
    height: '100%',
    borderRadius: 4,
  },
  emotionPercentage: {
    width: 40,
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  insightsList: {
    gap: SIZES.md,
    marginTop: SIZES.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightIconText: {
    fontSize: 24,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
});

export default ActivityScreen;
