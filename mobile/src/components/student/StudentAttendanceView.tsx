import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Pressable
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ActiveSession, SubjectAttendance } from '../../types';

interface StudentAttendanceViewProps {
  activeSession: ActiveSession | null;
  isLoadingSession: boolean;
  passcode: string;
  setPasscode: (val: string) => void;
  isSubmittingAttendance: boolean;
  subjectsExpanded: boolean;
  setSubjectsExpanded: (val: boolean) => void;
  historyExpanded: boolean;
  setHistoryExpanded: (val: boolean) => void;
  studentAttendanceSummary: SubjectAttendance[];
  attendanceLogs: any[];
  activeColor: string;
  isDark: boolean;
  dynamicStyles: any;
  otpInputRef: React.RefObject<TextInput | null>;
  fetchActiveSession: () => void;
  submitAttendance: () => void;
  getStatusColor: (pct: number) => { ring: string; text: string; bg: string; label: string };
}

export default function StudentAttendanceView({
  activeSession,
  isLoadingSession,
  passcode,
  setPasscode,
  isSubmittingAttendance,
  subjectsExpanded,
  setSubjectsExpanded,
  historyExpanded,
  setHistoryExpanded,
  studentAttendanceSummary,
  attendanceLogs,
  activeColor,
  isDark,
  dynamicStyles,
  otpInputRef,
  fetchActiveSession,
  submitAttendance,
  getStatusColor
}: StudentAttendanceViewProps) {
  return (
    <View style={styles.tabContentContainer}>
      
      {/* Live Class Verification Panel */}
      <View style={[
        styles.card, 
        dynamicStyles.card, 
        styles.spaceBottom,
        { borderLeftColor: activeSession ? '#10B981' : '#64748B', borderLeftWidth: 4 }
      ]}>
        <View style={styles.sessionStatusHeader}>
          <View style={[styles.statusDot, { backgroundColor: activeSession ? '#10B981' : '#64748B' }]} />
          <Text style={[styles.sessionStatusTitle, dynamicStyles.sessionStatusTitle]}>
            {activeSession ? 'Live Class Verification Active' : 'No Class in Progress'}
          </Text>
        </View>

        {isLoadingSession ? (
          <ActivityIndicator size="small" color={activeColor} style={{ marginVertical: 20 }} />
        ) : activeSession ? (
          <View style={styles.sessionDetails}>
            <Text style={styles.subjectCode}>{activeSession.subjectCode}</Text>
            <Text style={[styles.subjectName, dynamicStyles.subjectName]}>{activeSession.subjectName}</Text>
            <Text style={[styles.sectionBadge, dynamicStyles.sectionBadge]}>Section: {activeSession.sectionName}</Text>
            
            <Text style={[styles.instruction, dynamicStyles.instruction]}>
              Enter the 6-digit passcode shown on the projector:
            </Text>

            {/* Segmented OTP passcode widgets */}
            <Pressable style={styles.otpInputContainer} onPress={() => otpInputRef.current?.focus()}>
              <TextInput
                ref={otpInputRef as any}
                style={styles.hiddenOtpInput}
                keyboardType="number-pad"
                maxLength={6}
                value={passcode}
                onChangeText={(val) => setPasscode(val.replace(/[^0-9]/g, ''))}
              />
              <View style={styles.segmentedOtpRow}>
                {Array.from({ length: 6 }).map((_, idx) => {
                  const digit = passcode[idx] || '';
                  const isFocused = passcode.length === idx;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.segmentedOtpBox,
                        dynamicStyles.input,
                        isFocused && { borderColor: activeColor, borderWidth: 2 }
                      ]}
                    >
                      <Text style={[styles.segmentedOtpText, { color: digit ? activeColor : (isDark ? '#FAFAFA' : '#0F172A') }]}>
                        {digit || (isFocused ? '|' : '·')}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Pressable>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: activeColor, marginTop: 15 }]}
              onPress={submitAttendance}
              disabled={isSubmittingAttendance}
            >
              {isSubmittingAttendance ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Submit Attendance</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptySessionView}>
            <Text style={[styles.emptySessionText, dynamicStyles.emptySessionText]}>
              No active attendance sessions were found for your section. Make sure the instructor has started the session.
            </Text>
            <TouchableOpacity style={[styles.refreshButton, dynamicStyles.refreshButton]} onPress={fetchActiveSession}>
              <Text style={[styles.refreshButtonText, { color: activeColor }]}>Refresh Search</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Collapsible Subject breakdown (Accordion style) */}
      <View style={[styles.card, dynamicStyles.card, styles.spaceBottom]}>
        <TouchableOpacity 
          style={styles.accordionHeader} 
          onPress={() => setSubjectsExpanded(!subjectsExpanded)}
        >
          <Text style={[styles.cardTitle, dynamicStyles.cardTitle, { fontSize: 18, marginBottom: 0 }]}>
            Subject Wise Attendance
          </Text>
          <Feather name={subjectsExpanded ? "chevron-up" : "chevron-down"} size={20} color={activeColor} />
        </TouchableOpacity>

        {subjectsExpanded && (
          <View style={styles.accordionContent}>
            {studentAttendanceSummary.length > 0 ? (
              studentAttendanceSummary.map((sub, i) => {
                const pct = sub.totalClasses > 0 ? (sub.attended / sub.totalClasses) * 100 : 0;
                const config = getStatusColor(pct);
                return (
                  <View key={i} style={styles.subjectBreakdownRow}>
                    <View style={styles.subjectMeta}>
                      <Text style={[styles.subjectCodeText, dynamicStyles.studentName]}>{sub.subjectCode}</Text>
                      <Text style={styles.subjectNameSub}>{sub.subjectName}</Text>
                    </View>
                    <View style={styles.subjectProgressContainer}>
                      <View style={[styles.progressTrack, dynamicStyles.progressTrack]}>
                        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: config.ring }]} />
                      </View>
                      <Text style={[styles.subjectPctText, { color: config.text }]}>
                        {pct.toFixed(0)}% ({sub.attended}/{sub.totalClasses})
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.rosterEmptyText}>No subject summary data available.</Text>
            )}
          </View>
        )}
      </View>

      {/* Collapsible History Logs (Accordion style) */}
      <View style={[styles.card, dynamicStyles.card, styles.spaceBottom]}>
        <TouchableOpacity 
          style={styles.accordionHeader} 
          onPress={() => setHistoryExpanded(!historyExpanded)}
        >
          <Text style={[styles.cardTitle, dynamicStyles.cardTitle, { fontSize: 18, marginBottom: 0 }]}>
            Recent Activity Log
          </Text>
          <Feather name={historyExpanded ? "chevron-up" : "chevron-down"} size={20} color={activeColor} />
        </TouchableOpacity>

        {historyExpanded && (
          <View style={styles.accordionContent}>
            {attendanceLogs.length > 0 ? (
              attendanceLogs.map((log: any, i: number) => (
                <View key={i} style={[styles.rosterRow, { borderBottomColor: isDark ? '#27272A' : '#F1F5F9' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rosterStudentName, dynamicStyles.studentName]}>{log.subjectName}</Text>
                    <Text style={styles.rosterStudentMeta}>{log.markedAt.replace('T', ' ').substring(0, 16)}</Text>
                  </View>
                  <Text style={styles.rosterMarkedTime}>✓ Checked-In</Text>
                </View>
              ))
            ) : (
              <Text style={styles.rosterEmptyText}>No attendance records found.</Text>
            )}
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
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  spaceBottom: {
    marginBottom: 20,
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
  sessionDetails: {
    marginTop: 8,
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
  instruction: {
    fontSize: 14,
    marginTop: 20,
    marginBottom: 12,
  },
  otpInputContainer: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenOtpInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    zIndex: 10,
  },
  segmentedOtpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 280,
  },
  segmentedOtpBox: {
    width: 40,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedOtpText: {
    fontSize: 22,
    fontWeight: 'bold',
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
  emptySessionView: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptySessionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  refreshButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  refreshButtonText: {
    fontWeight: '600',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  accordionContent: {
    marginTop: 20,
  },
  subjectBreakdownRow: {
    marginBottom: 16,
  },
  subjectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectCodeText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  subjectNameSub: {
    color: '#64748B',
    fontSize: 12,
  },
  subjectProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  subjectPctText: {
    fontSize: 12,
    fontWeight: 'bold',
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
});
