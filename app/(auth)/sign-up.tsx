import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../src/contexts/AuthContext";
import { changeLanguage, supportedLanguages } from "../../src/i18n";

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { signUp, signInWithGoogle } = useAuth();

  const currentLang = supportedLanguages.find((l) => l.code === i18n.language) || supportedLanguages[0];
  const nextLang = supportedLanguages.find((l) => l.code !== i18n.language) || supportedLanguages[1];

  const toggleLanguage = () => {
    changeLanguage(nextLang.code);
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert(t("common.error"), t("auth.fillAllFields"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("common.error"), t("auth.passwordsMismatch"));
      return;
    }

    if (password.length < 8) {
      Alert.alert(t("common.error"), t("auth.passwordTooShort"));
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      router.replace("/(tabs)");
    } catch (error: any) {
      const message =
        error?.message || t("auth.signUpFailed");
      Alert.alert(t("common.error"), message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.replace("/(tabs)");
    } catch (error: any) {
      if (!error?.message?.includes("cancelled")) {
        Alert.alert(t("common.error"), error?.message || t("auth.googleFailed"));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Hero header */}
      <LinearGradient
        colors={["#022C22", "#065F46", "#047857"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 30, paddingBottom: 30 }}
        className="px-6 items-center"
      >
        {/* Language Toggle */}
        <TouchableOpacity
          onPress={toggleLanguage}
          activeOpacity={0.7}
          style={{
            position: "absolute",
            top: insets.top + 10,
            right: 16,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.15)",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 6 }}>{currentLang.flag}</Text>
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "600" }}>
            {currentLang.code.toUpperCase()}
          </Text>
        </TouchableOpacity>
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <Ionicons name="person-add" size={36} color="#FDE68A" />
        </View>
        <Text className="text-2xl font-bold text-white mb-1">
          {t("auth.createAccount")}
        </Text>
        <Text
          className="text-sm text-center"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          {t("auth.signUpSubtitle")}
        </Text>
      </LinearGradient>

      {/* Form */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 28, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Full Name */}
          <Text className="text-sm font-semibold text-text mb-2">
            {t("auth.fullName")}
          </Text>
          <View
            className="flex-row items-center bg-surface rounded-xl px-4 mb-4"
            style={{ borderWidth: 1, borderColor: "#E2E8F0", height: 52 }}
          >
            <Ionicons name="person-outline" size={18} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-3 text-base text-text"
              placeholder={t("auth.fullNamePlaceholder")}
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          {/* Email */}
          <Text className="text-sm font-semibold text-text mb-2">
            {t("auth.email")}
          </Text>
          <View
            className="flex-row items-center bg-surface rounded-xl px-4 mb-4"
            style={{ borderWidth: 1, borderColor: "#E2E8F0", height: 52 }}
          >
            <Ionicons name="mail-outline" size={18} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-3 text-base text-text"
              placeholder={t("auth.emailPlaceholder")}
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password */}
          <Text className="text-sm font-semibold text-text mb-2">
            {t("auth.password")}
          </Text>
          <View
            className="flex-row items-center bg-surface rounded-xl px-4 mb-4"
            style={{ borderWidth: 1, borderColor: "#E2E8F0", height: 52 }}
          >
            <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-3 text-base text-text"
              placeholder={t("auth.passwordPlaceholder")}
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#94A3B8"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text className="text-sm font-semibold text-text mb-2">
            {t("auth.confirmPassword")}
          </Text>
          <View
            className="flex-row items-center bg-surface rounded-xl px-4 mb-8"
            style={{ borderWidth: 1, borderColor: "#E2E8F0", height: 52 }}
          >
            <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-3 text-base text-text"
              placeholder={t("auth.confirmPasswordPlaceholder")}
              placeholderTextColor="#94A3B8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading || googleLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#047857", "#065F46"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-xl items-center justify-center"
              style={{ height: 52 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-bold text-white">
                  {t("auth.signUp")}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-border" />
            <Text className="mx-4 text-xs text-text-muted font-medium">
              {t("auth.orContinueWith")}
            </Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Google Sign Up */}
          <TouchableOpacity
            onPress={handleGoogleSignUp}
            disabled={loading || googleLoading}
            activeOpacity={0.85}
            className="flex-row items-center justify-center bg-surface rounded-xl"
            style={{
              height: 52,
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            {googleLoading ? (
              <ActivityIndicator color="#065F46" />
            ) : (
              <>
                <Image
                  source={require("../../assets/google-logo.png")}
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
                <Text className="text-base font-semibold text-text ml-3">
                  {t("auth.signUpWithGoogle")}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-text-secondary">
              {t("auth.hasAccount")}{" "}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-sm font-bold" style={{ color: "#065F46" }}>
                {t("auth.signIn")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
