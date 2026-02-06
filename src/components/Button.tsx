import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantClasses = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  danger: "bg-danger-light",
  outline: "bg-transparent border-2 border-primary shadow-none",
};

const textClasses = {
  primary: "text-surface",
  secondary: "text-surface",
  danger: "text-danger",
  outline: "text-primary",
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      className={`py-3 px-6 rounded-xl items-center justify-center min-h-[52px] shadow-sm ${variantClasses[variant]} ${disabled ? "opacity-50" : ""}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#1E40AF" : "#FFFFFF"}
        />
      ) : (
        <Text
          className={`text-base font-medium ${textClasses[variant]}`}
          style={textStyle}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
