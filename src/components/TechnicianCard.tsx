import React from 'react';
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Technician } from "../types";
import { skillColors } from "../constants/colors";

interface TechnicianCardProps {
  technician: Technician;
  onPress: () => void;
}

const availabilityConfig = {
  available: { label: "Available", color: "#059669", bg: "#D1FAE5" },
  busy: { label: "Busy", color: "#D97706", bg: "#FEF3C7" },
  offline: { label: "Offline", color: "#94A3B8", bg: "#F1F5F9" },
};

const TechnicianCard: React.FC<TechnicianCardProps> = ({
  technician,
  onPress,
}) => {
  const skillColor = skillColors[technician.skill];
  const avail =
    availabilityConfig[technician.availability] || availabilityConfig.offline;

  return (
    <TouchableOpacity
      className="bg-surface rounded-2xl mx-4 my-2 shadow-sm overflow-hidden"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top row: Avatar + Info */}
      <View className="p-4 flex-row">
        {/* Avatar */}
        <View className="relative mr-4">
          <View
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: skillColor }}
          >
            <Text className="text-lg font-bold text-surface">
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
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-surface"
            style={{ backgroundColor: avail.color }}
          />
        </View>

        {/* Name + Skill + Availability */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-text" numberOfLines={1}>
            {technician.name}
          </Text>

          <View className="flex-row items-center mt-1 gap-2">
            <View
              className="flex-row items-center px-2 py-0.5 rounded-md gap-1"
              style={{ backgroundColor: `${skillColor}15` }}
            >
              <View
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: skillColor }}
              />
              <Text
                className="text-xs font-semibold"
                style={{ color: skillColor }}
              >
                {technician.skill}
              </Text>
            </View>

            <View
              className="px-2 py-0.5 rounded-md"
              style={{ backgroundColor: avail.bg }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: avail.color }}
              >
                {avail.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Chevron */}
        <View className="ml-2 w-8 h-8 rounded-full bg-background items-center justify-center self-center">
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </View>
      </View>

      {/* Bottom stats bar */}
      <View className="flex-row border-t border-border-light px-4 py-2.5">
        {/* Rating */}
        <View className="flex-row items-center flex-1 gap-1">
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text className="text-sm font-semibold text-text">
            {(technician.rating ?? 0) > 0
              ? technician.rating.toFixed(1)
              : "New"}
          </Text>
          {(technician.reviewCount ?? 0) > 0 && (
            <Text className="text-xs text-text-muted">
              ({technician.reviewCount})
            </Text>
          )}
        </View>

        {/* Location */}
        <View className="flex-row items-center flex-1 gap-1">
          <Ionicons name="location-outline" size={14} color="#94A3B8" />
          <Text className="text-sm text-text-secondary" numberOfLines={1}>
            {technician.location}
          </Text>
        </View>

        {/* Price */}
        <View className="flex-row items-center gap-1">
          <Text className="text-sm font-semibold text-primary">
            {(technician.hourlyRate ?? 0).toLocaleString()} XAF
          </Text>
          <Text className="text-xs text-text-muted">/hr</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TechnicianCard;
