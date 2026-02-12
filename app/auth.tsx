import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { account } from "../src/services/appwrite";

/**
 * Deep-link receiver for OAuth callbacks.
 * Handles: appwrite-callback-<PROJECT_ID>://localhost
 *
 * After the browser redirects back, this screen confirms the session
 * and navigates the user into the app.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ secret?: string; userId?: string }>();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // If we received OAuth params, create a session first
        if (params.secret && params.userId) {
          try {
            await account.deleteSession("current");
          } catch {
            /* no session to delete */
          }
          await account.createSession(params.userId, params.secret);
        }

        // Verify session exists
        await account.get();
        router.replace("/(tabs)");
      } catch {
        router.replace("/(auth)/sign-in");
      }
    };

    handleCallback();
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
