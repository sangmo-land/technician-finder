import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../src/contexts/AuthContext";
import { TechnicianWithProfile, Skill, SortOption } from "../../src/types";
import {
  getAllTechnicians,
  initializeStorage,
  getRecentlyViewedTechnicians,
  getCachedTechnicians,
} from "../../src/services/storage";
import {
  TechnicianCard,
  FilterBar,
  SearchBar,
  EmptyState,
  SkeletonCard,
} from "../../src/components";
import { SkeletonList } from "../../src/components/SkeletonCard";
import { changeLanguage, supportedLanguages } from "../../src/i18n";
import { skillColors } from "../../src/constants/colors";

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
  const { user } = useAuth();
  const prevUserIdRef = useRef<string | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [recentlyViewed, setRecentlyViewed] = useState<TechnicianWithProfile[]>(
    [],
  );

  const loadTechnicians = useCallback(async (showLoadingState = false) => {
    try {
      // Only show cached data if not forcing a fresh load
      if (!showLoadingState) {
        const cached = getCachedTechnicians();
        if (cached && cached.length > 0) {
          setTechnicians(cached);
          setLoading(false);
        }
      }
      await initializeStorage();
      const [data, recent] = await Promise.all([
        getAllTechnicians(),
        getRecentlyViewedTechnicians(),
      ]);
      setTechnicians(data);
      setRecentlyViewed(recent);
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

  // Reload data when user signs in or out to ensure fresh profiles
  useEffect(() => {
    const currentUserId = user?.$id ?? null;
    if (
      prevUserIdRef.current !== null &&
      prevUserIdRef.current !== currentUserId
    ) {
      // User changed - reset state and reload fresh data
      setLoading(true);
      setTechnicians([]);
      loadTechnicians(true);
    }
    prevUserIdRef.current = currentUserId;
  }, [user?.$id, loadTechnicians]);

  const filteredTechnicians = useMemo(() => {
    let filtered = technicians;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.skills.some((s) => s.toLowerCase().includes(q)) ||
          t.location.toLowerCase().includes(q),
      );
    }

    if (selectedSkill) {
      filtered = filtered.filter((t) => t.skills.includes(selectedSkill));
    }

    if (selectedLocation) {
      filtered = filtered.filter((t) => t.location === selectedLocation);
    }

    // Price range filter
    if (priceRange[0] > 0 || priceRange[1] < 50000) {
      filtered = filtered.filter(
        (t) => t.hourlyRate >= priceRange[0] && t.hourlyRate <= priceRange[1],
      );
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
  }, [
    technicians,
    searchQuery,
    selectedSkill,
    selectedLocation,
    selectedSort,
    priceRange,
  ]);

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

  // Popular This Week: Top 5 by profile views
  const popularThisWeek = useMemo(() => {
    return technicians
      .filter((t) => (t.profileViews ?? 0) > 0)
      .sort((a, b) => (b.profileViews ?? 0) - (a.profileViews ?? 0))
      .slice(0, 5);
  }, [technicians]);

  const greeting = getGreetingKey();
  const hasActiveFilters =
    !!selectedSkill || !!selectedLocation || !!searchQuery.trim();

  // Quick action handlers
  const handleEmergencyPress = () => {
    Alert.alert(
      t("quickActions.emergencyTitle"),
      t("quickActions.emergencyMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.ok"),
          onPress: () => {
            // Filter to show only available technicians
            const available = technicians.filter(
              (t) => t.availability === "available",
            );
            if (available.length > 0) {
              // Redirect to first available
              handleTechnicianPress(available[0]);
            }
          },
        },
      ],
    );
  };

  const handleSchedulePress = () => {
    Alert.alert(t("quickActions.scheduleTitle"), "Feature coming soon!");
  };

  const handleNearestPress = () => {
    Alert.alert(
      t("quickActions.nearestTitle"),
      t("quickActions.nearestMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.ok"),
          onPress: () => {
            Alert.alert("Info", "Geolocation feature coming soon!");
          },
        },
      ],
    );
  };

  const handleTeamPress = () => {
    Alert.alert(t("quickActions.teamTitle"), t("quickActions.teamMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.ok"), onPress: () => {} },
    ]);
  };

  // Technicians list excluding the featured one (if no filters active)
  const listTechnicians = useMemo(() => {
    if (hasActiveFilters || !featuredExpert) return filteredTechnicians;
    return filteredTechnicians.filter((t) => t.$id !== featuredExpert.$id);
  }, [filteredTechnicians, featuredExpert, hasActiveFilters]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTechnicians();
  };

  const handleTechnicianPress = useCallback(
    (technician: TechnicianWithProfile) => {
      router.push({
        pathname: "/technician/[id]",
        params: { id: technician.$id, data: JSON.stringify(technician) },
      });
    },
    [router],
  );

  const keyExtractor = useCallback(
    (item: TechnicianWithProfile) => item.$id,
    [],
  );

  const renderTechnician = useCallback(
    ({ item }: { item: TechnicianWithProfile }) => (
      <TechnicianCard
        technician={item}
        onPress={() => handleTechnicianPress(item)}
      />
    ),
    [handleTechnicianPress],
  );

  const renderPopularItem = useCallback(
    ({ item }: { item: TechnicianWithProfile }) => (
      <TouchableOpacity
        className="mr-3 w-48 bg-surface rounded-xl overflow-hidden shadow-sm"
        style={{ borderWidth: 1, borderColor: "#FEF3C7" }}
        onPress={() => handleTechnicianPress(item)}
        activeOpacity={0.8}
      >
        {/* Trending Badge */}
        <View className="absolute top-2 right-2 z-10">
          <View
            className="px-2 py-1 rounded-full flex-row items-center gap-1"
            style={{ backgroundColor: "rgba(245, 158, 11, 0.9)" }}
          >
            <Ionicons name="trending-up" size={11} color="#FFFFFF" />
            <Text className="text-[10px] font-bold text-white">
              {item.profileViews} views
            </Text>
          </View>
        </View>

        <View
          className="h-20 items-center justify-center"
          style={
            item.avatar
              ? undefined
              : {
                  backgroundColor: `${skillColors[item.skills[0]] || "#6B7280"}20`,
                }
          }
        >
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={28} color="#94A3B8" />
          )}
        </View>
        <View className="p-2.5">
          <Text className="text-sm font-semibold text-text" numberOfLines={1}>
            {item.name}
          </Text>
          <View className="flex-row flex-wrap items-center mt-0.5 gap-1">
            {item.skills.map((s: string, idx: number) => (
              <React.Fragment key={s}>
                {idx > 0 && (
                  <Text className="text-xs" style={{ color: "#CBD5E1" }}>
                    ·
                  </Text>
                )}
                <Text
                  className="text-xs font-medium"
                  style={{ color: skillColors[s] || "#6B7280" }}
                >
                  {t(`skills.${s}`, { defaultValue: s })}
                </Text>
              </React.Fragment>
            ))}
          </View>
          <View className="flex-row items-center justify-between mt-1.5">
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text className="text-xs font-semibold text-text">
                {item.rating?.toFixed(1) || "New"}
              </Text>
            </View>
            <Text className="text-[10px] text-text-muted">{item.location}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleTechnicianPress, t],
  );

  const renderRecentItem = useCallback(
    ({ item }: { item: TechnicianWithProfile }) => (
      <TouchableOpacity
        className="mr-3 w-36 bg-surface rounded-xl overflow-hidden shadow-sm"
        style={{ borderWidth: 1, borderColor: "#F1F5F9" }}
        onPress={() => handleTechnicianPress(item)}
        activeOpacity={0.8}
      >
        <View
          className="h-16 items-center justify-center"
          style={
            item.avatar
              ? undefined
              : {
                  backgroundColor: `${skillColors[item.skills[0]] || "#6B7280"}20`,
                }
          }
        >
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={24} color="#94A3B8" />
          )}
        </View>
        <View className="p-2.5">
          <Text className="text-sm font-semibold text-text" numberOfLines={1}>
            {item.name}
          </Text>
          <View className="flex-row flex-wrap items-center mt-0.5 gap-1">
            {item.skills.map((s: string, idx: number) => (
              <React.Fragment key={s}>
                {idx > 0 && (
                  <Text className="text-xs" style={{ color: "#CBD5E1" }}>
                    ·
                  </Text>
                )}
                <Text
                  className="text-xs font-medium"
                  style={{ color: skillColors[s] || "#6B7280" }}
                >
                  {t(`skills.${s}`, { defaultValue: s })}
                </Text>
              </React.Fragment>
            ))}
          </View>
          <View className="flex-row items-center gap-1 mt-1">
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  item.availability === "available"
                    ? "#059669"
                    : item.availability === "busy"
                      ? "#D97706"
                      : "#94A3B8",
              }}
            />
            <Text className="text-xs text-text-muted">{item.location}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleTechnicianPress, t],
  );

  const renderHeader = useCallback(
    () => (
      <View>
        {/* Featured Expert Spotlight */}
        {!hasActiveFilters && featuredExpert && (
          <View className="mt-3">
            <View className="flex-row items-center gap-2 px-4 mb-2">
              <Ionicons name="trophy" size={18} color="#F59E0B" />
              <Text className="text-base font-bold text-text uppercase tracking-wider">
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

        {/* Popular This Week */}
        {!hasActiveFilters && popularThisWeek.length > 0 && (
          <View className="mt-3">
            <View className="flex-row items-center gap-2 px-4 mb-2">
              <Ionicons name="flame" size={18} color="#F59E0B" />
              <Text className="text-base font-bold text-text uppercase tracking-wider">
                {t("home.popularThisWeek")}
              </Text>
            </View>
            <FlatList
              data={popularThisWeek}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
              keyExtractor={(item) => `popular-${item.$id}`}
              renderItem={renderPopularItem}
              removeClippedSubviews
              maxToRenderPerBatch={4}
              windowSize={3}
            />
          </View>
        )}

        {/* Recently Viewed */}
        {!hasActiveFilters && recentlyViewed.length > 0 && (
          <View className="mt-3">
            <View className="flex-row items-center gap-2 px-4 mb-2">
              <Ionicons name="time-outline" size={18} color="#6366F1" />
              <Text className="text-base font-bold text-text uppercase tracking-wider">
                {t("home.recentlyViewed")}
              </Text>
            </View>
            <FlatList
              data={recentlyViewed}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
              keyExtractor={(item) => `recent-${item.$id}`}
              renderItem={renderRecentItem}
              removeClippedSubviews
              maxToRenderPerBatch={4}
              windowSize={3}
            />
          </View>
        )}

        {/* Section Header: All Technicians */}
        <View className="flex-row items-center justify-between px-4 mt-4 mb-1">
          <View className="flex-row items-center gap-2">
            <Ionicons name="people" size={18} color="#065F46" />
            <Text className="text-base font-bold text-text uppercase tracking-wider">
              {hasActiveFilters ? t("home.results") : t("home.allTechnicians")}
            </Text>
          </View>
          <View className="bg-primary-muted px-2.5 py-1 rounded-lg">
            <Text className="text-sm font-bold text-primary">
              {listTechnicians.length}
            </Text>
          </View>
        </View>

        {/* Contextual filter description */}
        {hasActiveFilters && (
          <Text className="text-sm text-text-muted px-4 mb-1">
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
    ),
    [
      hasActiveFilters,
      featuredExpert,
      popularThisWeek,
      recentlyViewed,
      listTechnicians.length,
      selectedSkill,
      selectedLocation,
      searchQuery,
      handleTechnicianPress,
      renderPopularItem,
      renderRecentItem,
      t,
    ],
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <View style={{ height: 180, backgroundColor: "#022C22" }} />
        <SkeletonList count={4} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Gradient Hero Header */}
      <LinearGradient
        colors={["#022C22", "#065F46", "#047857"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pb-5"
        style={{ paddingTop: insets.top + 12 }}
      >
        {/* Top row: Greeting + Language Switcher */}
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-2">
            <Ionicons name={greeting.icon as any} size={20} color="#FDE68A" />
            <Text
              className="text-base font-medium"
              style={{ color: "#FDE68A" }}
            >
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
        <Text className="text-3xl font-bold text-white mb-1">
          {t("home.heroTitle")}
        </Text>

        {/* Inline Stats */}
        <View className="flex-row items-center gap-2 mb-4">
          <View className="flex-row items-center gap-1">
            <View className="w-1.5 h-1.5 rounded-full bg-white" />
            <Text
              className="text-sm font-semibold"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              {technicians.length} {t("home.experts")}
            </Text>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.35)" }}>·</Text>
          <View className="flex-row items-center gap-1">
            <View className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <Text
              className="text-sm font-semibold"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              {availableCount} {t("home.available")}
            </Text>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.35)" }}>·</Text>
          <View className="flex-row items-center gap-1">
            <View className="w-1.5 h-1.5 rounded-full bg-amber-300" />
            <Text
              className="text-sm font-semibold"
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
        onEmergencyPress={handleEmergencyPress}
        onSchedulePress={handleSchedulePress}
        onNearestPress={handleNearestPress}
        onTeamPress={handleTeamPress}
        selectedSkill={selectedSkill}
        selectedLocation={selectedLocation}
        selectedSort={selectedSort}
        priceRange={priceRange}
        onSkillChange={setSelectedSkill}
        onLocationChange={setSelectedLocation}
        onSortChange={setSelectedSort}
        onPriceRangeChange={setPriceRange}
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
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={50}
          windowSize={5}
          initialNumToRender={6}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#065F46"]}
              tintColor="#065F46"
            />
          }
        />
      )}
    </View>
  );
}
