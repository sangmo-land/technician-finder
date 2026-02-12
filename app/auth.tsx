import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { account } from "../src/services/appwrite";

/**
 * Deep-link receiver for OAuth callbacks.
 * Handles: technician-finder://auth?secret=...&userId=...
 *
 * After the browser redirects back, this screen confirms the session
 * and navigates the user into the app.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        await account.get();
        // Session exists — go to main app
        router.replace("/(tabs)");
      } catch {
        // No valid session — send back to sign-in
        router.replace("/(auth)/sign-in");
      }
    };

    checkSession();
  }, []);

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
