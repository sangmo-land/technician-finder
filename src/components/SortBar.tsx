import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SortOption, SORT_OPTIONS } from '../types';

interface SortBarProps {
  selectedSort: SortOption | null;
  onSortChange: (sort: SortOption | null) => void;
}

const SortBar: React.FC<SortBarProps> = ({ selectedSort, onSortChange }) => {
  return (
    <View className="pb-2 pt-1">
      <View className="flex-row items-center gap-1 px-4 mb-2">
        <Ionicons name="swap-vertical-outline" size={16} color="#475569" />
        <Text className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          Sort By
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
      >
        <TouchableOpacity
          className={`px-4 py-2 rounded-full border-[1.5px] ${
            !selectedSort
              ? 'bg-primary border-primary'
              : 'bg-background border-border'
          }`}
          onPress={() => onSortChange(null)}
        >
          <Text
            className={`text-sm font-semibold ${
              !selectedSort ? 'text-surface' : 'text-text-secondary'
            }`}
          >
            Default
          </Text>
        </TouchableOpacity>
        {SORT_OPTIONS.map((option) => {
          const isSelected = selectedSort === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              className={`px-4 py-2 rounded-full border-[1.5px] flex-row items-center gap-1.5 ${
                isSelected
                  ? 'bg-primary border-primary'
                  : 'bg-background border-border'
              }`}
              onPress={() => onSortChange(isSelected ? null : option.value)}
            >
              <Ionicons
                name={
                  option.value === 'rating'
                    ? 'star'
                    : option.value === 'experience'
                    ? 'time'
                    : option.value === 'price_low'
                    ? 'arrow-up'
                    : 'arrow-down'
                }
                size={14}
                color={isSelected ? '#FFFFFF' : '#475569'}
              />
              <Text
                className={`text-sm font-semibold ${
                  isSelected ? 'text-surface' : 'text-text-secondary'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default SortBar;
