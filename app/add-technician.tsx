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
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!skill) {
      newErrors.skill = "Please select a skill";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (phone.trim().length < 8) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!location) {
      newErrors.location = "Please select a location";
    }

    const years = parseInt(experienceYears, 10);
    if (!experienceYears.trim()) {
      newErrors.experienceYears = "Experience is required";
    } else if (isNaN(years) || years < 0 || years > 50) {
      newErrors.experienceYears = "Enter a valid number (0-50)";
    }

    const rate = parseInt(hourlyRate, 10);
    if (!hourlyRate.trim()) {
      newErrors.hourlyRate = "Hourly rate is required";
    } else if (isNaN(rate) || rate < 500 || rate > 100000) {
      newErrors.hourlyRate = "Enter a valid rate (500-100,000 XAF)";
    }

    if (!availability) {
      newErrors.availability = "Please select availability";
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
      Alert.alert("Error", "Failed to add technician. Please try again.");
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
            New Technician
          </Text>
          <Text className="text-base text-text-secondary">
            Enter the technician's details below
          </Text>
        </View>

        {/* Basic Info Card */}
        <View className="bg-surface rounded-2xl p-5 shadow-md mb-3">
          <Text className="text-xs font-medium text-text-muted uppercase mb-3 tracking-widest">
            Basic Information
          </Text>
          <InputField
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Jean-Pierre Nkomo"
            error={errors.name}
          />

          <SelectField
            label="Skill / Trade"
            value={skill}
            options={SKILLS}
            onSelect={setSkill}
            placeholder="Select a skill"
            error={errors.skill}
          />

          <InputField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g., +237 6 70 12 34 56"
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <SelectField
            label="Location"
            value={location}
            options={LOCATIONS}
            onSelect={setLocation}
            placeholder="Select a city"
            error={errors.location}
          />
        </View>

        {/* Professional Details Card */}
        <View className="bg-surface rounded-2xl p-5 shadow-md mb-3">
          <Text className="text-xs font-medium text-text-muted uppercase mb-3 tracking-widest">
            Professional Details
          </Text>

          <InputField
            label="Years of Experience"
            value={experienceYears}
            onChangeText={setExperienceYears}
            placeholder="e.g., 5"
            keyboardType="numeric"
            error={errors.experienceYears}
          />

          <InputField
            label="Hourly Rate (XAF)"
            value={hourlyRate}
            onChangeText={setHourlyRate}
            placeholder="e.g., 5000"
            keyboardType="numeric"
            error={errors.hourlyRate}
          />

          <SelectField
            label="Availability"
            value={availability}
            options={AVAILABILITY_OPTIONS.map(
              (a) => a.charAt(0).toUpperCase() + a.slice(1),
            )}
            onSelect={(val) =>
              setAvailability(val ? (val.toLowerCase() as Availability) : null)
            }
            placeholder="Select availability"
            error={errors.availability}
          />

          <InputField
            label="Bio / Description (Optional)"
            value={bio}
            onChangeText={setBio}
            placeholder="Describe specialties, certifications, approach..."
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
              {loading ? "Adding..." : "Add Technician"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 items-center"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text className="text-base font-medium text-text-secondary">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
