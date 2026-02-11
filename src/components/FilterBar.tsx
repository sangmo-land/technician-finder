import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Skill, SKILLS, LOCATIONS, SortOption, SORT_OPTIONS } from "../types";
import { skillColors } from "../constants/colors";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FilterBarProps {
  selectedSkill: Skill | null;
  selectedLocation: string | null;
  selectedSort: SortOption | null;
  priceRange?: [number, number];
  onSkillChange: (skill: Skill | null) => void;
  onLocationChange: (location: string | null) => void;
  onSortChange: (sort: SortOption | null) => void;
  onPriceRangeChange?: (range: [number, number]) => void;
  onEmergencyPress?: () => void;
  onSchedulePress?: () => void;
  onNearestPress?: () => void;
  onTeamPress?: () => void;
}

const skillIcons: Record<string, { icon: string }> = {
  Plumber: { icon: "water" },
  Electrician: { icon: "flash" },
  Carpenter: { icon: "hammer" },
  Mason: { icon: "cube" },
  Painter: { icon: "color-palette" },
};

const sortIcons: Record<SortOption, string> = {
  rating: "star",
  experience: "time-outline",
  price_low: "trending-down",
  price_high: "trending-up",
};

const sortLabelKeys: Record<SortOption, string> = {
  rating: "sort.topRated",
  experience: "sort.mostExperienced",
  price_low: "sort.priceLowToHigh",
  price_high: "sort.priceHighToLow",
};

