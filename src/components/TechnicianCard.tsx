import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Technician } from "../types";
import { skillColors } from "../constants/colors";

interface TechnicianCardProps {
  technician: Technician;
  onPress: () => void;
  variant?: "default" | "featured";
}

const availabilityConfig: Record<
  string,
  { labelKey: string; color: string; bg: string }
> = {
  available: { labelKey: "availability.available", color: "#059669", bg: "#D1FAE5" },
  busy: { labelKey: "availability.busy", color: "#D97706", bg: "#FEF3C7" },
  offline: { labelKey: "availability.offline", color: "#94A3B8", bg: "#F1F5F9" },
};

const TechnicianCard: React.FC<TechnicianCardProps> = ({
  technician,
  onPress,
  variant = "default",
}) => {
  const { t } = useTranslation();
  const skillColor = skillColors[technician.skill];
  const avail =
    availabilityConfig[technician.availability] || availabilityConfig.offline;
  const isFeatured = variant === "featured";
  const rating = technician.rating ?? 0;
  const reviewCount = technician.reviewCount ?? 0;
  const hourlyRate = technician.hourlyRate ?? 0;

  return (
    <TouchableOpacity
      className={`bg-surface mx-4 overflow-hidden shadow-sm ${
        isFeatured ? "rounded-3xl my-2" : "rounded-2xl my-1.5"
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row">
        {/* Left Accent Bar */}
        <View
          className={`${isFeatured ? "w-1.5" : "w-1"}`}
          style={{ backgroundColor: skillColor }}
        />

        <View className="flex-1">
          {/* Featured Badge */}
          {isFeatured && (
            <View className="flex-row items-center gap-1.5 px-4 pt-3 pb-1">
              <Ionicons name="trophy" size={12} color="#F59E0B" />
              <Text className="text-[11px] font-bold text-warning uppercase tracking-widest">
                {t("card.topRated")}
              </Text>
            </View>
          )}

          {/* Main Content */}
          <View
            className={`flex-row ${isFeatured ? "px-4 pt-2 pb-3" : "p-3.5"}`}
          >
            {/* Avatar */}
            <View className="relative mr-3.5">
              <View
                className={`items-center justify-center ${
                  isFeatured ? "w-16 h-16 rounded-2xl" : "w-12 h-12 rounded-xl"
                }`}
                style={{ backgroundColor: skillColor }}
              >
                <Text
                  className={`font-bold text-white ${
                    isFeatured ? "text-lg" : "text-sm"
                  }`}
                >
                  {technician.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </Text>
              </View>
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
            <View className="flex-1 justify-center">
              <View className="flex-row items-center justify-between">
                <Text
                  className={`font-bold text-text ${
                    isFeatured ? "text-base" : "text-[15px]"
                  }`}
                  numberOfLines={1}
                >
                  {technician.name}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </View>

              {/* Skill + Availability inline */}
              <View className="flex-row items-center mt-1 gap-2">
                <Text
                  className="text-xs font-semibold"
                  style={{ color: skillColor }}
                >
                  {t(`skills.${technician.skill}`)}
                </Text>
                <View className="w-1 h-1 rounded-full bg-text-light" />
                <Text
                  className="text-xs font-medium"
                  style={{ color: avail.color }}
                >
                  {t(avail.labelKey)}
                </Text>
              </View>

              {/* Bio preview (featured only) */}
              {isFeatured && technician.bio && (
                <Text
                  className="text-xs text-text-secondary mt-1.5 leading-4"
                  numberOfLines={2}
                >
                  {technician.bio}
                </Text>
              )}
            </View>
          </View>

          {/* Stats Row */}
          <View
            className={`flex-row border-t border-border-light ${
              isFeatured ? "px-4 py-3" : "px-3.5 py-2"
            }`}
          >
            {/* Rating */}
            <View className="flex-row items-center flex-1 gap-1">
              <Ionicons name="star" size={13} color="#F59E0B" />
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
            <View className="flex-row items-center flex-1 gap-1">
              <Ionicons name="location" size={13} color="#94A3B8" />
              <Text
                className="text-xs text-text-secondary font-medium"
                numberOfLines={1}
              >
                {technician.location}
              </Text>
            </View>

            {/* Price */}
            <View className="flex-row items-center gap-0.5">
              <Text className="text-xs font-bold text-primary">
                {hourlyRate.toLocaleString()}
              </Text>
              <Text className="text-[10px] text-text-muted">{t("common.xafPerHour")}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TechnicianCard;
