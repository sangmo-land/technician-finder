import React, { useEffect } from "react";
import { View, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";

const SkeletonPulse: React.FC<{
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}> = ({ width = "100%", height = 16, borderRadius = 8, style }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0.3, 1], [0.3, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#E2E8F0",
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  variant?: "default" | "featured";
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = "default",
}) => {
  const isFeatured = variant === "featured";

  const cardShadow = Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: isFeatured ? 6 : 4 },
      shadowOpacity: isFeatured ? 0.1 : 0.08,
      shadowRadius: isFeatured ? 14 : 10,
    },
    android: {
      elevation: isFeatured ? 8 : 5,
    },
  });

  return (
    <View
      className={`mx-4 ${isFeatured ? "my-3" : "my-2"}`}
      style={cardShadow}
    >
      <View
        className="bg-surface overflow-hidden rounded-2xl"
        style={{ borderWidth: 1, borderColor: "#F1F5F9" }}
      >
        {/* Cover Image Skeleton */}
        <SkeletonPulse
          height={isFeatured ? 160 : 130}
          borderRadius={0}
        />

        {/* Profile Row */}
        <View
          className={`flex-row items-center ${
            isFeatured ? "px-4 pt-3.5 pb-2.5" : "px-4 py-3"
          }`}
        >
          {/* Avatar */}
          <SkeletonPulse
            width={isFeatured ? 56 : 48}
            height={isFeatured ? 56 : 48}
            borderRadius={isFeatured ? 16 : 12}
            style={{ marginRight: 14 }}
          />

          {/* Info */}
          <View className="flex-1">
            <SkeletonPulse width="70%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonPulse width="50%" height={12} />
          </View>
        </View>

        {/* Bio skeleton (featured only) */}
        {isFeatured && (
          <View className="px-4 pb-2">
            <SkeletonPulse width="90%" height={10} style={{ marginBottom: 4 }} />
            <SkeletonPulse width="60%" height={10} />
          </View>
        )}

        {/* Stats Footer */}
        <View
          className={`flex-row items-center border-t border-border-light ${
            isFeatured ? "px-4 py-2.5" : "px-4 py-2"
          }`}
        >
          <SkeletonPulse width={50} height={12} style={{ marginRight: 16 }} />
          <SkeletonPulse width={60} height={12} style={{ marginRight: 16 }} />
          <SkeletonPulse width={30} height={12} />
          <View style={{ flex: 1 }} />
          <SkeletonPulse width={40} height={12} />
        </View>
      </View>
    </View>
  );
};

/** Full-screen skeleton loading with multiple cards */
export const SkeletonList: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <View className="flex-1 bg-background">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} variant={i === 0 ? "featured" : "default"} />
    ))}
  </View>
);

export default SkeletonCard;
