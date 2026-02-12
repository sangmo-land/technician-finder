import "../global.css";
import { useEffect, useState, useCallback } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import * as ExpoSplashScreen from "expo-splash-screen";
import { colors } from "../src/constants/colors";
import { initI18n } from "../src/i18n";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import SplashScreen from "../src/components/SplashScreen";
import { loadCustomSkills, getAllSkillDocs } from "../src/services/skills";
import { ensureSession } from "../src/services/appwrite";
import {
  setupNotifications,
  subscribeToNewUsers,
  sendLocalNotification,
} from "../src/services/notifications";

// Prevent the native splash from auto-hiding
ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // ── Notifications: request permission + subscribe to new users ──
  useEffect(() => {
    setupNotifications();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsub = subscribeToNewUsers((name, location) => {
      const title = i18next.t("notifications.newUserTitle");
      const body = location
        ? i18next.t("notifications.newUserBodyWithLocation", { name, location })
        : i18next.t("notifications.newUserBody", { name });
      sendLocalNotification(title, body, { type: "new-user" });
    }, user.$id);

    return unsub;
  }, [user]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (user && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (
      !user &&
      !inAuthGroup &&
      segments[0] !== "(tabs)" &&
      segments[0] !== "technician"
    ) {
      // Allow unauthenticated users to browse tabs and technician details
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.surface,
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
        initialRouteName="(tabs)"
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen
          name="technician/[id]"
          options={{
            headerShown: false,
            title: t("screens.technicianDetails"),
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="add-technician"
          options={{
            title: t("screens.addTechnician"),
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="edit-technician/[id]"
          options={{
            title: t("screens.editTechnician"),
            presentation: "modal",
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initI18n().then(async () => {
      // Ensure a session exists before making any Appwrite calls
      await ensureSession();

      // Load skills from Appwrite and register their i18n translations
      try {
        await loadCustomSkills();
        const docs = await getAllSkillDocs();
        for (const doc of docs) {
          i18next.addResource(
            "en",
            "translation",
            `skills.${doc.nameEn}`,
            doc.nameEn,
          );
          i18next.addResource(
            "en",
            "translation",
            `skillShort.${doc.nameEn}`,
            doc.nameEn,
          );
          const frLabel = doc.nameFr || doc.nameEn;
          i18next.addResource(
            "fr",
            "translation",
            `skills.${doc.nameEn}`,
            frLabel,
          );
          i18next.addResource(
            "fr",
            "translation",
            `skillShort.${doc.nameEn}`,
            frLabel,
          );
        }
      } catch {
        // Skills will use defaults if Appwrite is unreachable
      }

      setI18nReady(true);
      ExpoSplashScreen.hideAsync().catch(() => {});
    });
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!i18nReady) {
    // Keep the native splash visible while i18n loads
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      </AuthProvider>
    </SafeAreaProvider>
  );
}
