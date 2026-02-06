import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Skill,
  Availability,
  TechnicianFormData,
  SKILLS,
  LOCATIONS,
  AVAILABILITY_OPTIONS,
  Technician,
} from "../../src/types";
import {
  updateTechnician,
  getTechnicianById,
} from "../../src/services/storage";
import { skillColors } from "../../src/constants/colors";
import { InputField, SelectField, LoadingSpinner } from "../../src/components";

interface FormErrors {
  name?: string;
  skill?: string;
  phone?: string;
  location?: string;
  experienceYears?: string;
  hourlyRate?: string;
  availability?: string;
}

export default function EditTechnicianScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [technician, setTechnician] = useState<Technician | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [skill, setSkill] = useState<Skill | null>(null);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const loadTechnician = async () => {
      if (!id) return;
      try {
        const data = await getTechnicianById(id);
        if (data) {
          setTechnician(data);
          setName(data.name);
          setSkill(data.skill);
          setPhone(data.phone);
          setLocation(data.location);
          setExperienceYears(data.experienceYears.toString());
          setBio(data.bio || "");
          setHourlyRate(data.hourlyRate?.toString() || "");
          setAvailability(data.availability || "available");
        }
      } catch (error) {
        console.error("Error loading technician:", error);
      } finally {
        setPageLoading(false);
      }
    };

    loadTechnician();
  }, [id]);

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
    if (!validate() || !technician) {
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

      await updateTechnician(technician.id, formData);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update technician. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <LoadingSpinner />;
  }

  if (!technician) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-8">
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="text-xl font-semibold text-text mt-4 mb-5">
          Technician Not Found
        </Text>
        <TouchableOpacity
          className="bg-primary px-8 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-base font-medium text-surface">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const techSkillColor = skillColors[technician.skill] || "#6B7280";

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
          <View
            className="w-[72px] h-[72px] rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: techSkillColor + "20" }}
          >
            <Ionicons name="create" size={32} color={techSkillColor} />
          </View>
          <Text className="text-2xl font-semibold text-text mb-1">
            Edit Technician
          </Text>
          <Text className="text-base text-text-secondary">
            Update {technician.name.split(" ")[0]}'s information
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
            value={
              availability
                ? availability.charAt(0).toUpperCase() + availability.slice(1)
                : null
            }
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
              {loading ? "Saving..." : "Save Changes"}
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
