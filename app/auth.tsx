import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";

/**
 * Fallback OAuth callback screen.
 *
 * Note: OAuth callbacks are now primarily handled in _layout.tsx via deep link
 * interception. This screen serves as a fallback that simply checks if the user
 * is already authenticated and redirects accordingly.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth state to be determined
    if (isLoading) return;

    // If user is logged in, go to main app; otherwise go to sign-in
    if (user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/sign-in");
    }
  }, [user, isLoading, router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#065F46",
      }}
    >
      <ActivityIndicator size="large" color="#FFFFFF" />
      <Text style={{ color: "#FFFFFF", marginTop: 16, fontSize: 16 }}>
        Signing you in...
      </Text>
    </View>
  );
}
