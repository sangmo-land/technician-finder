import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Skill, SKILLS, LOCATIONS } from "../types";
import { skillColors } from "../constants/colors";

interface FilterBarProps {
  selectedSkill: Skill | null;
  selectedLocation: string | null;
  onSkillChange: (skill: Skill | null) => void;
  onLocationChange: (location: string | null) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedSkill,
  selectedLocation,
  onSkillChange,
  onLocationChange,
}) => {
  return (
    <View className="bg-surface pt-3 pb-3 border-b border-border-light shadow-sm">
      <View className="mb-2">
        <View className="flex-row items-center gap-1 px-4 mb-2">
          <Ionicons name="construct-outline" size={16} color="#475569" />
          <Text className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Skill
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        >
          <TouchableOpacity
            className={`px-4 py-2 rounded-full border-[1.5px] ${
              !selectedSkill
                ? "bg-primary border-primary"
                : "bg-background border-border"
            }`}
            onPress={() => onSkillChange(null)}
          >
            <Text
              className={`text-sm font-semibold ${
                !selectedSkill ? "text-surface" : "text-text-secondary"
              }`}
            >
              All
            </Text>
          </TouchableOpacity>
          {SKILLS.map((skill) => {
            const isSelected = selectedSkill === skill;
            const color = skillColors[skill];
            return (
              <TouchableOpacity
                key={skill}
                className={`px-4 py-2 rounded-full border-[1.5px] ${
                  !isSelected ? "bg-background border-border" : ""
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: color,
                        borderColor: color,
                        borderWidth: 1.5,
                      }
                    : undefined
                }
                onPress={() => onSkillChange(isSelected ? null : skill)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isSelected ? "text-surface" : "text-text-secondary"
                  }`}
                >
                  {skill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View className="mb-2">
        <View className="flex-row items-center gap-1 px-4 mb-2">
          <Ionicons name="location-outline" size={16} color="#475569" />
          <Text className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Location
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        >
          <TouchableOpacity
            className={`px-4 py-2 rounded-full border-[1.5px] ${
              !selectedLocation
                ? "bg-primary border-primary"
                : "bg-background border-border"
            }`}
            onPress={() => onLocationChange(null)}
          >
            <Text
              className={`text-sm font-semibold ${
                !selectedLocation ? "text-surface" : "text-text-secondary"
              }`}
            >
              All
            </Text>
          </TouchableOpacity>
          {LOCATIONS.map((location) => {
            const isSelected = selectedLocation === location;
            return (
              <TouchableOpacity
                key={location}
                className={`px-4 py-2 rounded-full border-[1.5px] ${
                  isSelected
                    ? "bg-primary border-primary"
                    : "bg-background border-border"
                }`}
                onPress={() => onLocationChange(isSelected ? null : location)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isSelected ? "text-surface" : "text-text-secondary"
                  }`}
                >
                  {location}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

export default FilterBar;
