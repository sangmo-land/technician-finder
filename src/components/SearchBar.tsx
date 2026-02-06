import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search technicians...',
}) => {
  return (
    <View className="mx-4 mt-3 mb-1">
      <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border shadow-sm">
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput
          className="flex-1 ml-3 text-base text-text"
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')} className="ml-2">
            <Ionicons name="close-circle" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SearchBar;
