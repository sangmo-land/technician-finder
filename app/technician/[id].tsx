import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Technician } from '../../src/types';
import { getTechnicianById } from '../../src/services/storage';
import { colors, shadows, spacing, borderRadius, typography } from '../../src/constants/colors';
import { LoadingSpinner, EmptyState } from '../../src/components';

export default function TechnicianDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTechnician = async () => {
      if (!id) return;
      try {
        const data = await getTechnicianById(id);
        setTechnician(data);
      } catch (error) {
        console.error('Error loading technician:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTechnician();
  }, [id]);

  const handleCall = () => {
    if (!technician) return;

    const phoneNumber = technician.phone.replace(/\s/g, '');
    const url = `tel:${phoneNumber}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(
            'Cannot Make Call',
            'Phone calling is not supported on this device.',
            [{ text: 'OK' }]
          );
        }
      })
      .catch((error) => {
        console.error('Error opening phone app:', error);
        Alert.alert('Error', 'Failed to open phone app.');
      });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!technician) {
    return (
      <EmptyState
        icon="❌"
        title="Technician not found"
        message="The technician you're looking for doesn't exist or has been removed."
      />
    );
  }

  const skillColor = colors.skillColors[technician.skill];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: skillColor }]}>
          <Text style={styles.avatarText}>
            {technician.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{technician.name}</Text>
        <View style={[styles.skillBadge, { backgroundColor: `${skillColor}20` }]}>
          <View style={[styles.skillDot, { backgroundColor: skillColor }]} />
          <Text style={[styles.skillText, { color: skillColor }]}>{technician.skill}</Text>
        </View>
      </View>

      {/* Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.detailRow}>
          <View style={[styles.detailIcon, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name="location" size={20} color={colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{technician.location}, Cameroon</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={[styles.detailIcon, { backgroundColor: colors.successLight }]}>
            <Ionicons name="call" size={20} color={colors.success} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Phone Number</Text>
            <Text style={styles.detailValue}>{technician.phone}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={[styles.detailIcon, { backgroundColor: colors.warningLight }]}>
            <Ionicons name="time" size={20} color={colors.warning} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Experience</Text>
            <Text style={styles.detailValue}>
              {technician.experienceYears} {technician.experienceYears === 1 ? 'year' : 'years'} of professional experience
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={24} color={colors.warning} />
          <Text style={styles.statValue}>Verified</Text>
          <Text style={styles.statLabel}>Professional</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="shield-checkmark" size={24} color={colors.success} />
          <Text style={styles.statValue}>Trusted</Text>
          <Text style={styles.statLabel}>Service</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="location" size={24} color={colors.primary} />
          <Text style={styles.statValue}>Local</Text>
          <Text style={styles.statLabel}>Expert</Text>
        </View>
      </View>

      {/* Call Button */}
      <TouchableOpacity style={styles.callButton} onPress={handleCall} activeOpacity={0.8}>
        <Ionicons name="call" size={24} color={colors.surface} />
        <Text style={styles.callButtonText}>Call {technician.name.split(' ')[0]}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.surface,
  },
  name: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  skillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  skillText: {
    ...typography.bodyMedium,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
    letterSpacing: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    marginBottom: spacing['2xl'],
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.md,
  },
  callButton: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    ...shadows.lg,
  },
  callButtonText: {
    ...typography.h3,
    color: colors.surface,
  },
});
