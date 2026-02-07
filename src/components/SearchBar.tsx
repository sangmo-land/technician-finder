import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  variant?: "default" | "hero";
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder,
  variant = "default",
}) => {
  const { t } = useTranslation();
  const isHero = variant === "hero";
  const displayPlaceholder = placeholder || t("search.placeholder");

  return (
    <View className={isHero ? "" : "mx-4 mt-3 mb-1"}>
      <View
        className={`flex-row items-center rounded-2xl px-4 py-3.5 ${
          isHero
            ? "border border-white/25"
            : "bg-surface border border-border shadow-sm"
        }`}
        style={
          isHero ? { backgroundColor: "rgba(255,255,255,0.15)" } : undefined
        }
      >
        <View
          className={`w-9 h-9 rounded-xl items-center justify-center ${
            isHero ? "" : "bg-primary-muted"
          }`}
          style={
            isHero ? { backgroundColor: "rgba(255,255,255,0.2)" } : undefined
          }
        >
          <Ionicons
            name="search"
            size={18}
            color={isHero ? "#FFFFFF" : "#1E40AF"}
          />
        </View>
        <TextInput
          className={`flex-1 ml-3 text-base ${isHero ? "text-white" : "text-text"}`}
          placeholder={displayPlaceholder}
          placeholderTextColor={isHero ? "rgba(255,255,255,0.55)" : "#94A3B8"}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText("")}
            className="ml-2 w-8 h-8 rounded-full items-center justify-center"
            style={{
              backgroundColor: isHero ? "rgba(255,255,255,0.2)" : "#F1F5F9",
            }}
          >
            <Ionicons
              name="close"
              size={16}
              color={isHero ? "#FFFFFF" : "#94A3B8"}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SearchBar;
