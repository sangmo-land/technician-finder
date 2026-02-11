import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Linking,
  Alert,
  TouchableOpacity,
  Share,
  Image,
  Animated,
  Dimensions,
  Platform,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { TechnicianWithProfile } from "../../src/types";
import i18next from "i18next";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  getTechnicianById,
  toggleFavorite,
  isFavorite as checkFavorite,
  addToRecentlyViewed,
} from "../../src/services/storage";
import { incrementProfileViews } from "../../src/services/appwrite";
import { skillColors } from "../../src/constants/colors";
import { LoadingSpinner, EmptyState, GalleryView } from "../../src/components";

const availabilityConfig: Record<
  string,
  { labelKey: string; color: string; bg: string; icon: string }
> = {
  available: {
    labelKey: "availability.availableNow",
    color: "#059669",
    bg: "#D1FAE5",
    icon: "checkmark-circle",
  },
  busy: {
    labelKey: "availability.currentlyBusy",
    color: "#D97706",
    bg: "#FEF3C7",
    icon: "time",
  },
  offline: {
    labelKey: "availability.offline",
    color: "#94A3B8",
    bg: "#F1F5F9",
    icon: "moon",
  },
};

const skillIcons: Record<string, string> = {
  Plumber: "water",
  Electrician: "flash",
  Carpenter: "hammer",
  Mason: "construct",
  Painter: "color-palette",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TechnicianDetailsScreen() {
  const { id, data: dataParam } = useLocalSearchParams<{
    id: string;
    data?: string;
  }>();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Try to hydrate from route params first (instant) → fall back to API
  const initialData = React.useMemo(() => {
    if (!dataParam) return null;
    try {
      return JSON.parse(dataParam) as TechnicianWithProfile;
    } catch {
      return null;
    }
  }, [dataParam]);

  const [technician, setTechnician] = useState<TechnicianWithProfile | null>(
    initialData,
  );
  const [loading, setLoading] = useState(!initialData);
  const [isFav, setIsFav] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!id) return;
    // Always check favorite status
    checkFavorite(id)
      .then(setIsFav)
      .catch(() => {});
    // Increment profile views (fire-and-forget)
    incrementProfileViews(id);
    // Track recently viewed (fire-and-forget)
    addToRecentlyViewed(id);
    // Only fetch from API if we don't have data from params
    if (initialData) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const data = await getTechnicianById(id);
        setTechnician(data);
      } catch (error) {
        console.error("Error loading technician:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, initialData]);

  function promptSignIn() {
    Alert.alert(t("detail.signInRequired"), t("detail.signInRequiredMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("detail.signInButton"),
        onPress: () => router.push("/(auth)/sign-in"),
      },
    ]);
  }

  const handleToggleFavorite = async () => {
    if (!id) return;
    if (!user) {
      promptSignIn();
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await toggleFavorite(id);
      setIsFav(result);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleCall = () => {
    if (!technician) return;
    if (!user) {
      promptSignIn();
      return;
    }
    const phoneNumber = technician.phone.replace(/\s/g, "");
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(
            t("detail.cannotCallTitle"),
            t("detail.cannotCallMessage"),
            [{ text: t("common.ok") }],
          );
        }
      })
      .catch(() => Alert.alert(t("common.error"), t("detail.failedCall")));
  };

  const handleWhatsApp = () => {
    if (!technician) return;
    if (!user) {
      promptSignIn();
      return;
    }
    const phoneNumber = technician.phone.replace(/[\s\-()]/g, "");
    // Remove leading 0 and ensure country code
    const normalized = phoneNumber.startsWith("+")
      ? phoneNumber.replace("+", "")
      : phoneNumber.startsWith("00")
        ? phoneNumber.slice(2)
        : `237${phoneNumber.replace(/^0/, "")}`;
    const message = encodeURIComponent(
      t("detail.whatsappGreeting", { name: technician.name.split(" ")[0] }),
    );
    const url = `https://wa.me/${normalized}?text=${message}`;
    Linking.openURL(url).catch(() =>
      Alert.alert(t("common.error"), t("detail.whatsappFailed")),
    );
  };

  const handleShare = async () => {
    if (!technician) return;
    if (!user) {
      promptSignIn();
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const skills = technician.skills
        .map((s) => t(`skills.${s}`, { defaultValue: s }))
        .join(", ");
      await Share.share({
        title: t("detail.shareTitle", { name: technician.name }),
        message: t("detail.shareMessage", {
          name: technician.name,
          skills,
          location: technician.location,
          phone: technician.phone,
        }),
      });
    } catch (error) {
      Alert.alert(t("common.error"), t("detail.shareFailed"));
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!technician) {
    return (
      <EmptyState
        icon="❌"
        title={t("detail.notFoundTitle")}
        message={t("detail.notFoundMessage")}
      />
    );
  }

  const color = skillColors[technician.skills[0]];
  const avail =
    availabilityConfig[technician.availability] || availabilityConfig.offline;
  const skillIcon = skillIcons[technician.skills[0]] || "build";
  const rating = technician.rating ?? 0;
  const reviewCount = technician.reviewCount ?? 0;
  const bio =
    i18next.language === "fr" && technician.bioFr
      ? technician.bioFr
      : technician.bio;
  const isBioLong = bio && bio.length > 120;

  // Animated header opacity
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View className="flex-1" style={{ backgroundColor: "#022C22" }}>
      {/* Animated mini header (appears on scroll — covers status bar) */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          opacity: headerOpacity,
        }}
      >
        <LinearGradient
          colors={["#022C22", "#065F46"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
        >
          <View className="flex-row items-center px-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text
              className="text-base font-semibold text-white flex-1"
              numberOfLines={1}
            >
              {technician.name}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1"
        style={{ backgroundColor: "#F8FAFC" }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* ── Gradient Profile Header ── */}
        <LinearGradient
          colors={["#022C22", "#065F46", "#047857"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 8, paddingBottom: 40 }}
          className="px-5"
        >
          {/* Top row: Back + Share + Favorite */}
          <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleShare}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleToggleFavorite}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isFav
                    ? "rgba(239,68,68,0.25)"
                    : "rgba(255,255,255,0.15)",
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isFav ? "heart" : "heart-outline"}
                  size={22}
                  color={isFav ? "#FCA5A5" : "#FFFFFF"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Avatar + Name */}
          <View className="items-center">
            <TouchableOpacity
              className="relative mb-4"
              activeOpacity={0.85}
              onPress={() => technician.avatar && setShowAvatarModal(true)}
              disabled={!technician.avatar}
            >
              {technician.avatar ? (
                <Image
                  source={{ uri: technician.avatar }}
                  className="w-28 h-28 rounded-full"
                  style={{
                    borderWidth: 4,
                    borderColor: "rgba(255,255,255,0.25)",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                />
              ) : (
                <View
                  className="w-28 h-28 rounded-full items-center justify-center"
                  style={{
                    borderWidth: 4,
                    borderColor: "rgba(255,255,255,0.25)",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <Ionicons
                    name="person"
                    size={50}
                    color="rgba(255,255,255,0.6)"
                  />
                </View>
              )}
              {/* Availability badge on avatar */}
              <View
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-[3px] items-center justify-center"
                style={{
                  backgroundColor: avail.color,
                  borderColor: "#065F46",
                }}
              >
                <Ionicons name={avail.icon as any} size={14} color="#FFFFFF" />
              </View>
              {/* Expand hint */}
              {technician.avatar ? (
                <View
                  className="absolute top-0 right-0 w-7 h-7 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                >
                  <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
                </View>
              ) : null}
            </TouchableOpacity>

            <Text className="text-2xl font-bold text-white mb-1 text-center">
              {technician.name}
            </Text>

            {/* Skill badge with icon */}
            <View className="flex-row items-center gap-2 mb-3">
              <View
                className="flex-row items-center px-3.5 py-1.5 rounded-full gap-1.5"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                <Ionicons name={skillIcon as any} size={14} color="#D1FAE5" />
                <Text
                  className="text-sm font-semibold"
                  style={{ color: "#D1FAE5" }}
                >
                  {technician.skills
                    .map((s) => t(`skills.${s}`, { defaultValue: s }))
                    .join(", ")}
                </Text>
              </View>
              <View
                className="flex-row items-center px-3 py-1.5 rounded-full gap-1.5"
                style={{ backgroundColor: `${avail.color}30` }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: "#FFFFFF" }}
                >
                  {t(avail.labelKey)}
                </Text>
              </View>
            </View>

            {/* Star rating */}
            <View className="flex-row items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(rating) ? "star" : "star-outline"}
                  size={18}
                  color="#FDE68A"
                />
              ))}
              <Text className="text-base font-bold text-white ml-1.5">
                {rating > 0 ? rating.toFixed(1) : t("common.new")}
              </Text>
              <Text
                className="text-sm ml-0.5"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                ({reviewCount} {t("common.reviews")})
              </Text>
            </View>

            {/* Member Since */}
            {technician.createdAt ? (
              <View className="flex-row items-center gap-1.5 mt-1">
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color="rgba(255,255,255,0.5)"
                />
                <Text
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {t("detail.memberSince", {
                    date: new Date(technician.createdAt).toLocaleDateString(
                      i18next.language === "fr" ? "fr-FR" : "en-US",
                      { month: "long", year: "numeric" },
                    ),
                  })}
                </Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        {/* ── Stats Row (overlapping the gradient) ── */}
        <View className="flex-row mx-4 gap-2" style={{ marginTop: -20 }}>
          {[
            {
              value: technician.experienceYears,
              label: t("detail.yearsExp"),
              icon: "briefcase-outline" as const,
            },
            {
              value: technician.jobsCompleted ?? 0,
              label: t("detail.jobsDone"),
              icon: "checkmark-done-outline" as const,
            },
            {
              value: (technician.hourlyRate ?? 0).toLocaleString(),
              label: t("common.xafPerHour"),
              icon: "cash-outline" as const,
            },
            {
              value: technician.profileViews ?? 0,
              label: t("detail.profileViews"),
              icon: "eye-outline" as const,
            },
          ].map((stat, i) => (
            <View
              key={i}
              className="flex-1 bg-surface rounded-xl py-3.5 items-center"
              style={{
                ...Platform.select({
                  ios: {
                    shadowColor: "#0F172A",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                  },
                  android: { elevation: 3 },
                }),
              }}
            >
              <Ionicons name={stat.icon} size={16} color="#065F46" />
              <Text className="text-lg font-bold text-text mt-1">
                {stat.value}
              </Text>
              <Text className="text-[10px] font-medium text-text-muted mt-0.5">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Bio ── */}
        {bio ? (
          <View className="bg-surface mx-4 mt-3 rounded-2xl p-5 shadow-sm">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons
                name="person-circle-outline"
                size={18}
                color="#065F46"
              />
              <Text className="text-xs font-medium text-text-muted uppercase tracking-widest">
                {t("detail.about")}
              </Text>
            </View>
            <Text
              className="text-base text-text-secondary leading-6"
              numberOfLines={bioExpanded || !isBioLong ? undefined : 3}
            >
              {bio}
            </Text>
            {isBioLong ? (
              <TouchableOpacity
                onPress={() => setBioExpanded(!bioExpanded)}
                className="mt-2"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-semibold text-primary">
                  {bioExpanded ? t("detail.readLess") : t("detail.readMore")}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {/* ── Work Gallery ── */}
        <GalleryView images={technician.gallery || []} />

        {/* ── Contact Info ── */}
        <View className="bg-surface mx-4 mt-3 rounded-2xl p-5 shadow-sm">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="call-outline" size={18} color="#065F46" />
            <Text className="text-xs font-medium text-text-muted uppercase tracking-widest">
              {t("detail.contactInfo")}
            </Text>
          </View>

          <TouchableOpacity
            className="flex-row items-center py-2.5"
            onPress={() =>
              Linking.openURL(
                `geo:0,0?q=${encodeURIComponent(technician.location + ", Cameroon")}`,
              ).catch(() => {})
            }
            activeOpacity={0.7}
          >
            <View className="w-11 h-11 rounded-xl items-center justify-center mr-4 bg-primary-muted">
              <Ionicons name="location" size={20} color="#065F46" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium text-text-muted mb-0.5">
                {t("detail.location")}
              </Text>
              <Text className="text-base font-medium text-text">
                {technician.location}, {t("common.cameroon")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          <View className="h-px bg-border-light my-2" />

          <TouchableOpacity
            className="flex-row items-center py-2.5"
            onPress={user ? handleCall : () => promptSignIn()}
            activeOpacity={0.7}
          >
            <View className="w-11 h-11 rounded-xl items-center justify-center mr-4 bg-success-light">
              <Ionicons
                name={user ? "call" : "lock-closed"}
                size={20}
                color={user ? "#059669" : "#94A3B8"}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium text-text-muted mb-0.5">
                {t("detail.phoneNumber")}
              </Text>
              {user ? (
                <Text className="text-base font-medium text-text">
                  {technician.phone}
                </Text>
              ) : (
                <Text className="text-sm font-medium text-text-muted">
                  {t("detail.signInToSeePhone")}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* ── Share + Favorite Row ── */}
        <View className="flex-row mx-4 mt-3 gap-3">
          <TouchableOpacity
            className="flex-1 bg-surface rounded-xl py-3.5 flex-row items-center justify-center gap-2 shadow-sm"
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={20} color="#065F46" />
            <Text className="text-sm font-semibold text-primary">
              {t("detail.share")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 rounded-xl py-3.5 flex-row items-center justify-center gap-2 shadow-sm ${
              isFav ? "bg-danger-light" : "bg-surface"
            }`}
            onPress={handleToggleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={20}
              color={isFav ? "#DC2626" : "#94A3B8"}
            />
            <Text
              className={`text-sm font-semibold ${isFav ? "text-danger" : "text-text-muted"}`}
            >
              {isFav
                ? t("detail.removeFromFavorites")
                : t("detail.addToFavorites")}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      {/* ── Sticky Bottom CTA Bar ── */}
      <View
        className="bg-surface border-t px-4 flex-row gap-3"
        style={{
          borderColor: "#F1F5F9",
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          ...Platform.select({
            ios: {
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
            },
            android: { elevation: 8 },
          }),
        }}
      >
        <TouchableOpacity
          className="flex-1 rounded-xl py-3.5 flex-row items-center justify-center gap-2"
          style={{ backgroundColor: user ? "#059669" : "#94A3B8" }}
          onPress={user ? handleCall : () => promptSignIn()}
          activeOpacity={0.8}
        >
          <Ionicons
            name={user ? "call" : "lock-closed"}
            size={20}
            color="#FFFFFF"
          />
          <Text className="text-base font-semibold text-white">
            {user
              ? t("detail.call", { name: technician.name.split(" ")[0] })
              : t("detail.signInToCall")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 rounded-xl py-3.5 flex-row items-center justify-center gap-2"
          style={{ backgroundColor: user ? "#25D366" : "#94A3B8" }}
          onPress={user ? handleWhatsApp : () => promptSignIn()}
          activeOpacity={0.8}
        >
          <Ionicons
            name={user ? "logo-whatsapp" : "lock-closed"}
            size={20}
            color="#FFFFFF"
          />
          <Text className="text-base font-semibold text-white">
            {user ? "WhatsApp" : t("detail.signInToWhatsApp")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fullscreen Avatar Modal */}
      {technician.avatar ? (
        <Modal
          visible={showAvatarModal}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setShowAvatarModal(false)}
        >
          <TouchableOpacity
            className="flex-1 items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
            activeOpacity={1}
            onPress={() => setShowAvatarModal(false)}
          >
            {/* Close button */}
            <TouchableOpacity
              className="absolute right-5 w-10 h-10 rounded-full items-center justify-center"
              style={{
                top: insets.top + 10,
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
              onPress={() => setShowAvatarModal(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Large avatar */}
            <Image
              source={{ uri: technician.avatar }}
              style={{
                width: SCREEN_WIDTH - 48,
                height: SCREEN_WIDTH - 48,
                borderRadius: (SCREEN_WIDTH - 48) / 2,
              }}
              resizeMode="cover"
            />

            {/* Name label */}
            <Text className="text-white text-lg font-semibold mt-5">
              {technician.name}
            </Text>
          </TouchableOpacity>
        </Modal>
      ) : null}
    </View>
  );
}
