import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { Card } from '../ui/Card';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/tokens';
import type { RecentUpload } from '../../types/employee';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecentUploadItemProps {
  upload: RecentUpload;
  onPress: (upload: RecentUpload) => void;
  style?: ViewStyle;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FILE_TYPE_COLORS: Record<RecentUpload['fileType'], string> = {
  image: Colors.primary,
  pdf: Colors.danger,
  doc: '#1A73E8',
  other: Colors.textSecondary,
};

const FILE_TYPE_LABELS: Record<RecentUpload['fileType'], string> = {
  image: 'IMG',
  pdf: 'PDF',
  doc: 'DOC',
  other: 'FILE',
};

function formatRelativeDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  } catch {
    return isoDate;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const RecentUploadItem: React.FC<RecentUploadItemProps> = ({
  upload,
  onPress,
  style,
}) => {
  const typeColor = FILE_TYPE_COLORS[upload.fileType];
  const typeLabel = FILE_TYPE_LABELS[upload.fileType];

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(upload)}
      style={style}
    >
      <Card noPadding style={styles.card}>
        {/* File type icon placeholder */}
        <View style={[styles.fileIcon, { backgroundColor: `${typeColor}18` }]}>
          <Text style={[styles.fileType, { color: typeColor }]}>{typeLabel}</Text>
        </View>

        {/* Text info */}
        <View style={styles.info}>
          <Text style={styles.filename} numberOfLines={1}>
            {upload.filename}
          </Text>
          <Text style={styles.meta}>
            {upload.projectName} · {formatRelativeDate(upload.uploadedAt)}
          </Text>
        </View>

        {/* Chevron */}
        <Text style={styles.chevron}>›</Text>
      </Card>
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[3],
    gap: Spacing[3],
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileType: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  filename: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  meta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
});
