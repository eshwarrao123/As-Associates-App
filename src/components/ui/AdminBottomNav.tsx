import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Colors,
  FontFamily,
  FontSize,
  BottomNavHeight,
  Shadow,
} from '../../constants/tokens';
import { Icon, IconName } from './Icon';

// ─── Tab config ───────────────────────────────────────────────────────────────

interface TabConfig {
  label: string;
  route: string;
  icon: IconName;
  iconOutline: IconName;
  // usePathname() strips the (admin) group, so match on the bare path
  match: string;
}

const ADMIN_TABS: TabConfig[] = [
  { label: 'Dashboard', route: '/(admin)',           icon: 'dashboard',  iconOutline: 'dashboardOutline',  match: '/' },
  { label: 'Projects',  route: '/(admin)/projects',  icon: 'projects',   iconOutline: 'projectsOutline',   match: '/projects' },
  { label: 'Requests',  route: '/(admin)/requests',  icon: 'requests',   iconOutline: 'requestsOutline',   match: '/requests' },
  { label: 'Employees', route: '/(admin)/employees', icon: 'employees',  iconOutline: 'employeesOutline',  match: '/employees' },
  { label: 'Settings',  route: '/(admin)/settings',  icon: 'settings',   iconOutline: 'settingsOutline',   match: '/settings' },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface AdminBottomNavProps {
  activeIndex?: number;
}

export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({ activeIndex }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // usePathname() can be undefined on the very first Android render — guard it
  const pathname = usePathname() ?? '';

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {ADMIN_TABS.map((tab, index) => {
        const isActive =
          activeIndex !== undefined
            ? activeIndex === index
            : tab.match === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.match);
        return (
          <TouchableOpacity
            key={tab.label}
            activeOpacity={0.7}
            onPress={() => router.push(tab.route as never)}
            style={styles.tab}
          >
            <Icon
              name={isActive ? tab.icon : tab.iconOutline}
              size="md"
              color={isActive ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: BottomNavHeight,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.sm,
    shadowColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    marginTop: 4,
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.primary,
  },
});
