import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";

const MAX_PHOTOS = 6;

interface GalleryPickerProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function GalleryPicker({ images, onChange }: GalleryPickerProps) {
  const { t } = useTranslation();

  const pickFromLibrary = async () => {
    if (images.length >= MAX_PHOTOS) {
      Alert.alert(t("gallery.title"), t("gallery.maxPhotos", { max: MAX_PHOTOS }));
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("gallery.permissionRequired"), t("gallery.libraryPermission"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - images.length,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uris = result.assets.map((a) => a.uri);
      onChange([...images, ...uris].slice(0, MAX_PHOTOS));
    }
  };

  const takePhoto = async () => {
    if (images.length >= MAX_PHOTOS) {
      Alert.alert(t("gallery.title"), t("gallery.maxPhotos", { max: MAX_PHOTOS }));
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("gallery.permissionRequired"), t("gallery.cameraPermission"));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      onChange([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    Alert.alert(t("gallery.removePhoto"), t("gallery.removePhotoMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          const updated = [...images];
          updated.splice(index, 1);
          onChange(updated);
        },
      },
    ]);
  };

  const showAddMenu = () => {
    Alert.alert(t("gallery.addPhotos"), undefined, [
      { text: t("gallery.takePhoto"), onPress: takePhoto },
      { text: t("gallery.chooseFromLibrary"), onPress: pickFromLibrary },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-medium text-text">
          {t("gallery.formTitle")}
        </Text>
        <Text className="text-xs text-text-muted">
          {images.length}/{MAX_PHOTOS}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingRight: 4 }}
      >
        {/* Add button */}
        {images.length < MAX_PHOTOS && (
          <TouchableOpacity
            className="w-24 h-24 rounded-xl bg-background border-2 border-dashed border-border items-center justify-center"
            onPress={showAddMenu}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={28} color="#94A3B8" />
            <Text className="text-xs text-text-muted mt-1">
              {t("gallery.addPhotos")}
            </Text>
          </TouchableOpacity>
        )}

        {/* Image previews */}
        {images.map((uri, index) => (
          <View key={uri} className="relative">
            <Image
              source={{ uri }}
              className="w-24 h-24 rounded-xl"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger items-center justify-center shadow-md"
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
