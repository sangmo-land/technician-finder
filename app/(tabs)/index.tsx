import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Technician, Skill } from '../../src/types';
import { getAllTechnicians, initializeStorage } from '../../src/services/storage';
import { colors, shadows, spacing, borderRadius, typography } from '../../src/constants/colors';
import {
  TechnicianCard,
  FilterBar,
  EmptyState,
  LoadingSpinner,
} from '../../src/components';

export default function HomeScreen() {
  const router = useRouter();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const loadTechnicians = useCallback(async () => {
    try {
      await initializeStorage();
      const data = await getAllTechnicians();
      setTechnicians(data);
    } catch (error) {
      console.error('Error loading technicians:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTechnicians();
    }, [loadTechnicians])
  );

  useEffect(() => {
    let filtered = technicians;

    if (selectedSkill) {
      filtered = filtered.filter((t) => t.skill === selectedSkill);
    }

    if (selectedLocation) {
      filtered = filtered.filter((t) => t.location === selectedLocation);
    }

    setFilteredTechnicians(filtered);
  }, [technicians, selectedSkill, selectedLocation]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTechnicians();
  };

  const handleTechnicianPress = (technician: Technician) => {
    router.push(`/technician/${technician.id}`);
  };

  const renderTechnician = ({ item }: { item: Technician }) => (
    <TechnicianCard
      technician={item}
      onPress={() => handleTechnicianPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome to TechFinder</Text>
        <Text style={styles.welcomeSubtitle}>
          Find skilled technicians in Cameroon
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{technicians.length}</Text>
            <Text style={styles.statLabel}>Technicians</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Skills</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Cities</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FilterBar
        selectedSkill={selectedSkill}
        selectedLocation={selectedLocation}
        onSkillChange={setSelectedSkill}
        onLocationChange={setSelectedLocation}
      />

      {filteredTechnicians.length === 0 ? (
        <EmptyState
          icon="👷"
          title="No technicians found"
          message={
            selectedSkill || selectedLocation
              ? 'Try adjusting your filters to see more results.'
              : 'No technicians available. Check back later!'
          }
        />
      ) : (
        <FlatList
          data={filteredTechnicians}
          renderItem={renderTechnician}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  welcomeCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  welcomeTitle: {
    ...typography.h2,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    ...typography.body,
    color: colors.primaryMuted,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...typography.h2,
    color: colors.surface,
  },
  statLabel: {
    ...typography.caption,
    color: colors.primaryMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  listContent: {
    paddingBottom: spacing['3xl'],
  },
});
