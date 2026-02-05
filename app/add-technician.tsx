import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Skill, TechnicianFormData, SKILLS, LOCATIONS } from '../src/types';
import { addTechnician } from '../src/services/storage';
import { colors, shadows, spacing, borderRadius, typography } from '../src/constants/colors';
import { InputField, SelectField } from '../src/components';

interface FormErrors {
  name?: string;
  skill?: string;
  phone?: string;
  location?: string;
  experienceYears?: string;
}

export default function AddTechnicianScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [skill, setSkill] = useState<Skill | null>(null);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState<string | null>(null);
  const [experienceYears, setExperienceYears] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!skill) {
      newErrors.skill = 'Please select a skill';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.trim().length < 8) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!location) {
      newErrors.location = 'Please select a location';
    }

    const years = parseInt(experienceYears, 10);
    if (!experienceYears.trim()) {
      newErrors.experienceYears = 'Experience is required';
    } else if (isNaN(years) || years < 0 || years > 50) {
      newErrors.experienceYears = 'Enter a valid number (0-50)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const formData: TechnicianFormData = {
        name: name.trim(),
        skill: skill!,
        phone: phone.trim(),
        location: location!,
        experienceYears: parseInt(experienceYears, 10),
      };

      await addTechnician(formData);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add technician. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Form Header */}
        <View style={styles.formHeader}>
          <View style={styles.formIcon}>
            <Ionicons name="person-add" size={32} color={colors.primary} />
          </View>
          <Text style={styles.formTitle}>New Technician</Text>
          <Text style={styles.formSubtitle}>Enter the technician's details below</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <InputField
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Jean-Pierre Nkomo"
            error={errors.name}
          />

          <SelectField
            label="Skill / Trade"
            value={skill}
            options={SKILLS}
            onSelect={setSkill}
            placeholder="Select a skill"
            error={errors.skill}
          />

          <InputField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g., +237 6 70 12 34 56"
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <SelectField
            label="Location"
            value={location}
            options={LOCATIONS}
            onSelect={setLocation}
            placeholder="Select a city"
            error={errors.location}
          />

          <InputField
            label="Years of Experience"
            value={experienceYears}
            onChangeText={setExperienceYears}
            placeholder="e.g., 5"
            keyboardType="numeric"
            error={errors.experienceYears}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={22} color={colors.surface} />
            <Text style={styles.submitButtonText}>
              {loading ? 'Adding...' : 'Add Technician'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  formIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  formTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  actions: {
    marginTop: spacing['2xl'],
    gap: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.bodyMedium,
    color: colors.surface,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
});
