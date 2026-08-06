import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import { ProgressBar } from '../ui/ProgressBar';
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSize,
  Spacing,
} from '../../constants/tokens';
import type { Project } from '../../types/employee';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
  onPress: (project: Project) => void;
  style?: ViewStyle;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Progress fill colour tracks project status — Stitch shows navy for in-flight
// work and green once a project reaches completion.
const PROGRESS_FILL: Record<Project['status'], string> = {
  ongoing: Colors.primary,
  completed: Colors.success,
  onhold: Colors.warning,
  pending: Colors.warning,
  approved: Colors.success,
  rejected: Colors.danger,
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(project)}
      style={style}
    >
      <Card noPadding style={styles.card}>
        {/* Identity row: icon tile + name/location + status badge */}
        <View style={styles.identityRow}>
          <View style={styles.iconTile}>
            <Icon name="site" size="md" color={Colors.primary} />
          </View>

          <View style={styles.identityText}>
            <Text style={styles.projectName} numberOfLines={1}>
              {project.name}
            </Text>

            {project.location ? (
              <View style={styles.locationRow}>
                <Icon
                  name="locationOutline"
                  size="sm"
                  color={Colors.textMuted}
                />
                <Text style={styles.locationText} numberOfLines={1}>
                  {project.location}
                </Text>
              </View>
            ) : null}
          </View>

          <Badge variant={project.status} style={styles.badge} />
        </View>

        <View style={styles.divider} />

        {/* Meta row: start date + progress percentage */}
        <View style={styles.metaRow}>
          <View style={styles.dateGroup}>
            <Icon name="calendarOutline" size="sm" color={Colors.textMuted} />
            <Text style={styles.dateText}>{formatDate(project.startDate)}</Text>
          </View>

          <Text style={styles.percentText}>{project.progress}%</Text>
        </View>

        <ProgressBar
          value={project.progress}
          showLabel={false}
          fillColor={PROGRESS_FILL[project.status]}
        />
      </Card>
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    padding: Spacing[4],
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.infoSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: {
    flex: 1,
    gap: Spacing[1],
  },
  projectName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  locationText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
    color: Colors.textMuted,
    flexShrink: 1,
  },
  badge: {
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: Spacing[3],
    marginBottom: Spacing[3],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[2],
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  dateText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
    color: Colors.textMuted,
  },
  percentText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    lineHeight: 16,
    color: Colors.textPrimary,
  },
});
