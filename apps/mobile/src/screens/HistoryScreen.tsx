import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { mobileApi } from '../api/client';
import { Chip } from '../components/ui/Chip';
import { LearningSessionCard } from '../components/LearningSessionCard';
import { ConfirmModal } from '../components/ConfirmModal';
import type { LearningSessionDto, SubjectDto } from '@devlearn/types';

export function HistoryScreen() {
  const [sessions, setSessions] = useState<LearningSessionDto[]>([]);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [sessionsData, subjectsData] = await Promise.all([
        mobileApi.getSessions(50).catch(() => []),
        mobileApi.getSubjects().catch(() => []),
      ]);

      setSessions(sessionsData);
      setSubjects(subjectsData);
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

  const handleDelete = async () => {
    if (!deleteSessionId) return;

    setIsDeleting(true);
    try {
      await mobileApi.deleteSession(deleteSessionId);
      setSessions((prev) => prev.filter((s) => s.id !== deleteSessionId));
      setDeleteSessionId(null);
    } catch (err: any) {
      Alert.alert('Delete Failed', err?.response?.data?.message || 'Failed to delete session.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSessions = selectedSubjectId
    ? sessions.filter((s) => s.subjectId === selectedSubjectId)
    : sessions;

  return (
    <View style={styles.container}>
      {/* Subject Filter Bar */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          <Chip
            label="All"
            count={sessions.length}
            selected={!selectedSubjectId}
            onPress={() => setSelectedSubjectId(null)}
          />

          {subjects.map((sub) => {
            const count = sessions.filter((s) => s.subjectId === sub.id).length;
            return (
              <Chip
                key={sub.id}
                label={sub.name}
                count={count}
                selected={selectedSubjectId === sub.id}
                onPress={() => setSelectedSubjectId(sub.id)}
              />
            );
          })}
        </ScrollView>
      </View>

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
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.white} />
          </View>
        ) : filteredSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Learning Sessions Found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedSubjectId
                ? 'No sessions logged for this subject yet.'
                : 'Start logging sessions or use the focus timer to build your history!'}
            </Text>
          </View>
        ) : (
          filteredSessions.map((session) => (
            <LearningSessionCard
              key={session.id}
              session={session}
              showDate
              onDelete={(id) => setDeleteSessionId(id)}
            />
          ))
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={Boolean(deleteSessionId)}
        title="Delete Learning Entry"
        description="Are you sure you want to delete this learning entry? Your recorded minutes will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onCancel={() => setDeleteSessionId(null)}
        onConfirm={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipsRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  content: {
    padding: 20,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  loaderContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

