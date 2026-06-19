import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Section, Subject } from '../../types';

interface FacultySectionsViewProps {
  sections: Section[];
  subjects: Subject[];
  activeColor: string;
  dynamicStyles: any;
}

export default function FacultySectionsView({
  sections,
  subjects,
  activeColor,
  dynamicStyles
}: FacultySectionsViewProps) {
  return (
    <View style={styles.tabContentContainer}>
      <Text style={[styles.cardTitle, dynamicStyles.cardTitle, styles.spaceBottom, { fontSize: 20 }]}>
        Assigned Classes
      </Text>
      {sections.length > 0 ? (
        sections.map((s) => (
          <View key={s.id} style={[styles.card, dynamicStyles.card, styles.spaceBottom]}>
            <Text style={styles.subjectCode}>Section: {s.sectionName}</Text>
            <Text style={[styles.subjectName, dynamicStyles.subjectName]}>Department Class Group</Text>
            <Text style={styles.slotFacultyText}>
              Active assignments: {subjects.filter(sub => sub.sectionId === s.id).length} Courses
            </Text>
          </View>
        ))
      ) : (
        <View style={[styles.card, dynamicStyles.card, styles.emptySlotsCard, { borderColor: activeColor }]}>
          <Text style={styles.emptySlotsText}>No sections assigned to your faculty profile.</Text>
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
