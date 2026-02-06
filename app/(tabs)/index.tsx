import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, FlatList, RefreshControl, Text } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Technician, Skill, SortOption } from "../../src/types";
import {
  getAllTechnicians,
  initializeStorage,
} from "../../src/services/storage";
import {
  TechnicianCard,
  FilterBar,
  SearchBar,
  SortBar,
  EmptyState,
  LoadingSpinner,
} from "../../src/components";

export default function HomeScreen() {
  const router = useRouter();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption | null>(null);

  const loadTechnicians = useCallback(async () => {
    try {
      await initializeStorage();
      const data = await getAllTechnicians();
      setTechnicians(data);
    } catch (error) {
      console.error("Error loading technicians:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTechnicians();
    }, [loadTechnicians]),
  );

  const filteredTechnicians = useMemo(() => {
    let filtered = technicians;

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.skill.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q),
      );
    }

    // Skill filter
    if (selectedSkill) {
      filtered = filtered.filter((t) => t.skill === selectedSkill);
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter((t) => t.location === selectedLocation);
    }

    // Sort
    if (selectedSort) {
      filtered = [...filtered].sort((a, b) => {
        switch (selectedSort) {
          case "rating":
            return (b.rating ?? 0) - (a.rating ?? 0);
          case "experience":
            return b.experienceYears - a.experienceYears;
          case "price_low":
            return (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0);
          case "price_high":
            return (b.hourlyRate ?? 0) - (a.hourlyRate ?? 0);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [technicians, searchQuery, selectedSkill, selectedLocation, selectedSort]);

  // Derived stats
  const uniqueSkills = useMemo(
    () => new Set(technicians.map((t) => t.skill)).size,
    [technicians],
  );
  const uniqueCities = useMemo(
    () => new Set(technicians.map((t) => t.location)).size,
    [technicians],
  );
  const availableCount = useMemo(
    () => technicians.filter((t) => t.availability === "available").length,
    [technicians],
  );

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

  const hasActiveFilters =
    !!selectedSkill || !!selectedLocation || !!searchQuery.trim();

  const renderHeader = () => (
    <View className="px-4 pt-4 pb-2">
      <View className="bg-primary rounded-2xl p-5 shadow-lg">
        <Text className="text-2xl font-semibold text-surface mb-1">
          Find Your Expert
        </Text>
        <Text className="text-base text-primary-muted mb-4">
          Skilled technicians across Cameroon
        </Text>
        <View className="flex-row items-center justify-around bg-white/15 rounded-xl py-3">
          <View className="items-center flex-1">
            <Text className="text-2xl font-semibold text-surface">
              {technicians.length}
            </Text>
            <Text className="text-xs font-medium text-primary-muted mt-0.5">
              Technicians
            </Text>
          </View>
          <View className="w-px h-8 bg-white/20" />
          <View className="items-center flex-1">
            <Text className="text-2xl font-semibold text-surface">
              {availableCount}
            </Text>
            <Text className="text-xs font-medium text-primary-muted mt-0.5">
              Available
            </Text>
          </View>
          <View className="w-px h-8 bg-white/20" />
          <View className="items-center flex-1">
            <Text className="text-2xl font-semibold text-surface">
              {uniqueCities}
            </Text>
            <Text className="text-xs font-medium text-primary-muted mt-0.5">
              Cities
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-background">
      {/* Search bar */}
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {/* Filters + Sort */}
      <FilterBar
        selectedSkill={selectedSkill}
        selectedLocation={selectedLocation}
        onSkillChange={setSelectedSkill}
        onLocationChange={setSelectedLocation}
      />
      <SortBar selectedSort={selectedSort} onSortChange={setSelectedSort} />

      {/* Results count */}
      {hasActiveFilters && (
        <View className="px-4 pb-2">
          <Text className="text-sm text-text-secondary">
            {filteredTechnicians.length} result
            {filteredTechnicians.length !== 1 ? "s" : ""} found
          </Text>
        </View>
      )}

      {filteredTechnicians.length === 0 ? (
        <EmptyState
          icon="👷"
          title="No technicians found"
          message={
            hasActiveFilters
              ? "Try adjusting your search or filters to see more results."
              : "No technicians available. Check back later!"
          }
        />
      ) : (
        <FlatList
          data={filteredTechnicians}
          renderItem={renderTechnician}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#1E40AF"]}
              tintColor="#1E40AF"
            />
          }
        />
      )}
    </View>
  );
}
