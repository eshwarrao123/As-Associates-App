import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/tokens';

// Central icon size scale — matches Stitch spec
export const IconSize = {
  xs: 14,
  sm: 16,
  md: 20, // default — bottom nav, list items
  lg: 24, // section headers
  xl: 32, // feature icons, empty states
  '2xl': 48, // hero/splash icons
} as const;

export type IconSizeName = keyof typeof IconSize;

// Master icon name map — maps semantic names to MaterialCommunityIcons names
// Add every icon the app uses here. Do not use emoji anywhere after this.
export const IconMap = {
  // Navigation
  home: 'home',
  homeOutline: 'home-outline',
  projects: 'briefcase',
  projectsOutline: 'briefcase-outline',
  attendance: 'calendar-check',
  attendanceOutline: 'calendar-check-outline',
  progress: 'chart-line',
  progressOutline: 'chart-line-variant',
  upload: 'upload',
  uploadOutline: 'upload-outline',
  profile: 'account-circle',
  profileOutline: 'account-circle-outline',
  // Admin nav
  dashboard: 'view-dashboard',
  dashboardOutline: 'view-dashboard-outline',
  employees: 'account-group',
  employeesOutline: 'account-group-outline',
  requests: 'bell',
  requestsOutline: 'bell-outline',
  reports: 'chart-bar',
  reportsOutline: 'chart-bar-outline',
  settings: 'cog',
  settingsOutline: 'cog-outline',
  // Actions
  add: 'plus',
  addCircle: 'plus-circle',
  edit: 'pencil',
  delete: 'trash-can-outline',
  search: 'magnify',
  filter: 'filter-variant',
  back: 'arrow-left',
  chevronRight: 'chevron-right',
  forward: 'arrow-right',
  close: 'close',
  check: 'check',
  checkCircle: 'check-circle',
  // Status
  warning: 'alert-circle',
  error: 'close-circle',
  info: 'information',
  success: 'check-circle',
  pending: 'clock-outline',
  // Content
  location: 'map-marker',
  locationOutline: 'map-marker-outline',
  camera: 'camera',
  photo: 'image',
  document: 'file-document-outline',
  calendar: 'calendar',
  calendarOutline: 'calendar-blank-outline',
  compassOutline: 'compass-outline',
  clock: 'clock-outline',
  phone: 'phone',
  email: 'email-outline',
  // Project
  site: 'domain',
  engineer: 'hard-hat',
  client: 'office-building',
  clientOutline: 'office-building-outline',
} as const;

export type IconName = keyof typeof IconMap;

interface IconProps {
  name: IconName;
  size?: IconSizeName | number;
  color?: string;
  style?: object;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = Colors.textPrimary,
  style,
}) => {
  const resolvedSize = typeof size === 'number' ? size : IconSize[size];

  return (
    <MaterialCommunityIcons
      name={IconMap[name] as any}
      size={resolvedSize}
      color={color}
      style={style}
    />
  );
};

export default Icon;
