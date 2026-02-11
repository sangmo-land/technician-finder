import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../src/contexts/AuthContext";
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
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [registering, setRegistering] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
            router.replace("/(auth)/sign-in");
          } catch {
            Alert.alert(t("common.error"), t("profile.signOutFailed"));
          }
        },
      },
    ]);
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Account Section */}
        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider px-6 mb-3">
          {t("profile.account")}
        </Text>
        <View
          className="bg-surface mx-4 rounded-2xl"
          style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
        >
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

        {/* Technician Section */}
        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider px-6 mb-3 mt-8">
          {t("profile.technicianSection")}
        </Text>

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
            className="bg-surface mx-4 rounded-2xl p-5"
            style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
          >
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                <Ionicons name="checkmark-circle" size={22} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-text">
                  {t("profile.alreadyTechnician")}
                </Text>
              </View>
            </View>
            {techDocId && (
              <View style={{ gap: 10 }}>
                <TouchableOpacity
                  className="flex-row items-center justify-center bg-primary-muted rounded-xl py-3 gap-2"
                  onPress={() => router.push(`/technician/${techDocId}`)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="eye-outline" size={18} color="#065F46" />
                  <Text className="text-sm font-semibold text-primary">
                    {t("profile.viewMyProfile")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center justify-center rounded-xl py-3 gap-2"
                  style={{ borderWidth: 1.5, borderColor: "#065F46" }}
                  onPress={handleStartEdit}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={18} color="#065F46" />
                  <Text className="text-sm font-semibold text-primary">
                    {t("profile.editMyProfile")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center justify-center rounded-xl py-3 gap-2"
                  style={{ backgroundColor: "#FEE2E2" }}
                  onPress={handleDeleteTechnicianProfile}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color="#DC2626" />
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
                value={availability ? t(`availability.${availability}`) : null}
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

              {/* Bio */}
              <InputField
                label={t("profile.bio")}
                value={bio}
                onChangeText={setBio}
                placeholder={t("profile.bioPlaceholder")}
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
                <Ionicons name="construct-outline" size={20} color="#D97706" />
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
              onPress={() => setShowRegistration(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-forward-circle" size={20} color="#FFFFFF" />
              <Text className="text-sm font-semibold text-surface">
                {t("profile.registerNow")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* App Section */}
        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider px-6 mb-3 mt-8">
          {t("profile.app")}
        </Text>
        <View
          className="bg-surface mx-4 rounded-2xl"
          style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
        >
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
            <Text
              className="text-base font-semibold ml-2"
              style={{ color: "#DC2626" }}
            >
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
