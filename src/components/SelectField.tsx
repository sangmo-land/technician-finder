import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

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
  placeholder,
  error,
}: SelectFieldProps<T>) {
  const { t } = useTranslation();
  const displayPlaceholder = placeholder ?? t("selectField.selectOption");
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
          {value || displayPlaceholder}
        </Text>
        <View className="w-7 h-7 rounded-full bg-surface items-center justify-center">
          <Ionicons name="chevron-down" size={18} color="#475569" />
        </View>
      </TouchableOpacity>
      {error && (
        <Text className="text-xs font-medium text-danger mt-1">{error}</Text>
      )}

      {modalVisible && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(15, 23, 42, 0.6)",
            }}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                maxHeight: "70%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: "#F1F5F9",
                }}
              >
                <Text
                  style={{ fontSize: 20, fontWeight: "600", color: "#0F172A" }}
                >
                  {label}
                </Text>
                <TouchableOpacity
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#F8FAFC",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#475569" />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={{ paddingHorizontal: 16, paddingVertical: 12 }}
                showsVerticalScrollIndicator={false}
              >
                {options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 16,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      marginBottom: 4,
                      backgroundColor:
                        value === option ? "#D1FAE5" : "transparent",
                    }}
                    onPress={() => handleSelect(option)}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: value === option ? "500" : "400",
                        color: value === option ? "#065F46" : "#0F172A",
                      }}
                    >
                      {option}
                    </Text>
                    {value === option && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#065F46"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

export default SelectField;
