import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Assignment } from '../../types';

interface StudentAssignmentsViewProps {
  assignmentsList: Assignment[];
  activeColor: string;
  dynamicStyles: any;
}

export default function StudentAssignmentsView({
  assignmentsList,
  activeColor,
  dynamicStyles
}: StudentAssignmentsViewProps) {
  return (
    <View style={styles.tabContentContainer}>
      <Text style={[styles.cardTitle, dynamicStyles.cardTitle, styles.spaceBottom, { fontSize: 20 }]}>
        Your Assignments
      </Text>
      {assignmentsList.length > 0 ? (
        assignmentsList.map((a) => (
          <View key={a.id} style={[styles.card, dynamicStyles.card, styles.spaceBottom]}>
            <View style={styles.assignmentHeaderRow}>
              <Text style={[styles.assignmentSubject, { color: activeColor }]}>{a.subjectName}</Text>
              <View style={[
                styles.priorityBadge, 
                a.priority === 'high' ? styles.priorityHigh : styles.priorityMed
              ]}>
                <Text style={styles.priorityText}>{a.priority.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={[styles.assignmentTitle, dynamicStyles.studentName]}>{a.title}</Text>
            <Text style={styles.assignmentDueText}>Due Date: {a.dueDate}</Text>
          </View>
        ))
      ) : (
        <View style={[styles.card, dynamicStyles.card, styles.emptySlotsCard, { borderColor: activeColor }]}>
          <Text style={styles.emptySlotsText}>All assignments turned in! No pending tasks. 🌟</Text>
        </View>
      )}
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
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  spaceBottom: {
    marginBottom: 20,
  },
  assignmentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentSubject: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  priorityBadge: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  priorityHigh: {
    backgroundColor: 'rgba(244,63,94,0.1)',
  },
  priorityMed: {
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  priorityText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  assignmentDueText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 6,
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
