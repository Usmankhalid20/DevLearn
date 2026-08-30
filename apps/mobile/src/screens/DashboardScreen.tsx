import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/auth-context';
import { colors } from '../theme/colors';
import { mobileApi } from '../api/client';
import { QuickLogModal } from '../components/QuickLogModal';
import type { SubjectDto, LearningSessionDto, StreakSummaryDto } from '@devlearn/types';

export function DashboardScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [recentSessions, setRecentSessions] = useState<LearningSessionDto[]>([]);
  const [streak, setStreak] = useState<StreakSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [quickLogOpen, setQuickLogOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [subjectsData, sessionsData, streakData] = await Promise.all([
        mobileApi.getSubjects().catch(() => []),
        mobileApi.getSessions(5).catch(() => []),
        mobileApi.getStreaks().catch(() => null),
      ]);

      setSubjects(subjectsData);
      setRecentSessions(sessionsData);
      setStreak(streakData);
    } catch (err) {
      // Ignore
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Calculate today's minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMinutes = recentSessions
    .filter((s) => s.date?.startsWith(todayStr) || s.createdAt?.startsWith(todayStr))
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const dailyGoalMinutes = user?.settings?.dailyGoalMinutes || 60;
  const progressPercent = Math.min(Math.round((todayMinutes / dailyGoalMinutes) * 100), 100);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.white}
          />
        }
      >
        {/* User Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>
              {user?.name || user?.email?.split('@')[0] || 'Learner'}
            </Text>
          </View>

          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakCount}>
              {streak?.currentStreak || 0}d
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.white} />
          </View>
        ) : (
          <>
            {/* Today's Goal Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>Today's Learning Focus</Text>
                <Text style={styles.cardValue}>{todayMinutes}m / {dailyGoalMinutes}m</Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.cardFooterText}>
                  {progressPercent >= 100
                    ? '🎉 Daily goal achieved!'
                    : `${dailyGoalMinutes - todayMinutes} minutes remaining to hit daily goal`}
                </Text>
                <Text style={styles.cardPercentText}>{progressPercent}%</Text>
              </View>
            </View>

            {/* Quick Actions Row */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => setQuickLogOpen(true)}
              >
                <Text style={styles.primaryActionBtnText}>+ Log Learning</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => navigation.navigate('Timer')}
              >
                <Text style={styles.secondaryActionBtnText}>⏱️ Focus Timer</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Sessions */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Sessions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentSessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No sessions logged today</Text>
                <Text style={styles.emptySubtitle}>
                  Tap &quot;+ Log Learning&quot; or start a timer to begin your streak!
                </Text>
              </View>
            ) : (
              recentSessions.map((session) => (
                <View key={session.id} style={styles.sessionItem}>
                  <View style={styles.sessionLeft}>
                    <Text style={styles.sessionSubject}>
                      {session.subject?.name || 'General'}
                    </Text>
                    {session.topic ? (
                      <Text style={styles.sessionTopic} numberOfLines={1}>
                        {session.topic}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.sessionBadge}>
                    <Text style={styles.sessionMinutes}>
                      {session.durationMinutes}m
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Quick Log Sheet */}
      <QuickLogModal
        visible={quickLogOpen}
        subjects={subjects}
        onClose={() => setQuickLogOpen(false)}
        onSuccess={loadData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakCount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  loaderContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  cardPercentText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryActionBtn: {
    flex: 1.2,
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryActionBtnText: {
    color: colors.black,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryActionBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 8,
  },
  sessionLeft: {
    flex: 1,
    marginRight: 10,
  },
  sessionSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  sessionTopic: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sessionBadge: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderLight,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sessionMinutes: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});
