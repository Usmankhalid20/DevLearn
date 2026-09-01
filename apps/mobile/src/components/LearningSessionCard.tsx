import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { formatHoursMins } from '../utils/time';
import type { LearningSessionDto } from '@devlearn/types';

export interface LearningSessionCardProps {
  session: LearningSessionDto;
  onPress?: () => void;
  onDelete?: (id: string) => void;
  showDate?: boolean;
  compact?: boolean;
}

export function LearningSessionCard({
  session,
  onPress,
  onDelete,
  showDate = false,
  compact = false,
}: LearningSessionCardProps) {
  const sessionDate = session.date || session.createdAt
    ? new Date(session.date || session.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.header}>
        <View style={styles.subjectContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{session.subject?.name || 'General'}</Text>
          </View>
          {showDate && sessionDate ? (
            <Text style={styles.dateText}>{sessionDate}</Text>
          ) : null}
        </View>

        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {formatHoursMins(session.durationMinutes)}
          </Text>
        </View>
      </View>

      {session.topic ? (
        <Text style={styles.topicText} numberOfLines={compact ? 1 : 2}>
          {session.topic}
        </Text>
      ) : null}

      {!compact && session.learnedNotes ? (
        <Text style={styles.notesText} numberOfLines={3}>
          {session.learnedNotes}
        </Text>
      ) : null}

      {!compact && onDelete ? (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => onDelete(session.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={`Delete learning session for ${session.subject?.name || 'General'}`}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  compactCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
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
  durationBadge: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  topicText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginTop: 4,
  },
  notesText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 10,
    marginTop: 10,
  },
  deleteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  deleteBtnText: {
    fontSize: 12,
    color: colors.red,
    fontWeight: '600',
  },
});
