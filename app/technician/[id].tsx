import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Linking,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TechnicianWithProfile } from "../../src/types";
import {
  getTechnicianById,
  toggleFavorite,
  isFavorite as checkFavorite,
} from "../../src/services/storage";
import { skillColors } from "../../src/constants/colors";
import { LoadingSpinner, EmptyState, GalleryView } from "../../src/components";

const availabilityConfig: Record<
  string,
  { labelKey: string; color: string; bg: string; icon: string }
> = {
  available: {
    labelKey: "availability.availableNow",
    color: "#059669",
    bg: "#D1FAE5",
    icon: "checkmark-circle",
  },
  busy: {
    labelKey: "availability.currentlyBusy",
    color: "#D97706",
    bg: "#FEF3C7",
    icon: "time",
  },
  offline: {
    labelKey: "availability.offline",
    color: "#94A3B8",
    bg: "#F1F5F9",
    icon: "moon",
  },
};

export default function TechnicianDetailsScreen() {
  const { id, data: dataParam } = useLocalSearchParams<{
    id: string;
    data?: string;
  }>();
  const { t } = useTranslation();

  // Try to hydrate from route params first (instant) → fall back to API
  const initialData = React.useMemo(() => {
    if (!dataParam) return null;
    try {
      return JSON.parse(dataParam) as TechnicianWithProfile;
    } catch {
      return null;
    }
  }, [dataParam]);

  const [technician, setTechnician] = useState<TechnicianWithProfile | null>(
    initialData,
  );
  const [loading, setLoading] = useState(!initialData);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Always check favorite status
    checkFavorite(id)
      .then(setIsFav)
      .catch(() => {});
    // Only fetch from API if we don't have data from params
    if (initialData) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const data = await getTechnicianById(id);
        setTechnician(data);
      } catch (error) {
        console.error("Error loading technician:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, initialData]);

  const handleToggleFavorite = async () => {
    if (!id) return;
    try {
      const result = await toggleFavorite(id);
      setIsFav(result);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleCall = () => {
    if (!technician) return;
    const phoneNumber = technician.phone.replace(/\s/g, "");
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(
            t("detail.cannotCallTitle"),
            t("detail.cannotCallMessage"),
            [{ text: t("common.ok") }],
          );
        }
      })
      .catch(() => Alert.alert(t("common.error"), t("detail.failedCall")));
  };

  if (loading) return <LoadingSpinner />;

  if (!technician) {
    return (
      <EmptyState
        icon="❌"
        title={t("detail.notFoundTitle")}
        message={t("detail.notFoundMessage")}
      />
    );
  }

  const color = skillColors[technician.skills[0]];
  const avail =
    availabilityConfig[technician.availability] || availabilityConfig.offline;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Header Card */}
        <View className="bg-surface mx-4 mt-4 rounded-2xl p-6 items-center shadow-md">
          {/* Favorite button */}
          <TouchableOpacity
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background items-center justify-center"
            onPress={handleToggleFavorite}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={22}
              color={isFav ? "#EF4444" : "#94A3B8"}
            />
          </TouchableOpacity>

          {/* Avatar */}
          <View className="relative mb-4">
            <View
              className="w-24 h-24 rounded-full items-center justify-center shadow-lg"
              style={{ backgroundColor: color }}
            >
              <Text className="text-[32px] font-bold text-surface">
                {technician.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
            <View
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-[3px] border-surface items-center justify-center"
              style={{ backgroundColor: avail.color }}
            >
              <Ionicons name={avail.icon as any} size={12} color="#FFFFFF" />
            </View>
          </View>

          <Text className="text-2xl font-semibold text-text mb-2 text-center">
            {technician.name}
          </Text>

          {/* Skill badge + Availability */}
          <View className="flex-row items-center gap-2 mb-3">
            <View
              className="flex-row items-center px-3 py-1.5 rounded-full gap-1.5"
              style={{ backgroundColor: `${color}20` }}
            >
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <Text className="text-sm font-semibold" style={{ color }}>
                {technician.skills.map((s) => t(`skills.${s}`)).join(", ")}
              </Text>
            </View>
            <View
              className="flex-row items-center px-3 py-1.5 rounded-full gap-1.5"
              style={{ backgroundColor: avail.bg }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: avail.color }}
              >
                {t(avail.labelKey)}
              </Text>
            </View>
          </View>

          {/* Rating */}
          <View className="flex-row items-center gap-1.5 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={
                  star <= Math.round(technician.rating ?? 0)
                    ? "star"
                    : "star-outline"
                }
                size={20}
                color="#F59E0B"
              />
            ))}
            <Text className="text-base font-semibold text-text ml-1">
              {(technician.rating ?? 0) > 0
                ? technician.rating.toFixed(1)
                : t("common.new")}
            </Text>
            <Text className="text-sm text-text-muted">
              ({technician.reviewCount ?? 0} {t("common.reviews")})
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row mx-4 mt-3 gap-3">
          <View className="flex-1 bg-surface rounded-xl py-4 items-center shadow-sm">
            <Text className="text-xl font-bold text-primary">
              {technician.experienceYears}
            </Text>
            <Text className="text-xs font-medium text-text-muted mt-0.5">
              {t("detail.yearsExp")}
            </Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl py-4 items-center shadow-sm">
            <Text className="text-xl font-bold text-primary">
              {technician.jobsCompleted ?? 0}
            </Text>
            <Text className="text-xs font-medium text-text-muted mt-0.5">
              {t("detail.jobsDone")}
            </Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl py-4 items-center shadow-sm">
            <Text className="text-xl font-bold text-primary">
              {(technician.hourlyRate ?? 0).toLocaleString()}
            </Text>
            <Text className="text-xs font-medium text-text-muted mt-0.5">
              {t("common.xafPerHour")}
            </Text>
          </View>
        </View>

        {/* Bio */}
        {technician.bio ? (
          <View className="bg-surface mx-4 mt-3 rounded-2xl p-5 shadow-sm">
            <Text className="text-xs font-medium text-text-muted uppercase mb-3 tracking-widest">
              {t("detail.about")}
            </Text>
            <Text className="text-base text-text-secondary leading-6">
              {technician.bio}
            </Text>
          </View>
        ) : null}

        {/* Work Gallery */}
        <GalleryView images={technician.gallery || []} />

        {/* Contact Info */}
        <View className="bg-surface mx-4 mt-3 rounded-2xl p-5 shadow-sm">
          <Text className="text-xs font-medium text-text-muted uppercase mb-4 tracking-widest">
            {t("detail.contactInfo")}
          </Text>

          <View className="flex-row items-center py-2">
            <View className="w-11 h-11 rounded-lg items-center justify-center mr-4 bg-primary-muted">
              <Ionicons name="location" size={20} color="#065F46" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium text-text-muted mb-0.5">
                {t("detail.location")}
              </Text>
              <Text className="text-base font-medium text-text">
                {technician.location}, {t("common.cameroon")}
              </Text>
            </View>
          </View>

          <View className="h-px bg-border-light my-3" />

          <View className="flex-row items-center py-2">
            <View className="w-11 h-11 rounded-lg items-center justify-center mr-4 bg-success-light">
              <Ionicons name="call" size={20} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium text-text-muted mb-0.5">
                {t("detail.phoneNumber")}
              </Text>
              <Text className="text-base font-medium text-text">
                {technician.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mx-4 mt-4 gap-3">
          <TouchableOpacity
            className="bg-success rounded-xl py-4 flex-row items-center justify-center gap-3 shadow-lg"
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={22} color="#FFFFFF" />
            <Text className="text-lg font-semibold text-surface">
              {t("detail.call", { name: technician.name.split(" ")[0] })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`rounded-xl py-4 flex-row items-center justify-center gap-3 border-2 ${
              isFav
                ? "bg-danger-light border-danger"
                : "bg-surface border-border"
            }`}
            onPress={handleToggleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={22}
              color={isFav ? "#DC2626" : "#475569"}
            />
            <Text
              className={`text-lg font-semibold ${isFav ? "text-danger" : "text-text-secondary"}`}
            >
              {isFav
                ? t("detail.removeFromFavorites")
                : t("detail.addToFavorites")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
