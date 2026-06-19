import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Pressable,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SidebarDrawerProps {
  isDrawerOpen: boolean;
  drawerTranslateX: Animated.Value;
  userName: string;
  collegeId: string;
  activeRole: string | null;
  availableRoles: string[];
  menuItems: Array<{ title: string; tab: string; icon: string }>;
  activeTab: string;
  activeColor: string;
  activeSoftColor: string;
  isDark: boolean;
  toggleDrawer: (open: boolean) => void;
  onTabPress: (tab: string) => void;
  onRoleSwitch: (role: 'STUDENT' | 'FACULTY') => void;
  onLogout: () => void;
}

export default function SidebarDrawer({
  isDrawerOpen,
  drawerTranslateX,
  userName,
  collegeId,
  activeRole,
  availableRoles,
  menuItems,
  activeTab,
  activeColor,
  activeSoftColor,
  isDark,
  toggleDrawer,
  onTabPress,
  onRoleSwitch,
  onLogout
}: SidebarDrawerProps) {
  return (
    <>
      {isDrawerOpen && (
        <Pressable style={styles.drawerOverlay} onPress={() => toggleDrawer(false)} />
      )}
      
      <Animated.View style={[
        styles.drawerContainer,
        isDark ? styles.drawerDark : styles.drawerLight,
        { transform: [{ translateX: drawerTranslateX }] }
      ]}>
        
        {/* Drawer Header */}
        <View style={[styles.drawerHeader, { borderBottomColor: isDark ? '#27272A' : '#E2E8F0' }]}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: activeColor }]}>
            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
          </View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={[styles.drawerName, isDark ? styles.textLight : styles.textDark]} numberOfLines={1}>
              {userName}
            </Text>
            <Text style={styles.drawerMeta} numberOfLines={1}>{collegeId}</Text>
            <View style={[styles.drawerRoleBadge, { backgroundColor: activeSoftColor, borderColor: activeColor }]}>
              <Text style={[styles.drawerRoleText, { color: activeColor }]}>{activeRole}</Text>
            </View>
          </View>
        </View>

        {/* Sidebar menu routes */}
        <ScrollView style={styles.drawerLinksContainer} bounces={false}>
          <Text style={styles.drawerSectionLabel}>Navigation</Text>
          
          {menuItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <TouchableOpacity
                key={item.tab}
                style={[
                  styles.drawerLink,
                  isActive && { backgroundColor: activeSoftColor }
                ]}
                onPress={() => {
                  onTabPress(item.tab);
                  toggleDrawer(false);
                }}
              >
                <Feather 
                  name={item.icon as any} 
                  size={18} 
                  color={isActive ? activeColor : (isDark ? '#A1A1AA' : '#64748B')} 
                  style={{ width: 24 }}
                />
                <Text style={[
                  styles.drawerLinkLabel,
                  isDark ? styles.textLightMuted : styles.textDarkMuted,
                  isActive && { color: activeColor, fontWeight: 'bold' }
                ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={[styles.drawerDivider, { backgroundColor: isDark ? '#27272A' : '#E2E8F0' }]} />
          
          <Text style={styles.drawerSectionLabel}>Account & Portal</Text>
          
          {availableRoles.length > 1 && (
            <TouchableOpacity
              style={styles.drawerLink}
              onPress={() => {
                const nextRole = activeRole === 'STUDENT' ? 'FACULTY' : 'STUDENT';
                onRoleSwitch(nextRole);
                toggleDrawer(false);
              }}
            >
              <Feather name="repeat" size={18} color={isDark ? '#A1A1AA' : '#64748B'} style={{ width: 24 }} />
              <Text style={[styles.drawerLinkLabel, isDark ? styles.textLightMuted : styles.textDarkMuted]}>
                Switch to {activeRole === 'STUDENT' ? 'Faculty' : 'Student'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.drawerLink}
            onPress={() => {
              toggleDrawer(false);
              onLogout();
            }}
          >
            <Feather name="log-out" size={18} color="#F43F5E" style={{ width: 24 }} />
            <Text style={[styles.drawerLinkLabel, { color: '#F43F5E', fontWeight: 'bold' }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 99,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 280,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderRightWidth: 1,
  },
  drawerLight: {
    backgroundColor: '#FFFFFF',
    borderRightColor: '#E2E8F0',
  },
  drawerDark: {
    backgroundColor: '#18181B',
    borderRightColor: '#27272A',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 22,
  },
  drawerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  drawerMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  drawerRoleBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  drawerRoleText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  drawerLinksContainer: {
    padding: 16,
  },
  drawerSectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 8,
    marginTop: 16,
  },
  drawerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  drawerLinkLabel: {
    fontSize: 14,
    marginLeft: 12,
  },
  drawerDivider: {
    height: 1,
    marginVertical: 16,
  },
  textLight: {
    color: '#FAFAFA',
  },
  textDark: {
    color: '#0F172A',
  },
  textLightMuted: {
    color: '#E4E4E7',
  },
  textDarkMuted: {
    color: '#334155',
  },
});
