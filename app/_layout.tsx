import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../src/constants/colors";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
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
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="technician/[id]"
          options={{
            title: "Technician Details",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="add-technician"
          options={{
            title: "Add Technician",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="edit-technician/[id]"
          options={{
            title: "Edit Technician",
            presentation: "modal",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
