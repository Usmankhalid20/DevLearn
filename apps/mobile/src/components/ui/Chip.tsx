import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';

export interface ChipProps {
  label: string;
  selected?: boolean;
  count?: number;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export function Chip({
  label,
  selected = false,
  count,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
}: ChipProps) {
  const displayLabel = count !== undefined ? `${label} (${count})` : label;

  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipActive, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel || displayLabel}
    >
      <Text
        style={[styles.chipText, selected && styles.chipTextActive, textStyle]}
        numberOfLines={1}
      >
        {displayLabel}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.black,
    fontWeight: '700',
  },
});
