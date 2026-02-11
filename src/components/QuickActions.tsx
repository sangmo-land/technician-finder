import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

interface QuickAction {
  id: string;
  icon: string;
  labelKey: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}

interface QuickActionsProps {
  onEmergencyPress: () => void;
  onSchedulePress: () => void;
  onNearestPress: () => void;
  onTeamPress: () => void;
}

export function QuickActions({
  onEmergencyPress,
  onSchedulePress,
  onNearestPress,
  onTeamPress,
}: QuickActionsProps) {
  const { t } = useTranslation();

  const actions: QuickAction[] = [
    {
      id: "emergency",
      icon: "alert-circle",
      labelKey: "quickActions.emergency",
      color: "#DC2626",
      bgColor: "#FEE2E2",
      onPress: onEmergencyPress,
    },
    {
      id: "schedule",
      icon: "calendar",
      labelKey: "quickActions.schedule",
      color: "#2563EB",
      bgColor: "#DBEAFE",
      onPress: onSchedulePress,
    },
    {
      id: "nearest",
      icon: "navigate",
      labelKey: "quickActions.nearest",
      color: "#059669",
      bgColor: "#D1FAE5",
      onPress: onNearestPress,
    },
    {
      id: "team",
      icon: "people",
      labelKey: "quickActions.team",
      color: "#7C3AED",
      bgColor: "#EDE9FE",
      onPress: onTeamPress,
    },
  ];

  const handlePress = (action: QuickAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action.onPress();
  };

  return (
    <View className="px-4 py-3 gap-2">
      <View className="flex-row items-center gap-1.5 mb-1">
        <Ionicons name="flash" size={14} color="#065F46" />
        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider">
          {t("quickActions.title")}
        </Text>
      </View>
      <View className="flex-row gap-2">
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            className="flex-1 rounded-xl p-3 items-center"
            style={{ backgroundColor: action.bgColor }}
            onPress={() => handlePress(action)}
            activeOpacity={0.7}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mb-1.5"
              style={{ backgroundColor: `${action.color}18` }}
            >
              <Ionicons
                name={action.icon as any}
                size={20}
                color={action.color}
              />
            </View>
            <Text
              className="text-[10px] font-semibold text-center"
              style={{ color: action.color }}
              numberOfLines={2}
            >
              {t(action.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
