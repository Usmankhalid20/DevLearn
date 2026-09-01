import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { mobileApi } from '../api/client';
import { Chip } from './ui/Chip';
import { FormInput } from './ui/FormInput';
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
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [customMinutes, setCustomMinutes] = useState<string>('30');
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset form whenever modal opens
  useEffect(() => {
    if (visible) {
      if (subjects.length > 0) {
        setSelectedSubjectId(subjects[0].id);
      } else {
        setSelectedSubjectId('');
      }
      setDurationMinutes(30);
      setCustomMinutes('30');
      setTopic('');
      setNotes('');
      setNewSubjectName('');
    }
  }, [visible, subjects]);

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
              <Text style={styles.title}>Log Learning</Text>
              <Text style={styles.subtitle}>Record your study time in seconds</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={20} color={colors.textSecondary} />
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
              <FormInput
                placeholder="e.g. Data Structures, React, Python"
                value={newSubjectName}
                onChangeText={setNewSubjectName}
              />
            )}

            {/* Duration Selector */}
            <Text style={[styles.label, { marginTop: 16 }]}>
              2. Duration (Minutes)
            </Text>
            <View style={styles.presetRow}>
              {PRESET_MINUTES.map((m) => (
                <Chip
                  key={m}
                  label={`${m}m`}
                  selected={durationMinutes === m}
                  style={styles.presetChip}
                  onPress={() => {
                    setDurationMinutes(m);
                    setCustomMinutes(String(m));
                  }}
                />
              ))}
            </View>

            <FormInput
              placeholder="Or enter custom minutes"
              keyboardType="number-pad"
              value={customMinutes}
              onChangeText={(val) => {
                setCustomMinutes(val);
                setDurationMinutes(parseInt(val, 10) || 0);
              }}
              containerStyle={{ marginTop: 8 }}
            />

            {/* Optional Topic / Notes */}
            <Text style={[styles.label, { marginTop: 8 }]}>
              3. Topic &amp; Notes (Optional)
            </Text>
            <FormInput
              placeholder="What did you work on? (e.g. Graph BFS)"
              value={topic}
              onChangeText={setTopic}
            />

            <FormInput
              placeholder="Key takeaways or summary..."
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
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Save Learning Session"
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
  presetRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  presetChip: {
    flex: 1,
    marginRight: 6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  submitBtn: {
    backgroundColor: colors.white,
    paddingVertical: 14,
    minHeight: 48,
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

