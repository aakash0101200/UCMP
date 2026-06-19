import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface DashboardHeaderProps {
  activeRole: string | null;
  userName: string;
  availableRoles: string[];
  activeColor: string;
  isDark: boolean;
  announcementsLength: number;
  onMenuPress: () => void;
  onRoleSwitch: (role: 'STUDENT' | 'FACULTY') => void;
  onNotificationsPress: () => void;
}

export default function DashboardHeader({
  activeRole,
  userName,
  availableRoles,
  activeColor,
  isDark,
  announcementsLength,
  onMenuPress,
  onRoleSwitch,
  onNotificationsPress
}: DashboardHeaderProps) {
  return (
    <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
      <View style={styles.headerLeftRow}>
        <TouchableOpacity style={styles.iconMenuButton} onPress={onMenuPress}>
          <Feather name="menu" size={24} color={isDark ? '#FAFAFA' : '#0F172A'} />
        </TouchableOpacity>
        <Text style={[styles.welcomeText, isDark ? styles.textMutedDark : styles.textMutedLight]}>
          {activeRole === 'FACULTY' ? 'Faculty Portal' : 'Student Hub'}
        </Text>
      </View>
      
      <View style={styles.headerRightRow}>
        {availableRoles.length > 1 && (
          <TouchableOpacity 
            style={[styles.roleSwitchPill, { borderColor: activeColor }]}
            onPress={() => {
              const nextRole = activeRole === 'STUDENT' ? 'FACULTY' : 'STUDENT';
              onRoleSwitch(nextRole);
            }}
          >
            <Text style={[styles.roleSwitchText, { color: activeColor }]}>
              {activeRole} ⇅
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.notificationBell} onPress={onNotificationsPress}>
          <Feather name="bell" size={20} color={isDark ? '#A1A1AA' : '#64748B'} />
          {announcementsLength > 0 && <View style={[styles.bellDot, { backgroundColor: activeColor }]} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.avatarPlaceholderHeader, { backgroundColor: activeColor }]}
          onPress={onMenuPress}
        >
          <Text style={styles.avatarTextHeader}>{userName.charAt(0)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  headerDark: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconMenuButton: {
    padding: 4,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
  },
  textMutedLight: {
    color: '#64748B',
  },
  textMutedDark: {
    color: '#A1A1AA',
  },
  notificationBell: {
    padding: 8,
    marginRight: 10,
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  avatarPlaceholderHeader: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextHeader: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  roleSwitchPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 12,
  },
  roleSwitchText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
