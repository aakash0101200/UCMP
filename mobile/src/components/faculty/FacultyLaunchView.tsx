import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ActiveSession, RosterRecord, Section, Subject } from '../../types';

interface FacultyLaunchViewProps {
  activeSession: ActiveSession | null;
  selectedSection: Section | null;
  selectedSubject: Subject | null;
  duration: number;
  radius: number;
  isStartingSession: boolean;
  facultyRoster: RosterRecord[];
  rotatingCode: string;
  isDark: boolean;
  activeColor: string;
  dynamicStyles: any;
  setSectionModalVisible: (val: boolean) => void;
  setSubjectModalVisible: (val: boolean) => void;
  setDurationModalVisible: (val: boolean) => void;
  setRadiusModalVisible: (val: boolean) => void;
  startFacultySession: () => void;
  endFacultySession: () => void;
}

export default function FacultyLaunchView({
  activeSession,
  selectedSection,
  selectedSubject,
  duration,
  radius,
  isStartingSession,
  facultyRoster,
  rotatingCode,
  isDark,
  activeColor,
  dynamicStyles,
  setSectionModalVisible,
  setSubjectModalVisible,
  setDurationModalVisible,
  setRadiusModalVisible,
  startFacultySession,
  endFacultySession
}: FacultyLaunchViewProps) {
  return (
    <View style={styles.facultyPanel}>
      {activeSession ? (
        <View style={[styles.card, dynamicStyles.card, { borderLeftColor: '#10B981', borderLeftWidth: 4 }]}>
          <View style={styles.sessionStatusHeader}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.sessionStatusTitle, dynamicStyles.sessionStatusTitle]}>Lecture Session Live</Text>
          </View>

          <Text style={styles.subjectCode}>{activeSession.subjectCode}</Text>
          <Text style={[styles.subjectName, dynamicStyles.subjectName]}>{activeSession.subjectName}</Text>
          <Text style={[styles.sectionBadge, dynamicStyles.sectionBadge]}>Section: {activeSession.sectionName}</Text>

          <View style={styles.passcodeSection}>
            <Text style={styles.passcodeLabel}>Projector Passcode</Text>
            <Text style={styles.passcodeBig}>{rotatingCode || '------'}</Text>
            <Text style={styles.passcodeExpiry}>Rotates automatically every 30s</Text>
          </View>

          <View style={styles.rosterSection}>
            <View style={styles.rosterHeader}>
              <Text style={[styles.rosterTitle, dynamicStyles.studentName]}>Students Present</Text>
              <Text style={styles.rosterCount}>{facultyRoster.length} Checked In</Text>
            </View>

            <ScrollView style={[styles.rosterListContainer, { backgroundColor: isDark ? '#0D1512' : '#F9FBFC', borderColor: isDark ? '#1B2D26' : '#E2E8F0' }]} nestedScrollEnabled={true}>
              {facultyRoster.length > 0 ? (
                facultyRoster.map((r, i) => (
                  <View key={i} style={[styles.rosterRow, { borderBottomColor: isDark ? '#1B2D26' : '#F1F5F9' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rosterStudentName, dynamicStyles.studentName]}>{r.name}</Text>
                      <Text style={styles.rosterStudentMeta}>{r.collegeId} | Roll: {r.rollNumber || 'N/A'}</Text>
                    </View>
                    <Text style={styles.rosterMarkedTime}>✓ Present</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.rosterEmptyText}>No students checked in yet.</Text>
              )}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#F43F5E', shadowColor: '#F43F5E' }]}
            onPress={endFacultySession}
          >
            <Text style={styles.buttonText}>End Lecture Session</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>Launch Attendance</Text>
          <Text style={[styles.cardInfo, dynamicStyles.cardInfo]}>
            Select your class details. Your coordinates will define the verification boundary.
          </Text>

          <Text style={[styles.dropdownLabel, dynamicStyles.dropdownLabel]}>Target Class Section</Text>
          <TouchableOpacity
            style={[styles.dropdownButton, dynamicStyles.dropdownButton]}
            onPress={() => setSectionModalVisible(true)}
          >
            <Text style={[styles.dropdownButtonText, dynamicStyles.dropdownButtonText]}>
              {selectedSection ? selectedSection.sectionName : 'Select Section...'}
            </Text>
            <Feather name="chevron-down" size={16} color={activeColor} />
          </TouchableOpacity>

          <Text style={[styles.dropdownLabel, dynamicStyles.dropdownLabel]}>Course Subject</Text>
          <TouchableOpacity
            style={[styles.dropdownButton, dynamicStyles.dropdownButton]}
            onPress={() => setSubjectModalVisible(true)}
            disabled={!selectedSection}
          >
            <Text style={[styles.dropdownButtonText, dynamicStyles.dropdownButtonText]}>
              {!selectedSection 
                ? 'Select section first...' 
                : (selectedSubject ? `${selectedSubject.subjectCode} - ${selectedSubject.subjectName}` : 'Select Subject...')}
            </Text>
            <Feather name="chevron-down" size={16} color={activeColor} />
          </TouchableOpacity>

          <View style={styles.parametersRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.dropdownLabel, dynamicStyles.dropdownLabel]}>Duration</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, dynamicStyles.dropdownButton]}
                onPress={() => setDurationModalVisible(true)}
              >
                <Text style={[styles.dropdownButtonText, dynamicStyles.dropdownButtonText]}>
                  {duration} Mins
                </Text>
                <Feather name="clock" size={14} color={activeColor} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.dropdownLabel, dynamicStyles.dropdownLabel]}>Range Limit</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, dynamicStyles.dropdownButton]}
                onPress={() => setRadiusModalVisible(true)}
              >
                <Text style={[styles.dropdownButtonText, dynamicStyles.dropdownButtonText]}>
                  {radius} Meters
                </Text>
                <Feather name="map-pin" size={14} color={activeColor} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: activeColor, shadowColor: activeColor, marginTop: 24 }]}
            onPress={startFacultySession}
            disabled={isStartingSession}
          >
            {isStartingSession ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Start Active Session</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  facultyPanel: {
    width: '100%',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardInfo: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  sessionStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  sessionStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  sectionBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    fontSize: 13,
    marginTop: 10,
    borderWidth: 1,
  },
  passcodeSection: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  passcodeLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#64748B',
  },
  passcodeBig: {
    fontSize: 48,
    fontWeight: '900',
    color: '#10B981', 
    letterSpacing: 6,
    marginVertical: 12,
  },
  passcodeExpiry: {
    color: '#64748B',
    fontSize: 11,
  },
  rosterSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rosterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rosterCount: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
  },
  rosterListContainer: {
    maxHeight: 180,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
  },
  rosterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rosterStudentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  rosterStudentMeta: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  rosterMarkedTime: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  rosterEmptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 14,
  },
  dropdownButton: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  parametersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
