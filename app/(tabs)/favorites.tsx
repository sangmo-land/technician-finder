import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Technician } from '../../src/types';
import { getFavoriteTechnicians } from '../../src/services/storage';
import { TechnicianCard, EmptyState, LoadingSpinner } from '../../src/components';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      const data = await getFavoriteTechnicians();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
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

  const renderTechnician = ({ item }: { item: Technician }) => (
    <TechnicianCard
      technician={item}
      onPress={() => router.push(`/technician/${item.id}`)}
    />
  );

  const renderHeader = () => (
    <View className="px-4 pt-4 pb-2">
      <View className="bg-surface rounded-2xl p-5 shadow-md">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xl font-semibold text-text">
              Your Favorites
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              {favorites.length} {favorites.length === 1 ? 'technician' : 'technicians'} saved
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
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-background">
      {favorites.length === 0 ? (
        <>
          {renderHeader()}
          <EmptyState
            icon="❤️"
            title="No favorites yet"
            message="Tap the heart icon on a technician's profile to save them here for quick access."
          />
        </>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderTechnician}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1E40AF']}
              tintColor="#1E40AF"
            />
          }
        />
      )}
    </View>
  );
}
