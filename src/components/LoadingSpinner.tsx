import React from 'react';
import { View, ActivityIndicator, Text } from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  message,
}) => {
  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <View className="bg-surface rounded-2xl p-8 items-center shadow-md">
        <ActivityIndicator size={size} color="#065F46" />
        {message && (
          <Text className="text-base text-text-secondary mt-4">{message}</Text>
        )}
      </View>
    </View>
  );
};

export default LoadingSpinner;
