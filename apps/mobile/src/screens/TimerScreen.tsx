import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Play, Pause, RotateCcw, Check } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { mobileApi } from '../api/client';
import { Chip } from '../components/ui/Chip';
import { FormInput } from '../components/ui/FormInput';
import { formatTime } from '../utils/time';
import type { SubjectDto } from '@devlearn/types';

export function TimerScreen({ navigation }: { navigation: any }) {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    mobileApi.getSubjects().then((subs) => {
      setSubjects(subs);
      if (subs.length > 0) setSelectedSubjectId(subs[0].id);
    });
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleFinishAndSave = async () => {
    if (!selectedSubjectId) {
      Alert.alert('Select Subject', 'Please select a subject for this session.');
      return;
    }

    const durationMinutes = Math.max(1, Math.round(seconds / 60));

    setIsSaving(true);
    setIsRunning(false);

    try {
      await mobileApi.logSession({
        subjectId: selectedSubjectId,
        durationMinutes,
        topic: topic.trim() || undefined,
        learnedNotes: notes.trim() || undefined,
      });

      Alert.alert(
        'Session Saved',
        `Logged ${durationMinutes} minutes of focused learning.`,
        [
          {
            text: 'View Dashboard',
            onPress: () => {
              setSeconds(0);
              setTopic('');
              setNotes('');
              navigation.navigate('Dashboard');
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        'Save Failed',
        err?.response?.data?.message || 'Failed to auto-save session. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const estimatedMinutes = Math.max(1, Math.round(seconds / 60));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Timer Display Card */}
      <View style={styles.timerCard}>
        <Text style={styles.statusLabel}>
          {isRunning ? 'FOCUS SESSION ACTIVE' : seconds > 0 ? 'TIMER PAUSED' : 'READY TO FOCUS'}
        </Text>
        <Text style={styles.timerDisplay}>{formatTime(seconds)}</Text>
        <Text style={styles.minutesEstimate}>
          {seconds > 0 ? `Approx. ${estimatedMinutes} minute(s)` : '0 minutes elapsed'}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.mainBtn, isRunning ? styles.pauseBtn : styles.startBtn]}
          onPress={() => setIsRunning(!isRunning)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isRunning ? 'Pause Timer' : seconds > 0 ? 'Resume Timer' : 'Start Focus Timer'}
        >
          {isRunning ? (
            <Pause size={18} color={colors.white} strokeWidth={2.5} style={styles.btnIcon} />
          ) : (
            <Play size={18} color={colors.black} strokeWidth={2.5} style={styles.btnIcon} />
          )}
          <Text style={[styles.mainBtnText, isRunning && styles.pauseBtnText]}>
            {isRunning ? 'Pause Timer' : seconds > 0 ? 'Resume Timer' : 'Start Focus'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resetBtn, seconds === 0 && styles.btnDisabled]}
          onPress={handleReset}
          disabled={seconds === 0}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Reset Timer"
        >
          <RotateCcw size={16} color={seconds === 0 ? colors.textMuted : colors.textSecondary} />
          <Text style={[styles.resetBtnText, seconds === 0 && styles.disabledText]}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Subject Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Subject</Text>
        {subjects.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {subjects.map((sub) => (
              <Chip
                key={sub.id}
                label={sub.name}
                selected={selectedSubjectId === sub.id}
                onPress={() => setSelectedSubjectId(sub.id)}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptySubjectText}>
            No subjects found. Create a subject in Quick Log or Settings first.
          </Text>
        )}
      </View>

      {/* Topic & Notes Form */}
      <FormInput
        label="Topic / Focus Area (Optional)"
        placeholder="e.g. Dynamic Programming Memoization"
        value={topic}
        onChangeText={setTopic}
      />

      <FormInput
        label="Notes & Takeaways (Optional)"
        placeholder="Key concepts reviewed..."
        multiline
        numberOfLines={3}
        value={notes}
        onChangeText={setNotes}
      />

      {/* Finish & Save Button (Monochrome, Always Visible, Disabled when 0s) */}
      <TouchableOpacity
        style={[
          styles.finishBtn,
          (seconds === 0 || isSaving) && styles.finishBtnDisabled,
        ]}
        onPress={handleFinishAndSave}
        disabled={seconds === 0 || isSaving}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Finish and Save Learning Session"
      >
        {isSaving ? (
          <ActivityIndicator color={colors.black} />
        ) : (
          <View style={styles.finishContentRow}>
            <Check size={18} color={seconds === 0 ? colors.textMuted : colors.black} strokeWidth={2.5} />
            <Text
              style={[
                styles.finishBtnText,
                seconds === 0 && styles.finishBtnTextDisabled,
              ]}
            >
              Finish &amp; Save Session
            </Text>
          </View>
        )}
      </TouchableOpacity>
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
  timerCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 36,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  timerDisplay: {
    fontSize: 52,
    fontWeight: '900',
    color: colors.white,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  minutesEstimate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  mainBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 15,
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startBtn: {
    backgroundColor: colors.white,
  },
  pauseBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  btnIcon: {
    marginRight: 2,
  },
  mainBtnText: {
    color: colors.black,
    fontSize: 15,
    fontWeight: '700',
  },
  pauseBtnText: {
    color: colors.white,
  },
  resetBtn: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 15,
    minHeight: 52,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  disabledText: {
    color: colors.textMuted,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
  },
  emptySubjectText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  finishBtn: {
    backgroundColor: colors.white,
    paddingVertical: 15,
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  finishBtnDisabled: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
  },
  finishContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  finishBtnText: {
    color: colors.black,
    fontSize: 15,
    fontWeight: '700',
  },
  finishBtnTextDisabled: {
    color: colors.textMuted,
  },
});