const FilterBar: React.FC<FilterBarProps> = ({
  selectedSkill,
  selectedLocation,
  selectedSort,
  priceRange,
  onSkillChange,
  onLocationChange,
  onSortChange,
  onPriceRangeChange,
  onEmergencyPress,
  onSchedulePress,
  onNearestPress,
  onTeamPress,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(
    priceRange || [0, 50000],
  );
  const nudgeAnim = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  const activeFilterCount =
    (selectedLocation ? 1 : 0) +
    (selectedSort ? 1 : 0) +
    (priceRange && (priceRange[0] > 0 || priceRange[1] < 50000) ? 1 : 0);

  // Pulsing nudge animation that repeats every few seconds until user scrolls
  useEffect(() => {
    if (hasScrolled) return;

    const runNudge = () => {
      Animated.sequence([
        Animated.timing(nudgeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(nudgeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(nudgeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(nudgeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Initial nudge after a short delay
    const initialTimer = setTimeout(runNudge, 1500);
    // Repeat every 5 seconds
    const interval = setInterval(runNudge, 6000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [hasScrolled, nudgeAnim]);

  const nudgeTranslateX = nudgeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });
  const nudgeOpacity = nudgeAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 1, 0.4],
  });

  const onSkillScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
      const distanceFromEnd =
        contentSize.width - layoutMeasurement.width - contentOffset.x;
      setShowRightFade(distanceFromEnd > 20);
      if (contentOffset.x > 10) {
        setHasScrolled(true);
      }
    },
    [],
  );

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const clearAllFilters = () => {
    onSkillChange(null);
    onLocationChange(null);
    onSortChange(null);
  };

  const hasAnyFilter = selectedSkill || selectedLocation || selectedSort;

  return (
    <View>
      {/* Skill Category Icons */}
      <View className="pt-3 pb-2">
        <View style={{ position: "relative" }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
            onScroll={onSkillScroll}
            scrollEventThrottle={16}
          >
            {SKILLS.map((skill) => {
              const isSelected = selectedSkill === skill;
              const color = skillColors[skill] || "#64748B";
              const { icon } = skillIcons[skill] || { icon: "build" };
              const label = t(`skillShort.${skill}`, { defaultValue: skill });

              return (
                <TouchableOpacity
                  key={skill}
                  className="items-center"
                  style={{ width: 64 }}
                  onPress={() => onSkillChange(isSelected ? null : skill)}
                  activeOpacity={0.7}
                >
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center mb-1.5"
                    style={[
                      {
                        backgroundColor: isSelected ? color : "#FFFFFF",
                        borderWidth: isSelected ? 0 : 1,
                        borderColor: "#E8ECF0",
                      },
                      Platform.select({
                        ios: {
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 6 },
                          shadowOpacity: isSelected ? 0.3 : 0.15,
                          shadowRadius: isSelected ? 10 : 8,
                        },
                        android: {
                          elevation: isSelected ? 12 : 8,
                        },
                      }),
                    ]}
                  >
                    {isSelected && (
                      <View
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success items-center justify-center"
                        style={{ borderWidth: 2, borderColor: "#F8FAFC" }}
                      >
                        <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                      </View>
                    )}
                    <Ionicons
                      name={icon as any}
                      size={24}
                      color={isSelected ? "#FFFFFF" : color}
                    />
                  </View>
                  <Text
                    className={`text-xs font-semibold text-center ${
                      isSelected ? "text-text" : "text-text-muted"
                    }`}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Divider */}
            <View className="w-px self-stretch my-2 bg-border" />

            {/* Filter Toggle Button */}
            <TouchableOpacity
              className="items-center"
              style={{ width: 64 }}
              onPress={toggleExpanded}
              activeOpacity={0.7}
            >
              <View
                className={`w-14 h-14 rounded-2xl items-center justify-center mb-1.5 ${
                  expanded || activeFilterCount > 0
                    ? "bg-primary"
                    : "bg-background border border-border"
                }`}
              >
                <Ionicons
                  name="options"
                  size={24}
                  color={
                    expanded || activeFilterCount > 0 ? "#FFFFFF" : "#94A3B8"
                  }
                />
                {activeFilterCount > 0 && (
                  <View
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger items-center justify-center"
                    style={{ borderWidth: 2, borderColor: "#F8FAFC" }}
                  >
                    <Text className="text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                className={`text-xs font-semibold text-center ${
                  expanded || activeFilterCount > 0
                    ? "text-primary"
                    : "text-text-muted"
                }`}
              >
                {t("filters.filters")}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Right fade hint */}
          {showRightFade && (
            <LinearGradient
              colors={["rgba(248,250,252,0)", "rgba(248,250,252,1)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              pointerEvents="none"
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: 40,
              }}
            />
          )}

          {/* Animated scroll nudge arrow */}
          {showRightFade && !hasScrolled && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                right: 4,
                top: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                opacity: nudgeOpacity,
                transform: [{ translateX: nudgeTranslateX }],
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(30,64,175,0.12)",
                  borderRadius: 12,
                  padding: 4,
                }}
              >
                <Ionicons name="chevron-forward" size={16} color="#065F46" />
              </View>
            </Animated.View>
          )}
        </View>
      </View>

      {/* Active Filter Tags */}
      {hasAnyFilter && !expanded && (
        <View className="px-4 pb-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {selectedSkill && (
              <TouchableOpacity
                className="flex-row items-center px-3 py-1.5 rounded-full gap-1.5"
                style={{ backgroundColor: `${skillColors[selectedSkill]}15` }}
                onPress={() => onSkillChange(null)}
              >
                <View
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: skillColors[selectedSkill] || "#64748B",
                  }}
                />
                <Text
                  className="text-xs font-semibold"
                  style={{ color: skillColors[selectedSkill] || "#64748B" }}
                >
                  {t(`skills.${selectedSkill}`, {
                    defaultValue: selectedSkill,
                  })}
                </Text>
                <Ionicons
                  name="close"
                  size={12}
                  color={skillColors[selectedSkill] || "#64748B"}
                />
              </TouchableOpacity>
            )}
            {selectedLocation && (
              <TouchableOpacity
                className="flex-row items-center bg-primary-muted px-3 py-1.5 rounded-full gap-1.5"
                onPress={() => onLocationChange(null)}
              >
                <Ionicons name="location" size={12} color="#065F46" />
                <Text className="text-xs font-semibold text-primary">
                  {selectedLocation}
                </Text>
                <Ionicons name="close" size={12} color="#065F46" />
              </TouchableOpacity>
            )}
            {selectedSort && (
              <TouchableOpacity
                className="flex-row items-center bg-primary-muted px-3 py-1.5 rounded-full gap-1.5"
                onPress={() => onSortChange(null)}
              >
                <Ionicons name="swap-vertical" size={12} color="#065F46" />
                <Text className="text-xs font-semibold text-primary">
                  {t(sortLabelKeys[selectedSort])}
                </Text>
                <Ionicons name="close" size={12} color="#065F46" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="flex-row items-center px-3 py-1.5 rounded-full bg-danger-light gap-1"
              onPress={clearAllFilters}
            >
              <Ionicons name="trash-outline" size={12} color="#DC2626" />
              <Text className="text-xs font-semibold text-danger">
                {t("filters.clear")}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Expanded Filter Panel */}
      {expanded && (
        <View className="mx-4 mb-20 bg-surface rounded-2xl border border-border overflow-hidden">
          {/* Panel Header */}
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
            <Text className="text-sm font-bold text-text uppercase tracking-wider">
              {t("filters.advancedFilters")}
            </Text>
            {(selectedLocation || selectedSort) && (
              <TouchableOpacity
                className="flex-row items-center gap-1"
                onPress={() => {
                  onLocationChange(null);
                  onSortChange(null);
                  if (onPriceRangeChange) {
                    const resetRange: [number, number] = [0, 50000];
                    setLocalPriceRange(resetRange);
                    onPriceRangeChange(resetRange);
                  }
                }}
              >
                <Ionicons name="refresh" size={14} color="#DC2626" />
                <Text className="text-xs font-semibold text-danger">
                  {t("common.reset")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={{ maxHeight: Dimensions.get("window").height * 0.5 }}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {/* Quick Actions Section */}
            {(onEmergencyPress ||
              onSchedulePress ||
              onNearestPress ||
              onTeamPress) && (
              <>
                <View className="px-4 pb-3">
                  <View className="flex-row items-center gap-1.5 mb-2.5">
                    <Ionicons name="flash" size={14} color="#065F46" />
                    <Text className="text-xs font-semibold text-primary uppercase tracking-wide">
                      {t("quickActions.title")}
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {onEmergencyPress && (
                      <TouchableOpacity
                        className="flex-1 min-w-[48%] px-4 py-3 rounded-xl bg-danger flex-row items-center justify-center gap-2"
                        onPress={() => {
                          toggleExpanded();
                          setTimeout(onEmergencyPress, 300);
                        }}
                      >
                        <Ionicons name="flash" size={16} color="#FFFFFF" />
                        <Text className="text-xs font-bold text-white">
                          {t("quickActions.emergency")}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {onSchedulePress && (
                      <TouchableOpacity
                        className="flex-1 min-w-[48%] px-4 py-3 rounded-xl bg-primary flex-row items-center justify-center gap-2"
                        onPress={() => {
                          toggleExpanded();
                          setTimeout(onSchedulePress, 300);
                        }}
                      >
                        <Ionicons name="calendar" size={16} color="#FFFFFF" />
                        <Text className="text-xs font-bold text-white">
                          {t("quickActions.schedule")}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {onNearestPress && (
                      <TouchableOpacity
                        className="flex-1 min-w-[48%] px-4 py-3 rounded-xl bg-background border border-border flex-row items-center justify-center gap-2"
                        onPress={() => {
                          toggleExpanded();
                          setTimeout(onNearestPress, 300);
                        }}
                      >
                        <Ionicons name="navigate" size={16} color="#065F46" />
                        <Text className="text-xs font-bold text-primary">
                          {t("quickActions.nearest")}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {onTeamPress && (
                      <TouchableOpacity
                        className="flex-1 min-w-[48%] px-4 py-3 rounded-xl bg-background border border-border flex-row items-center justify-center gap-2"
                        onPress={() => {
                          toggleExpanded();
                          setTimeout(onTeamPress, 300);
                        }}
                      >
                        <Ionicons name="people" size={16} color="#065F46" />
                        <Text className="text-xs font-bold text-primary">
                          {t("quickActions.team")}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <View className="h-px bg-border mx-4" />
              </>
            )}

            {/* Location Section */}
            <View className="px-4 pb-3">
              <View className="flex-row items-center gap-1.5 mb-2.5">
                <Ionicons name="location" size={14} color="#065F46" />
                <Text className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {t("filters.city")}
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {LOCATIONS.map((location) => {
                  const isSelected = selectedLocation === location;
                  return (
                    <TouchableOpacity
                      key={location}
                      className={`px-3.5 py-2 rounded-xl ${
                        isSelected
                          ? "bg-primary"
                          : "bg-background border border-border"
                      }`}
                      onPress={() =>
                        onLocationChange(isSelected ? null : location)
                      }
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? "text-white" : "text-text-secondary"
                        }`}
                      >
                        {location}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-border mx-4" />

            {/* Sort Section */}
            <View className="px-4 py-3">
              <View className="flex-row items-center gap-1.5 mb-2.5">
                <Ionicons name="swap-vertical" size={14} color="#065F46" />
                <Text className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {t("filters.sortBy")}
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => {
                  const isSelected = selectedSort === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      className={`px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 ${
                        isSelected
                          ? "bg-primary"
                          : "bg-background border border-border"
                      }`}
                      onPress={() =>
                        onSortChange(isSelected ? null : option.value)
                      }
                    >
                      <Ionicons
                        name={sortIcons[option.value] as any}
                        size={14}
                        color={isSelected ? "#FFFFFF" : "#475569"}
                      />
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? "text-white" : "text-text-secondary"
                        }`}
                      >
                        {t(sortLabelKeys[option.value])}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-border mx-4" />

            {/* Price Range Section */}
            {onPriceRangeChange && (
              <>
                <View className="px-4 py-3">
                  <View className="flex-row items-center gap-1.5 mb-2.5">
                    <Ionicons name="cash-outline" size={14} color="#065F46" />
                    <Text className="text-xs font-semibold text-primary uppercase tracking-wide">
                      {t("filters.priceRange")}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className="flex-1">
                      <Text className="text-[10px] text-text-muted mb-1">
                        {t("filters.minPrice")}
                      </Text>
                      <View className="border border-border rounded-lg p-2 bg-background">
                        <Text className="text-xs font-semibold text-text">
                          {localPriceRange[0].toLocaleString()} XAF
                        </Text>
                      </View>
                    </View>
                    <View className="pt-4">
                      <Ionicons
                        name="arrow-forward"
                        size={12}
                        color="#94A3B8"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] text-text-muted mb-1">
                        {t("filters.maxPrice")}
                      </Text>
                      <View className="border border-border rounded-lg p-2 bg-background">
                        <Text className="text-xs font-semibold text-text">
                          {localPriceRange[1] >= 50000
                            ? t("filters.anyPrice")
                            : `${localPriceRange[1].toLocaleString()} XAF`}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="flex-row gap-2">
                    {[
                      [0, 5000],
                      [0, 10000],
                      [10000, 20000],
                      [0, 50000],
                    ].map((range) => {
                      const isSelected =
                        localPriceRange[0] === range[0] &&
                        localPriceRange[1] === range[1];
                      return (
                        <TouchableOpacity
                          key={`${range[0]}-${range[1]}`}
                          className={`flex-1 px-2 py-1.5 rounded-lg ${
                            isSelected
                              ? "bg-primary"
                              : "bg-background border border-border"
                          }`}
                          onPress={() => {
                            const newRange: [number, number] = [
                              range[0],
                              range[1],
                            ];
                            setLocalPriceRange(newRange);
                            onPriceRangeChange(newRange);
                          }}
                        >
                          <Text
                            className={`text-[10px] font-semibold text-center ${
                              isSelected ? "text-white" : "text-text-secondary"
                            }`}
                            numberOfLines={1}
                          >
                            {range[1] >= 50000
                              ? "All"
                              : `${range[0] / 1000}k-${range[1] / 1000}k`}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                <View className="h-px bg-border mx-4" />
              </>
            )}
          </ScrollView>

          {/* Done Button */}
          <TouchableOpacity
            className="mx-4 mb-20 mt-1 py-3 rounded-xl bg-primary items-center"
            onPress={toggleExpanded}
          >
            <Text className="text-sm font-bold text-white">
              {t("filters.applyFilters")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default FilterBar;
