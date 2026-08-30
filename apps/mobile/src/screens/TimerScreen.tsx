import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { mobileApi } from '../api/client';
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

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
        'Session Saved!',
        `Logged ${durationMinutes} minutes of focused learning.`,
        [
          {
            text: 'OK',
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Timer Display Card */}
      <View style={styles.timerCard}>
        <Text style={styles.statusLabel}>
          {isRunning ? 'FOCUS SESSION ACTIVE' : seconds > 0 ? 'TIMER PAUSED' : 'READY TO FOCUS'}
        </Text>
        <Text style={styles.timerDisplay}>{formatTime(seconds)}</Text>
        <Text style={styles.minutesEstimate}>
          Approx. {Math.max(1, Math.round(seconds / 60))} minute(s)
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.mainBtn, isRunning ? styles.pauseBtn : styles.startBtn]}
          onPress={() => setIsRunning(!isRunning)}
        >
          <Text style={[styles.mainBtnText, isRunning && styles.pauseBtnText]}>
            {isRunning ? 'Pause Timer' : seconds > 0 ? 'Resume Timer' : 'Start Focus'}
          </Text>
        </TouchableOpacity>

        {seconds > 0 && (
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Subject Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Subject</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {subjects.map((sub) => {
            const isSelected = selectedSubjectId === sub.id;
            return (
              <TouchableOpacity
                key={sub.id}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setSelectedSubjectId(sub.id)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {sub.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Topic & Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Topic / Focus Area (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Dynamic Programming Memoization"
          placeholderTextColor={colors.textMuted}
          value={topic}
          onChangeText={setTopic}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes &amp; Takeaways (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Key concepts reviewed..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      {/* Finish & Auto-Log Button */}
      {seconds > 0 && (
        <TouchableOpacity
          style={styles.finishBtn}
          onPress={handleFinishAndSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.finishBtnText}>Finish &amp; Save Session</Text>
          )}
        </TouchableOpacity>
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
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  startBtn: {
    backgroundColor: colors.white,
  },
  pauseBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
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
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
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
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.black,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.white,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  finishBtn: {
    backgroundColor: colors.emerald,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  finishBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
