import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { Colors, FontFamily, FontSize, BorderRadius, InputHeight } from '../../constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DropdownProps {
  label?: string;
  placeholder?: string;
  value: string | null;
  options: string[];
  onSelect: (value: string) => void;
  containerStyle?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = 'Select…',
  value,
  options,
  onSelect,
  containerStyle,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.trigger}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value ?? placeholder}
        </Text>
        <Text style={styles.chevron}>⌄</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            {options.map((opt) => {
              const active = opt === value;
              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.7}
                  style={styles.option}
                  onPress={() => {
                    onSelect(opt);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {opt}
                  </Text>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    height: InputHeight,
    paddingHorizontal: 14,
  },
  value: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  placeholder: {
    color: Colors.textSecondary,
  },
  chevron: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.40)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    paddingVertical: 8,
    ...( {
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    }),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  optionTextActive: {
    fontFamily: FontFamily.medium,
    color: Colors.primary,
  },
  check: {
    fontSize: 16,
    color: Colors.primary,
  },
});
