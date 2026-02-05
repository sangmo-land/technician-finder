import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Skill, SKILLS, LOCATIONS } from '../types';
import { colors, shadows, spacing, borderRadius, typography } from '../constants/colors';

interface FilterBarProps {
  selectedSkill: Skill | null;
  selectedLocation: string | null;
  onSkillChange: (skill: Skill | null) => void;
  onLocationChange: (location: string | null) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedSkill,
  selectedLocation,
  onSkillChange,
  onLocationChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.filterSection}>
        <View style={styles.labelRow}>
          <Ionicons name="construct-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.label}>Skill</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            style={[styles.chip, !selectedSkill && styles.chipActive]}
            onPress={() => onSkillChange(null)}
          >
            <Text style={[styles.chipText, !selectedSkill && styles.chipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {SKILLS.map((skill) => {
            const isSelected = selectedSkill === skill;
            const skillColor = colors.skillColors[skill];
            return (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.chip,
                  isSelected && { backgroundColor: skillColor, borderColor: skillColor },
                ]}
                onPress={() => onSkillChange(isSelected ? null : skill)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextActive,
                  ]}
                >
                  {skill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.labelRow}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.label}>Location</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            style={[styles.chip, !selectedLocation && styles.chipActive]}
            onPress={() => onLocationChange(null)}
          >
            <Text style={[styles.chipText, !selectedLocation && styles.chipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {LOCATIONS.map((location) => {
            const isSelected = selectedLocation === location;
            return (
              <TouchableOpacity
                key={location}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => onLocationChange(isSelected ? null : location)}
              >
                <Text
                  style={[styles.chipText, isSelected && styles.chipTextActive]}
                >
                  {location}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.sm,
  },
  filterSection: {
    marginBottom: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.small,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.surface,
  },
});

export default FilterBar;
