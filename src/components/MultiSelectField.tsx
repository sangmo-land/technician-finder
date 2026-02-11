import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface MultiSelectFieldProps<T extends string> {
  label: string;
  /** Currently selected raw values */
  selectedValues: T[];
  /** All available raw values */
  options: readonly T[];
  /** Called with the updated selection array */
  onSelectionChange: (values: T[]) => void;
  /** Map a raw value to a display label (e.g. translate) */
  displayLabel?: (value: T) => string;
  placeholder?: string;
  error?: string;
  /** Maximum number of selections allowed (default 3) */
  max?: number;
}

function MultiSelectField<T extends string>({
  label,
  selectedValues,
  options,
  onSelectionChange,
  displayLabel,
  placeholder,
  error,
  max = 3,
}: MultiSelectFieldProps<T>) {
  const { t } = useTranslation();
  const displayPlaceholder = placeholder ?? t("selectField.selectOption");
  const [modalVisible, setModalVisible] = React.useState(false);

  const getLabel = (val: T) => (displayLabel ? displayLabel(val) : val);

  const isSelected = (val: T) => selectedValues.includes(val);
  const isFull = selectedValues.length >= max;

  const handleToggle = (option: T) => {
    if (isSelected(option)) {
      onSelectionChange(selectedValues.filter((v) => v !== option));
    } else if (!isFull) {
      onSelectionChange([...selectedValues, option]);
    }
  };

  const handleRemoveChip = (option: T) => {
    onSelectionChange(selectedValues.filter((v) => v !== option));
  };

  return (
    <View className="mb-4">
      <Text className="text-xs font-semibold text-text mb-2 uppercase tracking-wide">
        {label}
      </Text>

      {/* Selected chips */}
      {selectedValues.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 8,
          }}
        >
          {selectedValues.map((val) => (
            <View
              key={val}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#D1FAE5",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                gap: 6,
              }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#065F46" }}
              >
                {getLabel(val)}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemoveChip(val)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={16} color="#065F46" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Trigger button */}
      <TouchableOpacity
        className={`bg-background border-[1.5px] rounded-xl px-4 py-3 flex-row justify-between items-center ${
          error ? "border-danger bg-danger-light" : "border-border"
        }`}
        onPress={() => setModalVisible(true)}
      >
        <Text
          className={`text-base ${selectedValues.length > 0 ? "text-text" : "text-text-light"}`}
        >
          {selectedValues.length > 0
            ? `${selectedValues.length}/${max} ${t("multiSelect.selected")}`
            : displayPlaceholder}
        </Text>
        <View className="w-7 h-7 rounded-full bg-surface items-center justify-center">
          <Ionicons name="chevron-down" size={18} color="#475569" />
        </View>
      </TouchableOpacity>
      {error && (
        <Text className="text-xs font-medium text-danger mt-1">{error}</Text>
      )}

      {/* Selection modal */}
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
              {/* Header */}
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
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "600",
                      color: "#0F172A",
                    }}
                  >
                    {label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#64748B",
                      marginTop: 2,
                    }}
                  >
                    {t("multiSelect.maxHint", { max })}
                  </Text>
                </View>
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

              {/* Counter */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                  gap: 4,
                }}
              >
                {Array.from({ length: max }).map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor:
                        i < selectedValues.length ? "#065F46" : "#E2E8F0",
                    }}
                  />
                ))}
                <Text
                  style={{
                    fontSize: 12,
                    color: "#64748B",
                    marginLeft: 6,
                    fontWeight: "500",
                  }}
                >
                  {selectedValues.length}/{max}
                </Text>
              </View>

              {/* Options list */}
              <ScrollView
                style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                showsVerticalScrollIndicator={false}
              >
                {options.map((option) => {
                  const selected = isSelected(option);
                  const disabled = !selected && isFull;

                  return (
                    <TouchableOpacity
                      key={option}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 14,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        marginBottom: 4,
                        backgroundColor: selected ? "#D1FAE5" : "transparent",
                        opacity: disabled ? 0.4 : 1,
                      }}
                      onPress={() => !disabled && handleToggle(option)}
                      disabled={disabled}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: selected ? "600" : "400",
                          color: selected ? "#065F46" : "#0F172A",
                        }}
                      >
                        {getLabel(option)}
                      </Text>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          borderWidth: 2,
                          borderColor: selected ? "#065F46" : "#CBD5E1",
                          backgroundColor: selected ? "#065F46" : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {selected && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: 16 }} />
              </ScrollView>

              {/* Done button */}
              <View
                style={{
                  padding: 16,
                  borderTopWidth: 1,
                  borderTopColor: "#F1F5F9",
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "#065F46",
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text
                    style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}
                  >
                    {t("multiSelect.done")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

export default MultiSelectField;
