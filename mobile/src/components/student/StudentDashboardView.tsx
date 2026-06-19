import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Announcement, Assignment, SubjectAttendance } from '../../types';
import CircularProgress from '../ui/CircularProgress';
import DailyFocus from '../ui/DailyFocus';

interface StudentDashboardViewProps {
  userName: string;
  collegeId: string;
  studentAttendanceSummary: SubjectAttendance[];
  weeklyScheduleLength: number;
  assignmentsList: Assignment[];
  announcements: Announcement[];
  isLoadingAnnouncements: boolean;
  activeColor: string;
  activeSoftColor: string;
  isDark: boolean;
  dynamicStyles: any;
  setActiveTab: (tab: string) => void;
  computeOverallAttendance: () => number;
  getStatusColor: (pct: number) => { ring: string; text: string; bg: string; label: string };
}

export default function StudentDashboardView({
  userName,
  collegeId,
  studentAttendanceSummary,
  weeklyScheduleLength,
  assignmentsList,
  announcements,
  isLoadingAnnouncements,
  activeColor,
  activeSoftColor,
  isDark,
  dynamicStyles,
  setActiveTab,
  computeOverallAttendance,
  getStatusColor
}: StudentDashboardViewProps) {
  return (
    <View style={styles.tabContentContainer}>
      
      {/* Dynamic Greeting Title */}
      <View style={styles.greetContainer}>
        <Text style={[styles.greetingTitle, dynamicStyles.studentName]}>
          Hello, <Text style={{ fontWeight: 'normal' }}>{userName.split(' ')[0]}</Text>
        </Text>
        <Text style={[styles.greetingDesc, dynamicStyles.appSubtitle]}>
          Access your academic summary, schedules, and active classroom sessions.
        </Text>
      </View>

      {/* Profile Quick Widget */}
      <View style={[styles.card, dynamicStyles.card, styles.spaceBottom]}>
        <View style={styles.profileCardHeader}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: activeColor }]}>
            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
          </View>
          <View style={{ marginLeft: 16 }}>
            <Text style={[styles.profileCardName, dynamicStyles.studentName]}>{userName}</Text>
            <Text style={styles.profileCardMeta}>College ID: {collegeId}</Text>
            <View style={styles.profileCardTags}>
              <Text style={styles.profileTag}>🎓 Year 3</Text>
              <Text style={styles.profileTag}>Section A</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Grid Dashboard widgets */}
      <View style={[styles.statsGrid, styles.spaceBottom]}>
        <TouchableOpacity 
          style={[styles.gridCard, dynamicStyles.card]}
          onPress={() => setActiveTab('attendance')}
        >
          <View style={styles.gridCardHeader}>
            <Text style={styles.gridCardLabel}>Attendance %</Text>
            <Feather name="book-open" size={16} color={isDark ? '#71717A' : '#94A3B8'} />
          </View>
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <CircularProgress 
              percentage={computeOverallAttendance()} 
              color={getStatusColor(computeOverallAttendance()).ring} 
              isDark={isDark}
              textColor={isDark ? '#FAFAFA' : '#0F172A'}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.gridCard, dynamicStyles.card]}
          onPress={() => setActiveTab('schedule')}
        >
          <View style={styles.gridCardHeader}>
            <Text style={styles.gridCardLabel}>Today's Classes</Text>
            <Feather name="calendar" size={16} color={isDark ? '#71717A' : '#94A3B8'} />
          </View>
          <Text style={[styles.gridBigVal, dynamicStyles.studentName]}>
            {weeklyScheduleLength || '4'}
          </Text>
          <Text style={styles.gridSubText}>Classes Scheduled</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.gridCard, dynamicStyles.card]}
          onPress={() => setActiveTab('assignments')}
        >
          <View style={styles.gridCardHeader}>
            <Text style={styles.gridCardLabel}>Pending Tasks</Text>
            <Feather name="file-text" size={16} color={isDark ? '#71717A' : '#94A3B8'} />
          </View>
          <Text style={[styles.gridBigVal, dynamicStyles.studentName]}>
            {assignmentsList.length || '3'}
          </Text>
          <Text style={styles.gridSubText}>Tasks Remaining</Text>
        </TouchableOpacity>

        <View style={[styles.gridCard, dynamicStyles.card]}>
          <View style={styles.gridCardHeader}>
            <Text style={styles.gridCardLabel}>GPA</Text>
            <Feather name="award" size={16} color={isDark ? '#71717A' : '#94A3B8'} />
          </View>
          <Text style={[styles.gridBigVal, dynamicStyles.studentName]}>3.8</Text>
          <Text style={styles.gridSubText}>Out of 4.0</Text>
        </View>
      </View>

      {/* Daily Focus Breathing widget */}
      <DailyFocus 
        activeColor={activeColor}
        isDark={isDark}
        studentNameStyle={dynamicStyles.studentName}
        appSubtitleStyle={dynamicStyles.appSubtitle}
      />

      {/* Recent Notices Carousel */}
      <View style={styles.spaceBottom}>
        <Text style={[styles.sectionTitle, dynamicStyles.studentName]}>Recent Notices</Text>
        {isLoadingAnnouncements ? (
          <ActivityIndicator size="small" color={activeColor} style={{ marginVertical: 20 }} />
        ) : announcements.length > 0 ? (
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.noticesSlider}>
            {announcements.map((ann, i) => (
              <View key={ann.id || i} style={[styles.noticeCard, dynamicStyles.card]}>
                <View style={styles.noticeHeader}>
                  <Text style={[styles.noticeTitle, dynamicStyles.studentName]} numberOfLines={1}>
                    {ann.title}
                  </Text>
                  <Feather name="bell" size={12} color={activeColor} />
                </View>
                <Text style={styles.noticeDesc} numberOfLines={3}>
                  {ann.description || ann.content}
                </Text>
                <Text style={styles.noticeTime}>
                  {ann.time ? ann.time.replace('T', ' ').substring(0, 16) : 'Recent Announcement'}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.card, dynamicStyles.card, { padding: 24, alignItems: 'center' }]}>
            <Text style={styles.emptyText}>No recent notices from administration.</Text>
          </View>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  tabContentContainer: {
    width: '100%',
  },
  greetContainer: {
    marginVertical: 16,
  },
  greetingTitle: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  greetingDesc: {
    fontSize: 15,
    marginTop: 6,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  spaceBottom: {
    marginBottom: 20,
  },
  profileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  profileCardName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileCardMeta: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  profileCardTags: {
    flexDirection: 'row',
    marginTop: 6,
  },
  profileTag: {
    fontSize: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    color: '#6366F1',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 6,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  gridBigVal: {
    fontSize: 36,
    fontWeight: '300',
    marginTop: 8,
  },
  gridSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noticesSlider: {
    paddingRight: 20,
  },
  noticeCard: {
    width: 240,
    borderRadius: 24,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  noticeDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  noticeTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
});
