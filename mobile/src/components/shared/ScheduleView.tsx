import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TimetableSlot } from '../../types';

interface ScheduleViewProps {
  isLoadingSchedule: boolean;
  filteredSchedule: TimetableSlot[];
  activeDay: string;
  activeRole: string | null;
  activeColor: string;
  activeSoftColor: string;
  isDark: boolean;
  dynamicStyles: any;
  setActiveDay: (day: string) => void;
}

export default function ScheduleView({
  isLoadingSchedule,
  filteredSchedule,
  activeDay,
  activeRole,
  activeColor,
  activeSoftColor,
  isDark,
  dynamicStyles,
  setActiveDay
}: ScheduleViewProps) {
  const getDayLabel = (d: string) => {
    const list: Record<string, string> = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri' };
    return list[d] || d.substring(0, 3);
  };

  return (
    <View style={styles.tabContentContainer}>
      {/* Day selector switches */}
      <View style={[styles.daySwitcher, { backgroundColor: activeSoftColor }]}>
        {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map((d) => (
          <TouchableOpacity
            key={d}
            style={[
              styles.dayTab,
              activeDay === d && { backgroundColor: activeColor }
            ]}
            onPress={() => setActiveDay(d)}
          >
            <Text style={[
              styles.dayTabText,
              activeDay === d && { color: '#FFFFFF' }
            ]}>
              {getDayLabel(d)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timetable schedule list */}
      {isLoadingSchedule ? (
        <ActivityIndicator size="large" color={activeColor} style={{ marginVertical: 40 }} />
      ) : filteredSchedule.length > 0 ? (
        filteredSchedule.map((slot) => (
          <View key={slot.id} style={[styles.card, dynamicStyles.card, styles.spaceBottom, styles.slotCard, { borderLeftColor: activeColor }]}>
            <View style={styles.slotTimeRow}>
              <Text style={[styles.slotTimeText, { color: activeColor }]}>
                {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
              </Text>
              <Text style={[styles.slotRoomText, dynamicStyles.sectionBadge]}>Room {slot.roomName}</Text>
            </View>
            <Text style={styles.subjectCode}>{slot.subjectCode}</Text>
            <Text style={[styles.subjectName, dynamicStyles.subjectName]}>{slot.subjectName}</Text>
            <Text style={styles.slotFacultyText}>
              {activeRole === 'STUDENT' ? `Instructor: ${slot.facultyName}` : `Target: Section ${slot.roomName}`}
            </Text>
          </View>
        ))
      ) : (
        <View style={[styles.card, dynamicStyles.card, styles.emptySlotsCard, { borderColor: activeColor }]}>
          <Text style={styles.emptySlotsText}>No classes scheduled for {activeDay.toLowerCase()}. Enjoy your free day! 🎉</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContentContainer: {
    width: '100%',
  },
  daySwitcher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  dayTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  dayTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  spaceBottom: {
    marginBottom: 20,
  },
  slotCard: {
    borderLeftWidth: 4,
  },
  slotTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotTimeText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  slotRoomText: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 'bold',
  },
  subjectCode: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  subjectName: {
    fontSize: 18,
    marginTop: 4,
    fontWeight: '600',
  },
  slotFacultyText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 10,
  },
  emptySlotsCard: {
    alignItems: 'center',
    paddingVertical: 40,
    borderStyle: 'dashed',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  emptySlotsText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
