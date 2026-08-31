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
import { Flame, Plus, Timer as TimerIcon } from 'lucide-react-native';
import { useAuth } from '../context/auth-context';
import { colors } from '../theme/colors';
import { mobileApi } from '../api/client';
import { QuickLogModal } from '../components/QuickLogModal';
import { LearningSessionCard } from '../components/LearningSessionCard';
import { formatHoursMins, getGreeting, calculateTodayMinutes } from '../utils/time';
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
        mobileApi.getSessions(20).catch(() => []),
        mobileApi.getStreaks().catch(() => null),
      ]);

      setSubjects(subjectsData);
      setRecentSessions(sessionsData);
      setStreak(streakData);
    } catch {
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

  // Calculate today's minutes from sessions
  const todayMinutes = calculateTodayMinutes(recentSessions);
  const dailyGoalMinutes = user?.settings?.dailyGoalMinutes || 60;
  const progressPercent = Math.min(Math.round((todayMinutes / dailyGoalMinutes) * 100), 100);

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
            <Flame size={14} color={colors.white} strokeWidth={2.5} />
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
                <Text style={styles.cardValue}>
                  {formatHoursMins(todayMinutes)} / {formatHoursMins(dailyGoalMinutes)}
                </Text>
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
                    ? 'Daily target completed'
                    : `${dailyGoalMinutes - todayMinutes}m remaining to hit daily target`}
                </Text>
                <Text style={styles.cardPercentText}>{progressPercent}%</Text>
              </View>
            </View>

            {/* Quick Actions Row */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => setQuickLogOpen(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Log Learning Session"
              >
                <Plus size={16} color={colors.black} strokeWidth={2.5} />
                <Text style={styles.primaryActionBtnText}>Log Learning</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => navigation.navigate('Timer')}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Open Focus Timer"
              >
                <TimerIcon size={16} color={colors.white} strokeWidth={2} />
                <Text style={styles.secondaryActionBtnText}>Focus Timer</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Sessions */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Sessions</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('History')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="View all learning history"
              >
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentSessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No sessions logged yet</Text>
                <Text style={styles.emptySubtitle}>
                  Tap &quot;Log Learning&quot; or start a timer to begin your streak!
                </Text>
              </View>
            ) : (
              recentSessions.slice(0, 5).map((session) => (
                <LearningSessionCard
                  key={session.id}
                  session={session}
                  compact
                  showDate
                />
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
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
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
    gap: 6,
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
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 14,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryActionBtnText: {
    color: colors.black,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: 14,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
});

