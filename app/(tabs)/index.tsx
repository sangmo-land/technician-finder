import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Technician, Skill, SortOption } from "../../src/types";
import {
  getAllTechnicians,
  initializeStorage,
} from "../../src/services/storage";
import {
  TechnicianCard,
  FilterBar,
  SearchBar,
  EmptyState,
  LoadingSpinner,
} from "../../src/components";
import { changeLanguage, supportedLanguages } from "../../src/i18n";

function getGreetingKey(): { key: string; icon: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { key: "home.greetingMorning", icon: "sunny" };
  if (hour < 17) return { key: "home.greetingAfternoon", icon: "partly-sunny" };
  return { key: "home.greetingEvening", icon: "moon" };
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.skill.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q),
      );
    }

    if (selectedSkill) {
      filtered = filtered.filter((t) => t.skill === selectedSkill);
    }

    if (selectedLocation) {
      filtered = filtered.filter((t) => t.location === selectedLocation);
    }

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

  // Featured expert: highest-rated available technician
  const featuredExpert = useMemo(() => {
    const available = technicians.filter(
      (t) => t.availability === "available" && (t.rating ?? 0) > 0,
    );
    if (available.length === 0) return null;
    return available.reduce((best, t) =>
      (t.rating ?? 0) > (best.rating ?? 0) ? t : best,
    );
  }, [technicians]);

  // Stats
  const availableCount = useMemo(
    () => technicians.filter((t) => t.availability === "available").length,
    [technicians],
  );
  const uniqueCities = useMemo(
    () => new Set(technicians.map((t) => t.location)).size,
    [technicians],
  );

  const greeting = getGreetingKey();
  const hasActiveFilters =
    !!selectedSkill || !!selectedLocation || !!searchQuery.trim();

  // Technicians list excluding the featured one (if no filters active)
  const listTechnicians = useMemo(() => {
    if (hasActiveFilters || !featuredExpert) return filteredTechnicians;
    return filteredTechnicians.filter((t) => t.id !== featuredExpert.id);
  }, [filteredTechnicians, featuredExpert, hasActiveFilters]);

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
    <View>
      {/* Featured Expert Spotlight */}
      {!hasActiveFilters && featuredExpert && (
        <View className="mt-3">
          <View className="flex-row items-center gap-2 px-4 mb-2">
            <Ionicons name="trophy" size={16} color="#F59E0B" />
            <Text className="text-sm font-bold text-text uppercase tracking-wider">
              {t("home.featuredExpert")}
            </Text>
          </View>
          <TechnicianCard
            technician={featuredExpert}
            onPress={() => handleTechnicianPress(featuredExpert)}
            variant="featured"
          />
        </View>
      )}

      {/* Section Header: All Technicians */}
      <View className="flex-row items-center justify-between px-4 mt-4 mb-1">
        <View className="flex-row items-center gap-2">
          <Ionicons name="people" size={16} color="#1E40AF" />
          <Text className="text-sm font-bold text-text uppercase tracking-wider">
            {hasActiveFilters ? t("home.results") : t("home.allTechnicians")}
          </Text>
        </View>
        <View className="bg-primary-muted px-2.5 py-1 rounded-lg">
          <Text className="text-xs font-bold text-primary">
            {listTechnicians.length}
          </Text>
        </View>
      </View>

      {/* Contextual filter description */}
      {hasActiveFilters && (
        <Text className="text-xs text-text-muted px-4 mb-1">
          {selectedSkill
            ? t(`skills.${selectedSkill}`) + "s"
            : t("home.technicians")}
          {selectedLocation
            ? ` ${t("filters.city").toLowerCase()}: ${selectedLocation}`
            : ""}
          {searchQuery.trim() ? ` "${searchQuery.trim()}"` : ""}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-background">
      {/* Gradient Hero Header */}
      <LinearGradient
        colors={["#1E3A8A", "#1E40AF", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pb-5"
        style={{ paddingTop: insets.top + 12 }}
      >
        {/* Top row: Greeting + Language Switcher */}
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-2">
            <Ionicons name={greeting.icon as any} size={18} color="#FDE68A" />
            <Text className="text-sm font-medium" style={{ color: "#FDE68A" }}>
              {t(greeting.key)}
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center px-3 py-1.5 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            onPress={() => {
              const next = i18n.language === "fr" ? "en" : "fr";
              changeLanguage(next);
            }}
            activeOpacity={0.7}
          >
            <Text
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              {supportedLanguages.find((l) => l.code === i18n.language)?.flag}{" "}
              {i18n.language.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-white mb-1">
          {t("home.heroTitle")}
        </Text>

        {/* Inline Stats */}
        <View className="flex-row items-center gap-2 mb-4">
          <View className="flex-row items-center gap-1">
            <View className="w-1.5 h-1.5 rounded-full bg-white" />
            <Text
              className="text-xs font-semibold"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              {technicians.length} {t("home.experts")}
            </Text>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.35)" }}>·</Text>
          <View className="flex-row items-center gap-1">
            <View className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <Text
              className="text-xs font-semibold"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              {availableCount} {t("home.available")}
            </Text>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.35)" }}>·</Text>
          <View className="flex-row items-center gap-1">
            <View className="w-1.5 h-1.5 rounded-full bg-amber-300" />
            <Text
              className="text-xs font-semibold"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              {uniqueCities} {t("home.cities")}
            </Text>
          </View>
        </View>

        {/* Frosted Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          variant="hero"
        />
      </LinearGradient>

      {/* Skill Icons + Collapsible Filters */}
      <FilterBar
        selectedSkill={selectedSkill}
        selectedLocation={selectedLocation}
        selectedSort={selectedSort}
        onSkillChange={setSelectedSkill}
        onLocationChange={setSelectedLocation}
        onSortChange={setSelectedSort}
      />

      {/* Content */}
      {filteredTechnicians.length === 0 ? (
        <EmptyState
          icon="👷"
          title={t("home.noTechniciansTitle")}
          message={
            hasActiveFilters
              ? t("home.noTechniciansFiltered")
              : t("home.noTechniciansEmpty")
          }
        />
      ) : (
        <FlatList
          data={listTechnicians}
          renderItem={renderTechnician}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
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
