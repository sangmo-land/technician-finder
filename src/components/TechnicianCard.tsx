import React from "react";
import { View, Text, TouchableOpacity, Platform, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TechnicianWithProfile } from "../types";
import { skillColors } from "../constants/colors";

interface TechnicianCardProps {
  technician: TechnicianWithProfile;
  onPress: () => void;
  variant?: "default" | "featured";
}

const availabilityConfig: Record<string, { labelKey: string; color: string }> =
  {
    available: {
      labelKey: "availability.available",
      color: "#059669",
    },
    busy: {
      labelKey: "availability.busy",
      color: "#D97706",
    },
    offline: {
      labelKey: "availability.offline",
      color: "#94A3B8",
    },
  };

const skillIcons: Record<string, string> = {
  Plumber: "water",
  Electrician: "flash",
  Carpenter: "hammer",
  Mason: "construct",
  Painter: "color-palette",
};

const TechnicianCard: React.FC<TechnicianCardProps> = React.memo(
  ({ technician, onPress, variant = "default" }) => {
    const { t } = useTranslation();
    const skillColor = skillColors[technician.skills[0]] || "#6B7280";
    const avail =
      availabilityConfig[technician.availability] || availabilityConfig.offline;
    const isFeatured = variant === "featured";
    const rating = technician.rating ?? 0;
    const reviewCount = technician.reviewCount ?? 0;
    const skillIcon = skillIcons[technician.skills[0]] || "build";

    const gallery = technician.gallery ?? [];
    const coverImage = gallery.length > 0 ? gallery[0] : null;

    const cardShadow = Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: isFeatured ? 6 : 4 },
        shadowOpacity: isFeatured ? 0.1 : 0.08,
        shadowRadius: isFeatured ? 14 : 10,
      },
      android: {
        elevation: isFeatured ? 8 : 5,
      },
    });

    const hasCover = !!coverImage;

    return (
      <TouchableOpacity
        className={`mx-4 ${isFeatured ? "my-3" : "my-2"}`}
        onPress={onPress}
        activeOpacity={0.8}
        style={cardShadow}
      >
        <View
          className={`bg-surface overflow-hidden ${
            isFeatured ? "rounded-2xl" : "rounded-2xl"
          }`}
          style={{ borderWidth: 1, borderColor: "#F1F5F9" }}
        >
          {/* ── Cover Image ── */}
          {hasCover && (
            <View>
              <Image
                source={{ uri: coverImage }}
                style={{ width: "100%", height: isFeatured ? 160 : 130 }}
                resizeMode="cover"
              />

              {/* Photo count badge */}
              {gallery.length > 1 && (
                <View
                  className="absolute bottom-2 right-2 flex-row items-center gap-1 px-2 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
                >
                  <Ionicons name="images-outline" size={11} color="#FFFFFF" />
                  <Text className="text-[10px] font-semibold text-white">
                    {gallery.length}
                  </Text>
                </View>
              )}

              {/* Featured badge overlay */}
              {isFeatured && (
                <View
                  className="absolute top-2 left-2 flex-row items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                  <Ionicons name="trophy" size={10} color="#FDE68A" />
                  <Text
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "#FDE68A" }}
                  >
                    {t("card.topRated")}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* If no cover image, show featured badge inline */}
          {!hasCover && isFeatured && (
            <View className="flex-row items-center gap-1.5 px-4 pt-3 pb-0.5">
              <Ionicons name="trophy" size={11} color="#F59E0B" />
              <Text className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                {t("card.topRated")}
              </Text>
            </View>
          )}

          {/* ── Profile Row ── */}
          <View
            className={`flex-row items-center ${
              isFeatured ? "px-4 pt-3.5 pb-2.5" : "px-4 py-3"
            }`}
          >
            {/* Profile Image / Avatar */}
            <View className="relative mr-3.5">
              {coverImage ? (
                <Image
                  source={{ uri: coverImage }}
                  className={`${
                    isFeatured
                      ? "w-14 h-14 rounded-2xl"
                      : "w-12 h-12 rounded-xl"
                  }`}
                  resizeMode="cover"
                />
              ) : (
                <View
                  className={`items-center justify-center ${
                    isFeatured
                      ? "w-14 h-14 rounded-2xl"
                      : "w-12 h-12 rounded-xl"
                  }`}
                  style={{ backgroundColor: "#F1F5F9" }}
                >
                  <Text
                    className={`font-bold ${
                      isFeatured ? "text-base" : "text-sm"
                    }`}
                    style={{ color: skillColor }}
                  >
                    {technician.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>
              )}
              {/* Availability dot */}
              <View
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full"
                style={{
                  backgroundColor: avail.color,
                  borderWidth: 2,
                  borderColor: "#FFFFFF",
                }}
              />
            </View>

            {/* Info */}
            <View className="flex-1">
              <Text
                className={`font-bold text-text ${
                  isFeatured ? "text-[16px]" : "text-[15px]"
                }`}
                numberOfLines={1}
              >
                {technician.name}
              </Text>

              <View className="flex-row items-center mt-1 gap-2">
                <View className="flex-row items-center gap-1">
                  <Ionicons
                    name={skillIcon as any}
                    size={12}
                    color={skillColor}
                  />
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: skillColor }}
                  >
                    {technician.skills.map((s) => t(`skills.${s}`)).join(", ")}
                  </Text>
                </View>
                <View className="w-[3px] h-[3px] rounded-full bg-border" />
                <View className="flex-row items-center gap-1">
                  <View
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: avail.color }}
                  />
                  <Text
                    className="text-[11px] font-medium"
                    style={{ color: avail.color }}
                  >
                    {t(avail.labelKey)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Arrow */}
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#CBD5E1"
              style={{ marginLeft: 4 }}
            />
          </View>

          {/* Bio (featured only) */}
          {isFeatured && technician.bio && (
            <View className="px-4 pb-2">
              <Text
                className="text-xs text-text-muted leading-4"
                numberOfLines={2}
              >
                {technician.bio}
              </Text>
            </View>
          )}

          {/* ── Stats Footer ── */}
          <View
            className={`flex-row items-center border-t border-border-light ${
              isFeatured ? "px-4 py-2.5" : "px-4 py-2"
            }`}
          >
            {/* Rating */}
            <View className="flex-row items-center gap-1 mr-4">
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text className="text-xs font-bold text-text">
                {rating > 0 ? rating.toFixed(1) : t("common.new")}
              </Text>
              {reviewCount > 0 && (
                <Text className="text-[10px] text-text-muted">
                  ({reviewCount})
                </Text>
              )}
            </View>

            {/* Location */}
            <View className="flex-row items-center gap-1 mr-4">
              <Ionicons name="location-outline" size={12} color="#94A3B8" />
              <Text
                className="text-[11px] text-text-secondary font-medium"
                numberOfLines={1}
              >
                {technician.location}
              </Text>
            </View>

            {/* Profile Views */}
            <View className="flex-row items-center gap-1">
              <Ionicons name="eye-outline" size={12} color="#94A3B8" />
              <Text className="text-[11px] text-text-secondary font-medium">
                {technician.profileViews ?? 0}
              </Text>
            </View>

            {/* Experience */}
            <View className="flex-row items-center gap-1 ml-auto">
              <Ionicons name="briefcase-outline" size={12} color="#94A3B8" />
              <Text className="text-[11px] text-text-secondary font-medium">
                {technician.experienceYears}
                {t("common.yearsShort")}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

TechnicianCard.displayName = "TechnicianCard";

export default TechnicianCard;
