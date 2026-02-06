import React from 'react';
import { View, Text } from "react-native";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "🔍",
  title,
  message,
}) => {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="bg-surface rounded-2xl p-8 items-center max-w-[320px] shadow-md">
        <View className="w-20 h-20 rounded-full bg-background items-center justify-center mb-5">
          <Text className="text-[40px]">{icon}</Text>
        </View>
        <Text className="text-xl font-semibold text-text mb-2 text-center">
          {title}
        </Text>
        <Text className="text-base text-text-secondary text-center">
          {message}
        </Text>
      </View>
    </View>
  );
};

export default EmptyState;
