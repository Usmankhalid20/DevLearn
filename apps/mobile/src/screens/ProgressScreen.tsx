import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Flame, Trophy } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { mobileApi } from '../api/client';
import { formatHoursMins, calculateTodayMinutes } from '../utils/time';
import type { AnalyticsSummaryDto, StreakSummaryDto, LearningSessionDto } from '@devlearn/types';

export function ProgressScreen() {
  const [summary, setSummary] = useState<AnalyticsSummaryDto | null>(null);
  const [streak, setStreak] = useState<StreakSummaryDto | null>(null);
  const [todaySessions, setTodaySessions] = useState<LearningSessionDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [summaryData, streakData, sessionsData] = await Promise.all([
        mobileApi.getAnalyticsSummary().catch(() => null),
        mobileApi.getStreaks().catch(() => null),
        mobileApi.getSessions(50).catch(() => []),
      ]);

      setSummary(summaryData);
      setStreak(streakData);

      const todayStr = new Date().toISOString().split('T')[0];
      const filtered = sessionsData.filter(
        (s) => s.date?.startsWith(todayStr) || s.createdAt?.startsWith(todayStr)
      );
      setTodaySessions(filtered);
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

  // Group today's sessions by subject
  const subjectBreakdown: { [name: string]: number } = {};
  todaySessions.forEach((s) => {
    const name = s.subject?.name || 'General';
    subjectBreakdown[name] = (subjectBreakdown[name] || 0) + s.durationMinutes;
  });

  const totalTodayMinutes = calculateTodayMinutes(todaySessions);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.white}
        />
      }
    >
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      ) : (
        <>
          {/* Today's Subject Breakdown */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today's Subject Breakdown</Text>
              <Text style={styles.cardHighlight}>
                {formatHoursMins(totalTodayMinutes)}
              </Text>
            </View>

            {Object.keys(subjectBreakdown).length === 0 ? (
              <Text style={styles.emptyText}>
                No learning recorded today yet. Log study time to see your breakdown!
              </Text>
            ) : (
              <View style={styles.breakdownList}>
                {Object.entries(subjectBreakdown).map(([name, mins]) => {
                  const percent = totalTodayMinutes > 0 ? Math.round((mins / totalTodayMinutes) * 100) : 0;
                  return (
                    <View key={name} style={styles.breakdownItem}>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.subjectName}>{name}</Text>
                        <Text style={styles.subjectTime}>{formatHoursMins(mins)} ({percent}%)</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${percent}%` }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Streak Overview Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Consistency &amp; Streaks</Text>

            <View style={styles.streakGrid}>
              <View style={styles.streakMetric}>
                <Flame size={20} color={colors.white} strokeWidth={2.5} style={styles.metricIcon} />
                <Text style={styles.metricVal}>{streak?.currentStreak || 0} Days</Text>
                <Text style={styles.metricLabel}>Current Streak</Text>
              </View>

              <View style={styles.streakMetric}>
                <Trophy size={20} color={colors.white} strokeWidth={2} style={styles.metricIcon} />
                <Text style={styles.metricVal}>{streak?.longestStreak || 0} Days</Text>
                <Text style={styles.metricLabel}>Longest Streak</Text>
              </View>
            </View>

            {/* 7-Day Visual Tracker */}
            <Text style={[styles.cardSubTitle, { marginTop: 16 }]}>Past 7 Days</Text>
            <View style={styles.sevenDayRow}>
              {[6, 5, 4, 3, 2, 1, 0].map((daysAgo) => {
                const date = new Date();
                date.setDate(date.getDate() - daysAgo);
                const dayStr = date.toISOString().split('T')[0];
                const dayName = date.toLocaleDateString(undefined, { weekday: 'narrow' });

                // Check dailyActivityTrend from backend analytics summary
                const hasSession = summary?.dailyActivityTrend?.some(
                  (d) => d.date?.startsWith(dayStr) && d.minutes > 0
                ) || (daysAgo === 0 && totalTodayMinutes > 0);

                return (
                  <View key={dayStr} style={styles.dayBoxCol}>
                    <View
                      style={[
                        styles.dayBox,
                        hasSession ? styles.dayBoxActive : styles.dayBoxInactive,
                      ]}
                    />
                    <Text style={styles.dayLabel}>{dayName}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Lifetime Platform Metrics */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>All-Time Statistics</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>
                  {summary ? summary.totalHours : 0}h
                </Text>
                <Text style={styles.statLabel}>Total Hours Logged</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statVal}>
                  {summary ? summary.totalSessions : 0}
                </Text>
                <Text style={styles.statLabel}>Sessions Completed</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
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
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  cardSubTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  cardHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  breakdownList: {
    gap: 12,
  },
  breakdownItem: {
    gap: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subjectName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  subjectTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 3,
  },
  streakGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  streakMetric: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderLight,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  metricIcon: {
    marginBottom: 6,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sevenDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dayBoxCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
  },
  dayBoxActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  dayBoxInactive: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
  },
  dayLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderLight,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

