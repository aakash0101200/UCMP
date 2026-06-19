import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface BottomNavBarProps {
  menuItems: Array<{ title: string; tab: string; icon: string }>;
  activeTab: string;
  activeColor: string;
  isDark: boolean;
  onTabPress: (tab: string) => void;
}

export default function BottomNavBar({
  menuItems,
  activeTab,
  activeColor,
  isDark,
  onTabPress
}: BottomNavBarProps) {
  return (
    <View style={[styles.bottomNavBar, isDark ? styles.bgDark : styles.bgLight]}>
      {menuItems.map((item) => {
        const isActive = activeTab === item.tab;
        return (
          <TouchableOpacity 
            key={item.tab}
            style={styles.navItem} 
            onPress={() => onTabPress(item.tab)}
          >
            <Feather 
              name={item.icon as any} 
              size={20} 
              color={isActive ? activeColor : '#94A3B8'} 
            />
            <Text style={[styles.navText, isActive && { color: activeColor, fontWeight: 'bold' }]}>
              {item.title.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 18 : 6,
  },
  bgLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  bgDark: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
});
