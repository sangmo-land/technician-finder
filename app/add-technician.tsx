import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  Skill,
  Availability,
  TechnicianFormData,
  SKILLS,
  LOCATIONS,
  AVAILABILITY_OPTIONS,
} from "../src/types";
import { addTechnician } from "../src/services/storage";
import { InputField, SelectField } from "../src/components";

interface FormErrors {
  name?: string;
  skill?: string;
  phone?: string;
  location?: string;
  experienceYears?: string;
  hourlyRate?: string;
  availability?: string;
}

export default function AddTechnicianScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [skill, setSkill] = useState<Skill | null>(null);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(
    "available",
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = t("validation.nameRequired");
    } else if (name.trim().length < 2) {
      newErrors.name = t("validation.nameMinLength");
    }

    if (!skill) {
      newErrors.skill = t("validation.selectSkill");
    }

    if (!phone.trim()) {
      newErrors.phone = t("validation.phoneRequired");
    } else if (phone.trim().length < 8) {
      newErrors.phone = t("validation.phoneInvalid");
    }

    if (!location) {
      newErrors.location = t("validation.selectLocation");
    }

    const years = parseInt(experienceYears, 10);
    if (!experienceYears.trim()) {
      newErrors.experienceYears = t("validation.experienceRequired");
    } else if (isNaN(years) || years < 0 || years > 50) {
      newErrors.experienceYears = t("validation.experienceInvalid");
    }

    const rate = parseInt(hourlyRate, 10);
    if (!hourlyRate.trim()) {
      newErrors.hourlyRate = t("validation.rateRequired");
    } else if (isNaN(rate) || rate < 500 || rate > 100000) {
      newErrors.hourlyRate = t("validation.rateInvalid");
    }

    if (!availability) {
      newErrors.availability = t("validation.selectAvailability");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const formData: TechnicianFormData = {
        name: name.trim(),
        skill: skill!,
        phone: phone.trim(),
        location: location!,
        experienceYears: parseInt(experienceYears, 10),
        bio: bio.trim(),
        hourlyRate: parseInt(hourlyRate, 10),
        availability: availability!,
      };

      await addTechnician(formData);
      router.back();
    } catch (error) {
      Alert.alert(t("common.error"), t("form.addFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Form Header */}
        <View className="items-center mb-6">
          <View className="w-[72px] h-[72px] rounded-full bg-primary-muted items-center justify-center mb-4">
            <Ionicons name="person-add" size={32} color="#1E40AF" />
          </View>
          <Text className="text-2xl font-semibold text-text mb-1">
            {t("form.newTechnician")}
          </Text>
          <Text className="text-base text-text-secondary">
            {t("form.enterDetails")}
          </Text>
        </View>

        {/* Basic Info Card */}
        <View className="bg-surface rounded-2xl p-5 shadow-md mb-3">
          <Text className="text-xs font-medium text-text-muted uppercase mb-3 tracking-widest">
            {t("form.basicInfo")}
          </Text>
          <InputField
            label={t("form.fullName")}
            value={name}
            onChangeText={setName}
            placeholder={t("form.fullNamePlaceholder")}
            error={errors.name}
          />

          <SelectField
            label={t("form.skillTrade")}
            value={skill ? t(`skills.${skill}`) : null}
            options={SKILLS.map((s) => t(`skills.${s}`))}
            onSelect={(val) => {
              const match = SKILLS.find((s) => t(`skills.${s}`) === val);
              setSkill(match || null);
            }}
            placeholder={t("form.selectSkill")}
            error={errors.skill}
          />

          <InputField
            label={t("form.phoneNumber")}
            value={phone}
            onChangeText={setPhone}
            placeholder={t("form.phonePlaceholder")}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <SelectField
            label={t("form.locationLabel")}
            value={location}
            options={LOCATIONS}
            onSelect={setLocation}
            placeholder={t("form.selectCity")}
            error={errors.location}
          />
        </View>

        {/* Professional Details Card */}
        <View className="bg-surface rounded-2xl p-5 shadow-md mb-3">
          <Text className="text-xs font-medium text-text-muted uppercase mb-3 tracking-widest">
            {t("form.professionalDetails")}
          </Text>

          <InputField
            label={t("form.yearsOfExperience")}
            value={experienceYears}
            onChangeText={setExperienceYears}
            placeholder={t("form.yearsPlaceholder")}
            keyboardType="numeric"
            error={errors.experienceYears}
          />

          <InputField
            label={t("form.hourlyRate")}
            value={hourlyRate}
            onChangeText={setHourlyRate}
            placeholder={t("form.ratePlaceholder")}
            keyboardType="numeric"
            error={errors.hourlyRate}
          />

          <SelectField
            label={t("form.availabilityLabel")}
            value={availability ? t(`availability.${availability}`) : null}
            options={AVAILABILITY_OPTIONS.map((a) => t(`availability.${a}`))}
            onSelect={(val) => {
              const match = AVAILABILITY_OPTIONS.find((a) => t(`availability.${a}`) === val);
              setAvailability(match || null);
            }}
            placeholder={t("form.selectAvailability")}
            error={errors.availability}
          />

          <InputField
            label={t("form.bioLabel")}
            value={bio}
            onChangeText={setBio}
            placeholder={t("form.bioPlaceholder")}
            multiline
          />
        </View>

        {/* Actions */}
        <View className="mt-3 gap-3">
          <TouchableOpacity
            className={`bg-primary rounded-xl py-4 flex-row items-center justify-center gap-2 shadow-md ${
              loading ? "opacity-60" : ""
            }`}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text className="text-base font-medium text-surface">
              {loading ? t("form.adding") : t("screens.addTechnician")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 items-center"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text className="text-base font-medium text-text-secondary">
              {t("common.cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
