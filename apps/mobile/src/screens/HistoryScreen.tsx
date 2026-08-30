import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { mobileApi } from '../api/client';
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
          <TouchableOpacity
            style={[styles.chip, !selectedSubjectId && styles.chipActive]}
            onPress={() => setSelectedSubjectId(null)}
          >
            <Text style={[styles.chipText, !selectedSubjectId && styles.chipTextActive]}>
              All ({sessions.length})
            </Text>
          </TouchableOpacity>

          {subjects.map((sub) => {
            const isSelected = selectedSubjectId === sub.id;
            const count = sessions.filter((s) => s.subjectId === sub.id).length;
            return (
              <TouchableOpacity
                key={sub.id}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setSelectedSubjectId(sub.id)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {sub.name} ({count})
                </Text>
              </TouchableOpacity>
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
                : 'Start logging sessions or use the live timer to see your history!'}
            </Text>
          </View>
        ) : (
          filteredSessions.map((session) => {
            const sessionDate = new Date(session.date || session.createdAt);
            return (
              <View key={session.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{session.subject?.name || 'General'}</Text>
                  </View>
                  <Text style={styles.dateText}>
                    {sessionDate.toLocaleDateString()}
                  </Text>
                </View>

                {session.topic ? (
                  <Text style={styles.topicText}>{session.topic}</Text>
                ) : null}

                {session.learnedNotes ? (
                  <Text style={styles.notesText}>{session.learnedNotes}</Text>
                ) : null}

                <View style={styles.cardBottom}>
                  <Text style={styles.durationText}>
                    ⏱️ {session.durationMinutes} minutes
                  </Text>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => setDeleteSessionId(session.id)}
                  >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
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
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.black,
    fontWeight: '700',
  },
  content: {
    padding: 20,
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
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderLight,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  topicText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 10,
    marginTop: 6,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteBtnText: {
    fontSize: 12,
    color: colors.red,
    fontWeight: '600',
  },
});
