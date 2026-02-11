import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Animated,
  Platform,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useAuth } from "../../src/contexts/AuthContext";
import { changeLanguage, supportedLanguages } from "../../src/i18n";
import i18next from "i18next";
import {
  Skill,
  Availability,
  SKILLS,
  LOCATIONS,
  AVAILABILITY_OPTIONS,
} from "../../src/types";
import {
  getTechnician,
  createTechnician,
  createUserProfile,
  getUserProfile,
  uploadGalleryImage,
  updateTechnician,
  updateUserProfile,
  deleteTechnician,
  getGalleryImageUrl,
} from "../../src/services/appwrite";
import {
  InputField,
  SelectField,
  MultiSelectField,
  GalleryPicker,
} from "../../src/components";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  // Technician status
  const [isTechnician, setIsTechnician] = useState<boolean | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [techDocId, setTechDocId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [existingGalleryIds, setExistingGalleryIds] = useState<string[]>([]);
  const [profileDocId, setProfileDocId] = useState<string | null>(null);
  const [currentAvailability, setCurrentAvailability] =
    useState<Availability>("available");
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string>("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Registration form state
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experienceYears, setExperienceYears] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(
    "available",
  );
  const [bio, setBio] = useState("");
  const [bioFr, setBioFr] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [registering, setRegistering] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showAvatarFullscreen, setShowAvatarFullscreen] = useState(false);

  // Scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_HEIGHT = 220;
  const MINI_HEADER_THRESHOLD = HEADER_HEIGHT - 60;

  const miniHeaderOpacity = scrollY.interpolate({
    inputRange: [MINI_HEADER_THRESHOLD - 30, MINI_HEADER_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true },
  );

  // Check if user is already a technician
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        setCheckingStatus(true);
        const [tech, profile] = await Promise.all([
          getTechnician(user.$id),
          getUserProfile(user.$id),
        ]);
        if (!cancelled) {
          setIsTechnician(!!tech);
          setTechDocId(tech?.$id ?? null);
          setProfileDocId(profile?.$id ?? null);
          if (tech?.availability) {
            setCurrentAvailability(tech.availability);
          }
          if (profile?.avatar) {
            setCurrentAvatar(profile.avatar);
          }
        }
      } catch {
        if (!cancelled) setIsTechnician(false);
      } finally {
        if (!cancelled) setCheckingStatus(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSignOut = () => {
    Alert.alert(t("profile.signOutTitle"), t("profile.signOutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.signOut"),
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            // Navigation is handled by RootNavigator's auth guard
          } catch {
            Alert.alert(t("common.error"), t("profile.signOutFailed"));
          }
        },
      },
    ]);
  };

  const handleQuickAvailability = async (newStatus: Availability) => {
    if (!techDocId || newStatus === currentAvailability) return;
    setUpdatingAvailability(true);
    try {
      await updateTechnician(techDocId, { availability: newStatus });
      setCurrentAvailability(newStatus);
    } catch {
      Alert.alert(t("common.error"), t("profile.availabilityFailed"));
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const pickAvatarFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("gallery.permissionRequired"),
        t("gallery.cameraPermission"),
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      await uploadAndSaveAvatar(result.assets[0].uri);
    }
  };

  const pickAvatarFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("gallery.permissionRequired"),
        t("gallery.libraryPermission"),
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      await uploadAndSaveAvatar(result.assets[0].uri);
    }
  };

  const uploadAndSaveAvatar = async (uri: string) => {
    if (!profileDocId) return;
    setShowAvatarPicker(false);
    try {
      const fileName = `avatar_${Date.now()}.jpg`;
      const fileId = await uploadGalleryImage({
        name: fileName,
        type: "image/jpeg",
        size: 0,
        uri,
      });
      const avatarUrl = getGalleryImageUrl(fileId);
      await updateUserProfile(profileDocId, { avatar: avatarUrl });
      setCurrentAvatar(avatarUrl);
    } catch {
      Alert.alert(t("common.error"), t("profile.avatarFailed"));
    }
  };

  const handleDeleteTechnicianProfile = () => {
    Alert.alert(t("profile.deleteTechTitle"), t("profile.deleteTechMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          if (!techDocId) return;
          try {
            await deleteTechnician(techDocId);
            setIsTechnician(false);
            setTechDocId(null);
            setShowRegistration(false);
            setIsEditing(false);
            Alert.alert(
              t("profile.deleteTechSuccess"),
              t("profile.deleteTechSuccessMsg"),
            );
          } catch {
            Alert.alert(t("common.error"), t("profile.deleteTechFailed"));
          }
        },
      },
    ]);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!phone.trim() || phone.trim().length < 8) {
      errors.phone = t("validation.phoneRequired");
    }
    if (!location) {
      errors.location = t("validation.selectLocation");
    }
    if (skills.length === 0) {
      errors.skills = t("validation.selectSkill");
    }
    const years = parseInt(experienceYears, 10);
    if (!experienceYears.trim() || isNaN(years) || years < 0 || years > 50) {
      errors.experienceYears = t("validation.experienceRequired");
    }
    const rate = parseInt(hourlyRate, 10);
    if (!hourlyRate.trim() || isNaN(rate) || rate < 500 || rate > 100000) {
      errors.hourlyRate = t("validation.rateRequired");
    }
    if (!availability) {
      errors.availability = t("validation.selectAvailability");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStartEdit = async () => {
    if (!user) return;
    try {
      const [tech, profile] = await Promise.all([
        getTechnician(user.$id),
        getUserProfile(user.$id),
      ]);
      if (tech) {
        setSkills(tech.skills || []);
        setExperienceYears(String(tech.experienceYears || ""));
        setHourlyRate(String(tech.hourlyRate || ""));
        setAvailability(tech.availability || "available");
        setBio(tech.bio || "");
        setBioFr(tech.bioFr || "");
        setExistingGalleryIds(tech.gallery || []);
        // Convert existing gallery file IDs to viewable URLs for GalleryPicker
        setGalleryImages(
          (tech.gallery || []).map((id: string) => getGalleryImageUrl(id)),
        );
      }
      if (profile) {
        setPhone(profile.phone || "");
        setLocation(profile.location || null);
        setProfileDocId(profile.$id);
      }
      setIsEditing(true);
      setShowRegistration(true);
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error?.message || "Failed to load profile",
      );
    }
  };

  const handleUpdate = async () => {
    if (!user || !techDocId) return;
    if (!validateForm()) return;

    setRegistering(true);
    try {
      // 1. Update UserProfile if we have the doc ID
      if (profileDocId) {
        await updateUserProfile(profileDocId, {
          phone: phone.trim(),
          location: location!,
        });
      }

      // 2. Figure out new vs existing gallery images
      const newGalleryFileIds: string[] = [];
      for (const uri of galleryImages) {
        // If it's an Appwrite URL, extract the existing file ID
        const existingMatch = uri.match(/\/files\/([a-zA-Z0-9]+)\/view/);
        if (existingMatch) {
          newGalleryFileIds.push(existingMatch[1]);
        } else {
          // It's a new local image — upload it
          const filename = uri.split("/").pop() || `photo_${Date.now()}.jpg`;
          const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
          const mimeType = ext === "png" ? "image/png" : "image/jpeg";
          const fileId = await uploadGalleryImage({
            name: filename,
            type: mimeType,
            size: 0,
            uri,
          });
          newGalleryFileIds.push(fileId);
        }
      }

      // 3. Update the technician document
      await updateTechnician(techDocId, {
        skills,
        experienceYears: parseInt(experienceYears, 10),
        bio: bio.trim(),
        bioFr: bioFr.trim(),
        hourlyRate: parseInt(hourlyRate, 10),
        availability: availability!,
        gallery: newGalleryFileIds,
      });

      setShowRegistration(false);
      setIsEditing(false);

      Alert.alert(t("profile.updateSuccess"), t("profile.updateSuccessMsg"));
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error?.message || t("profile.updateFailed"),
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleRegister = async () => {
    if (!user) return;
    if (!validateForm()) return;

    setRegistering(true);
    try {
      // 1. Ensure a UserProfile document exists
      let profile = await getUserProfile(user.$id);
      if (!profile) {
        profile = await createUserProfile({
          userId: user.$id,
          name: user.name || "User",
          phone: phone.trim(),
          location: location!,
          role: "technician",
        });
      } else {
        // If profile exists but role is "user", we don't update role here
        // because updateUserProfile needs the document ID — it already exists
      }

      // 2. Upload gallery images to Appwrite Storage
      const galleryFileIds: string[] = [];
      for (const uri of galleryImages) {
        const filename = uri.split("/").pop() || `photo_${Date.now()}.jpg`;
        const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
        const mimeType = ext === "png" ? "image/png" : "image/jpeg";
        const fileId = await uploadGalleryImage({
          name: filename,
          type: mimeType,
          size: 0,
          uri,
        });
        galleryFileIds.push(fileId);
      }

      // 3. Create the technician document
      const newTech = await createTechnician({
        userId: user.$id,
        skills,
        experienceYears: parseInt(experienceYears, 10),
        bio: bio.trim(),
        bioFr: bioFr.trim(),
        hourlyRate: parseInt(hourlyRate, 10),
        availability: availability!,
        gallery: galleryFileIds,
      });

      setTechDocId(newTech.$id);
      setProfileDocId(profile.$id);
      setIsTechnician(true);
      setShowRegistration(false);

      Alert.alert(
        t("profile.registrationSuccess"),
        t("profile.registrationSuccessMsg"),
      );
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error?.message || t("profile.registrationFailed"),
      );
    } finally {
      setRegistering(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const memberSince = user?.$createdAt
    ? new Date(user.$createdAt).toLocaleDateString(
        i18next.language === "fr" ? "fr-FR" : "en-US",
        { month: "long", year: "numeric" },
      )
    : "";

  return (
    <View className="flex-1" style={{ backgroundColor: "#F8FAFC" }}>
      {/* ── Mini Header (on scroll) ── */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          opacity: miniHeaderOpacity,
          paddingTop: insets.top + 8,
          paddingBottom: 12,
        }}
      >
        <LinearGradient
          colors={["#022C22", "#065F46"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <View className="flex-row items-center justify-center px-6 gap-3">
          {currentAvatar ? (
            <Image
              source={{ uri: currentAvatar }}
              className="w-8 h-8 rounded-full"
              style={{ borderWidth: 1.5, borderColor: "rgba(255,255,255,0.4)" }}
            />
          ) : (
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Ionicons name="person" size={14} color="rgba(255,255,255,0.8)" />
            </View>
          )}
          <Text className="text-base font-bold text-white" numberOfLines={1}>
            {user?.name || t("profile.guest")}
          </Text>
        </View>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* ── Gradient Header ── */}
        <LinearGradient
          colors={["#022C22", "#065F46", "#047857"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 24, paddingBottom: 40 }}
          className="px-6 items-center"
        >
          {/* Decorative circles */}
          <View
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: 10,
              left: -30,
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 60,
              left: 50,
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "rgba(255,255,255,0.02)",
            }}
          />
          {/* Avatar */}
          <TouchableOpacity
            className="relative mb-4"
            onPress={() => {
              if (currentAvatar) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAvatarFullscreen(true);
              } else if (profileDocId) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAvatarPicker(true);
              }
            }}
            activeOpacity={0.8}
          >
            <View
              style={{
                borderWidth: 3,
                borderColor: "rgba(255,255,255,0.3)",
                borderRadius: 60,
                padding: 3,
              }}
            >
              {currentAvatar ? (
                <Image
                  source={{ uri: currentAvatar }}
                  className="w-24 h-24 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                />
              ) : (
                <View
                  className="w-24 h-24 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                >
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "700",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {initials}
                  </Text>
                </View>
              )}
            </View>
            {profileDocId && (
              <View
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white items-center justify-center shadow-md"
                style={{ borderWidth: 2, borderColor: "#065F46" }}
              >
                <Ionicons name="camera" size={15} color="#065F46" />
              </View>
            )}
          </TouchableOpacity>

          {/* Name */}
          <Text className="text-2xl font-bold text-white">
            {user?.name || t("profile.guest")}
          </Text>

          {/* Email */}
          <Text
            className="text-sm mt-1 mb-3"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            {user?.email || ""}
          </Text>

          {/* Badges row */}
          <View className="flex-row items-center gap-2">
            {/* Account type badge */}
            <View
              className="flex-row items-center px-3 py-1.5 rounded-full gap-1.5"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Ionicons
                name={isTechnician ? "construct" : "person"}
                size={12}
                color="rgba(255,255,255,0.9)"
              />
              <Text
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {isTechnician
                  ? t("profile.accountTypeTechnician")
                  : t("profile.accountTypeUser")}
              </Text>
            </View>

            {/* Member since badge */}
            {memberSince ? (
              <View
                className="flex-row items-center px-3 py-1.5 rounded-full gap-1.5"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color="rgba(255,255,255,0.7)"
                />
                <Text
                  className="text-xs font-medium"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {t("profile.memberSince", { date: memberSince })}
                </Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        {/* ── Body ── */}
        <View
          style={{
            backgroundColor: "#F8FAFC",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            marginTop: -20,
            paddingTop: 28,
          }}
        >
          {/* Account Section */}
          <View className="flex-row items-center px-6 mb-3 gap-2">
            <Ionicons name="person-circle-outline" size={16} color="#94A3B8" />
            <Text className="text-xs font-bold text-text-muted uppercase tracking-wider">
              {t("profile.account")}
            </Text>
          </View>
          <View
            className="bg-surface mx-4 rounded-2xl overflow-hidden"
            style={{
              borderWidth: 1,
              borderColor: "#E2E8F0",
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                },
                android: { elevation: 2 },
              }),
            }}
          >
            <ProfileRow
              icon="person-outline"
              label={t("profile.name")}
              value={user?.name || "—"}
              iconBg="#D1FAE5"
              iconColor="#065F46"
            />
            <View className="h-px bg-border mx-4" />
            <ProfileRow
              icon="mail-outline"
              label={t("profile.email")}
              value={user?.email || "—"}
              iconBg="#DBEAFE"
              iconColor="#1D4ED8"
            />
          </View>

          {/* Technician Section */}
          <View className="flex-row items-center px-6 mb-3 mt-8 gap-2">
            <Ionicons name="construct-outline" size={16} color="#94A3B8" />
            <Text className="text-xs font-bold text-text-muted uppercase tracking-wider">
              {t("profile.technicianSection")}
            </Text>
          </View>

          {checkingStatus ? (
            <View
              key="checking"
              className="bg-surface mx-4 rounded-2xl p-6 items-center"
              style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
            >
              <ActivityIndicator size="small" color="#065F46" />
            </View>
          ) : isTechnician && !showRegistration ? (
            /* Already a technician */
            <View
              key="is-technician"
              className="bg-surface mx-4 rounded-2xl overflow-hidden"
              style={{
                borderWidth: 1,
                borderColor: "#E2E8F0",
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                  },
                  android: { elevation: 2 },
                }),
              }}
            >
              {/* Gradient accent strip */}
              <LinearGradient
                colors={["#065F46", "#059669", "#10B981"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 4 }}
              />
              <View className="p-5">
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#059669"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-text">
                      {t("profile.alreadyTechnician")}
                    </Text>
                    <Text className="text-xs text-text-secondary mt-0.5">
                      {t("profile.technicianBadgeDesc")}
                    </Text>
                  </View>
                </View>

                {/* Quick Availability Toggle */}
                <View className="mb-4">
                  <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    {t("profile.quickAvailability")}
                  </Text>
                  <View className="flex-row gap-2">
                    {AVAILABILITY_OPTIONS.map((status) => {
                      const isActive = currentAvailability === status;
                      const colorMap: Record<
                        Availability,
                        {
                          bg: string;
                          activeBg: string;
                          text: string;
                          activeText: string;
                          icon: string;
                        }
                      > = {
                        available: {
                          bg: "#F0FDF4",
                          activeBg: "#059669",
                          text: "#059669",
                          activeText: "#FFFFFF",
                          icon: "checkmark-circle",
                        },
                        busy: {
                          bg: "#FFF7ED",
                          activeBg: "#D97706",
                          text: "#D97706",
                          activeText: "#FFFFFF",
                          icon: "time",
                        },
                        offline: {
                          bg: "#F1F5F9",
                          activeBg: "#64748B",
                          text: "#64748B",
                          activeText: "#FFFFFF",
                          icon: "moon",
                        },
                      };
                      const c = colorMap[status];
                      return (
                        <TouchableOpacity
                          key={status}
                          className="flex-1 flex-row items-center justify-center rounded-xl py-2.5 gap-1.5"
                          style={{
                            backgroundColor: isActive ? c.activeBg : c.bg,
                            borderWidth: isActive ? 0 : 1,
                            borderColor: isActive ? "transparent" : c.bg,
                            opacity: updatingAvailability ? 0.6 : 1,
                          }}
                          onPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light,
                            );
                            handleQuickAvailability(status);
                          }}
                          disabled={updatingAvailability}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={c.icon as any}
                            size={14}
                            color={isActive ? c.activeText : c.text}
                          />
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: isActive ? c.activeText : c.text }}
                          >
                            {t(`availability.${status}`)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {techDocId && (
                  <View style={{ gap: 10 }}>
                    <TouchableOpacity
                      className="flex-row items-center justify-center bg-primary rounded-xl py-3 gap-2 shadow-sm"
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push(`/technician/${techDocId}`);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
                      <Text className="text-sm font-semibold text-surface">
                        {t("profile.viewMyProfile")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-row items-center justify-center rounded-xl py-3 gap-2"
                      style={{ borderWidth: 1.5, borderColor: "#065F46" }}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        handleStartEdit();
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color="#065F46"
                      />
                      <Text className="text-sm font-semibold text-primary">
                        {t("profile.editMyProfile")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-row items-center justify-center rounded-xl py-3 gap-2"
                      style={{ backgroundColor: "#FEE2E2" }}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        handleDeleteTechnicianProfile();
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#DC2626"
                      />
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: "#DC2626" }}
                      >
                        {t("profile.deleteTechProfile")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ) : showRegistration ? (
            /* Registration Form */
            <View key="registration" className="mx-4">
              <View
                className="bg-surface rounded-2xl p-5 mb-3"
                style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
              >
                <View className="items-center mb-4">
                  <View className="w-14 h-14 rounded-full bg-primary-muted items-center justify-center mb-3">
                    <Ionicons name="construct" size={26} color="#065F46" />
                  </View>
                  <Text className="text-lg font-semibold text-text">
                    {isEditing
                      ? t("profile.editTechnicianProfile")
                      : t("profile.technicianRegistration")}
                  </Text>
                  <Text className="text-sm text-text-secondary text-center mt-1">
                    {isEditing
                      ? t("profile.editTechnicianProfileDesc")
                      : t("profile.technicianRegistrationDesc")}
                  </Text>
                </View>

                {/* Phone */}
                <InputField
                  label={t("profile.phoneNumber")}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t("profile.phonePlaceholder")}
                  keyboardType="phone-pad"
                  error={formErrors.phone}
                />

                {/* Location */}
                <SelectField
                  label={t("profile.location")}
                  value={location}
                  options={LOCATIONS}
                  onSelect={setLocation}
                  placeholder={t("profile.selectCity")}
                  error={formErrors.location}
                />

                {/* Skills */}
                <MultiSelectField
                  label={t("profile.skillTrade")}
                  selectedValues={skills}
                  options={SKILLS}
                  onSelectionChange={setSkills}
                  displayLabel={(s) => t(`skills.${s}`)}
                  placeholder={t("profile.selectSkill")}
                  error={formErrors.skills}
                  max={3}
                />

                {/* Experience */}
                <InputField
                  label={t("profile.yearsOfExperience")}
                  value={experienceYears}
                  onChangeText={setExperienceYears}
                  placeholder={t("profile.yearsPlaceholder")}
                  keyboardType="numeric"
                  error={formErrors.experienceYears}
                />

                {/* Hourly Rate */}
                <InputField
                  label={t("profile.hourlyRate")}
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  placeholder={t("profile.ratePlaceholder")}
                  keyboardType="numeric"
                  error={formErrors.hourlyRate}
                />

                {/* Availability */}
                <SelectField
                  label={t("profile.availability")}
                  value={
                    availability ? t(`availability.${availability}`) : null
                  }
                  options={AVAILABILITY_OPTIONS.map((a) =>
                    t(`availability.${a}`),
                  )}
                  onSelect={(val) => {
                    const match = AVAILABILITY_OPTIONS.find(
                      (a) => t(`availability.${a}`) === val,
                    );
                    setAvailability(match || null);
                  }}
                  placeholder={t("profile.selectAvailability")}
                  error={formErrors.availability}
                />

                {/* Bio (English) */}
                <InputField
                  label={t("profile.bio")}
                  value={bio}
                  onChangeText={setBio}
                  placeholder={t("profile.bioPlaceholder")}
                  multiline
                />

                {/* Bio (French) */}
                <InputField
                  label={t("profile.bioFr")}
                  value={bioFr}
                  onChangeText={setBioFr}
                  placeholder={t("profile.bioFrPlaceholder")}
                  multiline
                />

                {/* Gallery */}
                <GalleryPicker
                  images={galleryImages}
                  onChange={setGalleryImages}
                />
              </View>

              {/* Action buttons */}
              <TouchableOpacity
                className={`bg-primary rounded-xl py-4 flex-row items-center justify-center gap-2 shadow-md ${
                  registering ? "opacity-60" : ""
                }`}
                onPress={isEditing ? handleUpdate : handleRegister}
                disabled={registering}
                activeOpacity={0.8}
              >
                {registering ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name={isEditing ? "save" : "checkmark-circle"}
                    size={22}
                    color="#FFFFFF"
                  />
                )}
                <Text className="text-base font-medium text-surface">
                  {registering
                    ? t("profile.saving")
                    : isEditing
                      ? t("profile.saveChanges")
                      : t("profile.completeRegistration")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3 items-center mt-1"
                onPress={() => {
                  setShowRegistration(false);
                  setIsEditing(false);
                  setFormErrors({});
                }}
                activeOpacity={0.7}
              >
                <Text className="text-base font-medium text-text-secondary">
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Not a technician — CTA to register */
            <View
              key="cta"
              className="bg-surface mx-4 rounded-2xl p-5"
              style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
            >
              <View className="flex-row items-start gap-3 mb-4">
                <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center mt-0.5">
                  <Ionicons
                    name="construct-outline"
                    size={20}
                    color="#D97706"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-text mb-1">
                    {t("profile.becomeTechnician")}
                  </Text>
                  <Text className="text-sm text-text-secondary leading-5">
                    {t("profile.becomeTechnicianDesc")}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="flex-row items-center justify-center bg-primary rounded-xl py-3.5 gap-2"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowRegistration(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="arrow-forward-circle"
                  size={20}
                  color="#FFFFFF"
                />
                <Text className="text-sm font-semibold text-surface">
                  {t("profile.registerNow")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Language Switcher */}
          <View className="flex-row items-center px-6 mb-3 mt-8 gap-2">
            <Ionicons name="globe-outline" size={16} color="#94A3B8" />
            <Text className="text-xs font-bold text-text-muted uppercase tracking-wider">
              {t("profile.language")}
            </Text>
          </View>
          <View
            className="bg-surface mx-4 rounded-2xl p-1.5 flex-row"
            style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
          >
            {supportedLanguages.map((lang) => {
              const isActive = t("profile.currentLanguage") === lang.label;
              return (
                <TouchableOpacity
                  key={lang.code}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
                  style={{
                    backgroundColor: isActive ? "#065F46" : "transparent",
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    changeLanguage(lang.code);
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-lg">{lang.flag}</Text>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: isActive ? "#FFFFFF" : "#64748B" }}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* App Section */}
          <View className="flex-row items-center px-6 mb-3 mt-8 gap-2">
            <Ionicons name="apps-outline" size={16} color="#94A3B8" />
            <Text className="text-xs font-bold text-text-muted uppercase tracking-wider">
              {t("profile.app")}
            </Text>
          </View>
          <View
            className="bg-surface mx-4 rounded-2xl overflow-hidden"
            style={{
              borderWidth: 1,
              borderColor: "#E2E8F0",
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                },
                android: { elevation: 2 },
              }),
            }}
          >
            <ProfileRow
              icon="information-circle-outline"
              label={t("profile.version")}
              value="1.0.0"
              iconBg="#F0FDF4"
              iconColor="#059669"
            />
            <View className="h-px bg-border mx-4" />
            <ProfileRow
              icon="logo-react"
              label={t("profile.framework")}
              value="React Native"
              iconBg="#EFF6FF"
              iconColor="#3B82F6"
            />
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleSignOut();
            }}
            activeOpacity={0.85}
            className="mx-4 mt-8"
          >
            <View
              className="flex-row items-center justify-center rounded-2xl py-4 gap-2"
              style={{
                backgroundColor: "#FEE2E2",
                borderWidth: 1,
                borderColor: "#FECACA",
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              <Text
                className="text-base font-semibold"
                style={{ color: "#DC2626" }}
              >
                {t("auth.signOut")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      {/* Avatar Picker Modal */}
      <Modal
        visible={showAvatarPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvatarPicker(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPress={() => setShowAvatarPicker(false)}
        >
          <View className="bg-surface rounded-t-3xl px-6 pt-5 pb-10">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-text">
                {t("profile.changeAvatar")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowAvatarPicker(false)}
                className="w-8 h-8 rounded-full bg-background items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="flex-row items-center py-4 border-b"
              style={{ borderColor: "#F1F5F9" }}
              onPress={pickAvatarFromCamera}
              activeOpacity={0.7}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: "#D1FAE5" }}
              >
                <Ionicons name="camera" size={24} color="#065F46" />
              </View>
              <Text className="text-base font-medium text-text">
                {t("gallery.takePhoto")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-4"
              onPress={pickAvatarFromGallery}
              activeOpacity={0.7}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: "#DBEAFE" }}
              >
                <Ionicons name="images" size={24} color="#1D4ED8" />
              </View>
              <Text className="text-base font-medium text-text">
                {t("gallery.chooseFromLibrary")}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Avatar Fullscreen Modal */}
      <Modal
        visible={showAvatarFullscreen}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarFullscreen(false)}
      >
        <TouchableOpacity
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          activeOpacity={1}
          onPress={() => setShowAvatarFullscreen(false)}
        >
          <TouchableOpacity
            style={{ position: "absolute", top: insets.top + 16, right: 20 }}
            onPress={() => setShowAvatarFullscreen(false)}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center bg-white/20">
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          {currentAvatar ? (
            <Image
              source={{ uri: currentAvatar }}
              style={{
                width: Dimensions.get("window").width - 48,
                height: Dimensions.get("window").width - 48,
                borderRadius: 20,
              }}
              resizeMode="cover"
            />
          ) : null}
          <TouchableOpacity
            className="mt-6 flex-row items-center gap-2 px-5 py-3 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            onPress={() => {
              setShowAvatarFullscreen(false);
              setShowAvatarPicker(true);
            }}
          >
            <Ionicons name="camera" size={18} color="#FFFFFF" />
            <Text className="text-sm font-semibold text-white">
              {t("profile.changeAvatar")}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function ProfileRow({
  icon,
  label,
  value,
  iconBg = "#D1FAE5",
  iconColor = "#065F46",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <View className="flex-row items-center px-4 py-4">
      <View
        className="w-9 h-9 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-text-muted">{label}</Text>
        <Text className="text-sm font-medium text-text mt-0.5">{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </View>
  );
}
