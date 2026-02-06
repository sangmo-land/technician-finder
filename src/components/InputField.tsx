import React from 'react';
import { View, Text, TextInput, ViewStyle } from "react-native";

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  error?: string;
  multiline?: boolean;
  style?: ViewStyle;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  error,
  multiline = false,
  style,
}) => {
  return (
    <View className="mb-4" style={style}>
      <Text className="text-xs font-semibold text-text mb-2 uppercase tracking-wide">
        {label}
      </Text>
      <TextInput
        className={`bg-background border-[1.5px] rounded-xl px-4 py-3 text-base text-text ${
          error ? "border-danger bg-danger-light" : "border-border"
        } ${multiline ? "min-h-[100px] pt-3" : ""}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#CBD5E1"
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {error && (
        <Text className="text-xs font-medium text-danger mt-1">{error}</Text>
      )}
    </View>
  );
};

export default InputField;
