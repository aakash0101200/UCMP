import React from 'react';
import { View, Text } from 'react-native';

interface CircularProgressProps {
  percentage: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  textColor?: string;
  isDark?: boolean;
}

export default function CircularProgress({
  percentage,
  color = '#6366F1',
  size = 80,
  strokeWidth = 8,
  textColor = '#0F172A',
  isDark = false
}: CircularProgressProps) {
  const cleanPct = Math.max(0, Math.min(100, percentage));
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: isDark ? '#27272A' : '#E2E8F0',
      }} />
      <View style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: 'transparent',
        borderTopColor: color,
        borderRightColor: cleanPct > 25 ? color : 'transparent',
        borderBottomColor: cleanPct > 50 ? color : 'transparent',
        borderLeftColor: cleanPct > 75 ? color : 'transparent',
        transform: [{ rotate: '45deg' }]
      }} />
      <Text style={{ fontSize: size * 0.22, fontWeight: 'bold', color: textColor }}>
        {cleanPct.toFixed(0)}%
      </Text>
    </View>
  );
}
