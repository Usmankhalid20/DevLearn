import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { mobileApi } from '../api/client';
import type { SubjectDto } from '@devlearn/types';

interface QuickLogModalProps {
  visible: boolean;
  subjects: SubjectDto[];
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_MINUTES = [15, 30, 45, 60, 90];

export function QuickLogModal({
  visible,
  subjects,
  onClose,
  onSuccess,
}: QuickLogModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [customMinutes, setCustomMinutes] = useState<string>('30');
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New subject input if no subjects exist
  const [newSubjectName, setNewSubjectName] = useState<string>('');

  const handleSubmit = async () => {
    let subjectId = selectedSubjectId;

    if (!subjectId && !newSubjectName.trim()) {
      Alert.alert('Subject Required', 'Please select or enter a learning subject.');
      return;
    }

    const duration = parseInt(customMinutes, 10);
    if (!duration || duration <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid duration in minutes.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!subjectId && newSubjectName.trim()) {
        const createdSubject = await mobileApi.createSubject(newSubjectName.trim());
        subjectId = createdSubject.id;
      }

      await mobileApi.logSession({
        subjectId,
        durationMinutes: duration,
        topic: topic.trim() || undefined,
        learnedNotes: notes.trim() || undefined,
      });

      // Reset form
      setTopic('');
      setNotes('');
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert(
        'Failed to Log Session',
        err?.response?.data?.message || 'Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>+ Quick Log Learning</Text>
              <Text style={styles.subtitle}>Record your study time in 3 seconds</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Subject Selector */}
            <Text style={styles.label}>1. Select Subject</Text>
            {subjects.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.subjectRow}
              >
                {subjects.map((sub) => {
                  const isSelected = selectedSubjectId === sub.id;
                  return (
                    <TouchableOpacity
                      key={sub.id}
                      style={[
                        styles.subjectChip,
                        isSelected && styles.subjectChipActive,
                      ]}
                      onPress={() => setSelectedSubjectId(sub.id)}
                    >
                      <Text
                        style={[
                          styles.subjectChipText,
                          isSelected && styles.subjectChipTextActive,
                        ]}
                      >
                        {sub.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="e.g. Data Structures, React, Python"
                placeholderTextColor={colors.textMuted}
                value={newSubjectName}
                onChangeText={setNewSubjectName}
              />
            )}

            {/* Duration Selector */}
            <Text style={[styles.label, { marginTop: 16 }]}>
              2. Duration (Minutes)
            </Text>
            <View style={styles.presetRow}>
              {PRESET_MINUTES.map((m) => {
                const isSelected = durationMinutes === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.presetChip,
                      isSelected && styles.presetChipActive,
                    ]}
                    onPress={() => {
                      setDurationMinutes(m);
                      setCustomMinutes(String(m));
                    }}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        isSelected && styles.presetChipTextActive,
                      ]}
                    >
                      {m}m
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Or enter custom minutes"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={customMinutes}
              onChangeText={(val) => {
                setCustomMinutes(val);
                setDurationMinutes(parseInt(val, 10) || 0);
              }}
            />

            {/* Optional Topic / Notes */}
            <Text style={[styles.label, { marginTop: 16 }]}>
              3. Topic or Notes (Optional)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="What did you work on? (e.g. Graph BFS)"
              placeholderTextColor={colors.textMuted}
              value={topic}
              onChangeText={setTopic}
            />

            <TextInput
              style={[styles.input, styles.textArea, { marginTop: 8 }]}
              placeholder="Key takeaways or summary..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </ScrollView>

          {/* Footer Submit */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.black} />
              ) : (
                <Text style={styles.submitBtnText}>Save Learning Session</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: colors.border,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  body: {
    padding: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subjectRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  subjectChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    marginRight: 8,
  },
  subjectChipActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  subjectChipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  subjectChipTextActive: {
    color: colors.black,
    fontWeight: '700',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
  },
  presetChipActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  presetChipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: colors.black,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.white,
    fontSize: 14,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  submitBtn: {
    backgroundColor: colors.white,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: colors.black,
    fontSize: 14,
    fontWeight: '700',
  },
});
