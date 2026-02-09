import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../src/contexts/AuthContext";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(t("profile.signOutTitle"), t("profile.signOutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.signOut"),
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/(auth)/sign-in");
          } catch {
            Alert.alert(t("common.error"), t("profile.signOutFailed"));
          }
        },
      },
    ]);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <LinearGradient
        colors={["#022C22", "#065F46", "#047857"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 20, paddingBottom: 32 }}
        className="px-6 items-center"
      >
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <Text className="text-2xl font-bold text-white">{initials}</Text>
        </View>
        <Text className="text-xl font-bold text-white">
          {user?.name || t("profile.guest")}
        </Text>
        <Text
          className="text-sm mt-1"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          {user?.email || ""}
        </Text>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider px-6 mb-3">
          {t("profile.account")}
        </Text>
        <View className="bg-surface mx-4 rounded-2xl" style={{ borderWidth: 1, borderColor: "#E2E8F0" }}>
          <ProfileRow
            icon="person-outline"
            label={t("profile.name")}
            value={user?.name || "—"}
          />
          <View className="h-px bg-border mx-4" />
          <ProfileRow
            icon="mail-outline"
            label={t("profile.email")}
            value={user?.email || "—"}
          />
        </View>

        {/* App Section */}
        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider px-6 mb-3 mt-8">
          {t("profile.app")}
        </Text>
        <View className="bg-surface mx-4 rounded-2xl" style={{ borderWidth: 1, borderColor: "#E2E8F0" }}>
          <ProfileRow
            icon="language-outline"
            label={t("profile.language")}
            value={t("profile.currentLanguage")}
          />
          <View className="h-px bg-border mx-4" />
          <ProfileRow
            icon="information-circle-outline"
            label={t("profile.version")}
            value="1.0.0"
          />
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.85}
          className="mx-4 mt-8"
        >
          <View
            className="flex-row items-center justify-center rounded-2xl py-4"
            style={{ backgroundColor: "#FEE2E2" }}
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text className="text-base font-semibold ml-2" style={{ color: "#DC2626" }}>
              {t("auth.signOut")}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center px-4 py-4">
      <View
        className="w-9 h-9 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: "#D1FAE5" }}
      >
        <Ionicons name={icon} size={18} color="#065F46" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-text-muted">{label}</Text>
        <Text className="text-sm font-medium text-text mt-0.5">{value}</Text>
      </View>
    </View>
  );
}
