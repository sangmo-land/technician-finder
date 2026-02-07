import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface GalleryViewProps {
  images: string[];
}

export default function GalleryView({ images }: GalleryViewProps) {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openFullscreen = (index: number) => {
    setActiveIndex(index);
    setModalVisible(true);
  };

  return (
    <>
      <View className="bg-surface mx-4 mt-3 rounded-2xl p-5 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-medium text-text-muted uppercase tracking-widest">
            {t("gallery.title")}
          </Text>
          <Text className="text-xs text-text-muted">
            {t("gallery.photoCount", { count: images.length })}
          </Text>
        </View>

        {/* Thumbnail grid */}
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {images.map((uri, index) => (
            <TouchableOpacity
              key={uri}
              onPress={() => openFullscreen(index)}
              activeOpacity={0.8}
              style={{
                width: images.length === 1 ? "100%" : images.length === 2 ? "48%" : "31%",
                aspectRatio: images.length === 1 ? 16 / 9 : 1,
              }}
            >
              <Image
                source={{ uri }}
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fullscreen Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pt-14 pb-3">
            <Text className="text-white text-base font-medium">
              {activeIndex + 1} / {images.length}
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Swipeable images */}
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={activeIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setActiveIndex(newIndex);
            }}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View
                style={{ width: SCREEN_WIDTH }}
                className="flex-1 items-center justify-center"
              >
                <Image
                  source={{ uri: item }}
                  style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          {/* Dots */}
          {images.length > 1 && (
            <View className="flex-row items-center justify-center pb-12 gap-2">
              {images.map((_, index) => (
                <View
                  key={index}
                  className={`rounded-full ${
                    index === activeIndex
                      ? "w-2.5 h-2.5 bg-white"
                      : "w-2 h-2 bg-white/40"
                  }`}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}
