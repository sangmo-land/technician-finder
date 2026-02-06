import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SelectFieldProps<T extends string> {
  label: string;
  value: T | null;
  options: readonly T[];
  onSelect: (value: T) => void;
  placeholder?: string;
  error?: string;
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select an option",
  error,
}: SelectFieldProps<T>) {
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleSelect = (option: T) => {
    onSelect(option);
    setModalVisible(false);
  };

  return (
    <View className="mb-4">
      <Text className="text-xs font-semibold text-text mb-2 uppercase tracking-wide">
        {label}
      </Text>
      <TouchableOpacity
        className={`bg-background border-[1.5px] rounded-xl px-4 py-3 flex-row justify-between items-center ${
          error ? "border-danger bg-danger-light" : "border-border"
        }`}
        onPress={() => setModalVisible(true)}
      >
        <Text
          className={`text-base ${value ? "text-text" : "text-text-light"}`}
        >
          {value || placeholder}
        </Text>
        <View className="w-7 h-7 rounded-full bg-surface items-center justify-center">
          <Ionicons name="chevron-down" size={18} color="#475569" />
        </View>
      </TouchableOpacity>
      {error && (
        <Text className="text-xs font-medium text-danger mt-1">{error}</Text>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-surface rounded-t-2xl max-h-[70%] shadow-xl">
            <View className="flex-row justify-between items-center p-5 border-b border-border-light">
              <Text className="text-xl font-semibold text-text">{label}</Text>
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-background items-center justify-center"
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#475569" />
              </TouchableOpacity>
            </View>
            <ScrollView
              className="px-4 py-3"
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`flex-row items-center justify-between py-4 px-3 rounded-xl mb-1 ${
                    value === option ? "bg-primary-muted" : ""
                  }`}
                  onPress={() => handleSelect(option)}
                >
                  <Text
                    className={`text-base ${
                      value === option
                        ? "font-medium text-primary"
                        : "text-text"
                    }`}
                  >
                    {option}
                  </Text>
                  {value === option && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#1E40AF"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default SelectField;
