import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";
import { TechnicianWithProfile } from "../../src/types";
import { getFavoriteTechnicians } from "../../src/services/storage";
import { TechnicianCard, EmptyState } from "../../src/components";
import { SkeletonList } from "../../src/components/SkeletonCard";

export default function FavoritesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<TechnicianWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      const data = await getFavoriteTechnicians();
      setFavorites(data);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const keyExtractor = useCallback(
    (item: TechnicianWithProfile) => item.$id,
    [],
  );

  const renderTechnician = useCallback(
    ({ item }: { item: TechnicianWithProfile }) => (
      <TechnicianCard
        technician={item}
        onPress={() =>
          router.push({
            pathname: "/technician/[id]",
            params: { id: item.$id, data: JSON.stringify(item) },
          })
        }
      />
    ),
    [router],
  );

  const renderHeader = () => (
    <View className="px-4 pt-4 pb-2">
      <View className="bg-surface rounded-2xl p-5 shadow-md">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xl font-semibold text-text">
              {t("favorites.title")}
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              {favorites.length === 1
                ? t("favorites.countSingular", { count: favorites.length })
                : t("favorites.countPlural", { count: favorites.length })}
            </Text>
          </View>
          <View className="w-14 h-14 rounded-xl bg-danger-light items-center justify-center">
            <Ionicons name="heart" size={28} color="#DC2626" />
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <SkeletonList count={3} />;
  }

  return (
    <View className="flex-1 bg-background">
      {favorites.length === 0 ? (
        <View style={{ flex: 1, paddingBottom: 100 }}>
          {renderHeader()}
          <EmptyState
            icon="❤️"
            title={t("favorites.emptyTitle")}
            message={t("favorites.emptyMessage")}
          />
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderTechnician}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={50}
          windowSize={5}
          initialNumToRender={6}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#065F46"]}
              tintColor="#065F46"
            />
          }
        />
      )}
    </View>
  );
}
