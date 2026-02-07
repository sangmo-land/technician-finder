import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Technician } from "../../src/types";
import {
  getAllTechnicians,
  deleteTechnician,
  resetToSeedData,
} from "../../src/services/storage";
import { skillColors } from "../../src/constants/colors";
import { EmptyState, LoadingSpinner } from "../../src/components";

export default function AdminScreen() {
  const router = useRouter();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTechnicians = useCallback(async () => {
    try {
      const data = await getAllTechnicians();
      setTechnicians(data);
    } catch (error) {
      console.error("Error loading technicians:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTechnicians();
    }, [loadTechnicians]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadTechnicians();
  };

  const handleDelete = (technician: Technician) => {
    Alert.alert(
      "Delete Technician",
      `Are you sure you want to delete ${technician.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTechnician(technician.id);
              loadTechnicians();
            } catch (error) {
              Alert.alert("Error", "Failed to delete technician.");
            }
          },
        },
      ],
    );
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Data",
      "This will restore all technicians to the original sample data. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await resetToSeedData();
              loadTechnicians();
            } catch (error) {
              Alert.alert("Error", "Failed to reset data.");
            }
          },
        },
      ],
    );
  };

  const renderTechnician = ({ item }: { item: Technician }) => {
    const color = skillColors[item.skill];

    return (
      <View className="bg-surface mx-4 mb-3 rounded-xl p-4 flex-row items-center shadow-sm">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: color }}
            />
            <Text
              className="text-base font-medium text-text flex-1"
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </View>
          <View className="flex-row items-center gap-3 flex-wrap">
            <View
              className="px-2 py-1 rounded-md"
              style={{ backgroundColor: `${color}15` }}
            >
              <Text className="text-xs font-semibold" style={{ color }}>
                {item.skill}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="location-outline" size={12} color="#94A3B8" />
              <Text className="text-sm text-text-secondary">
                {item.location}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text className="text-sm text-text-secondary">
                {(item.rating ?? 0) > 0 ? item.rating.toFixed(1) : "New"}
              </Text>
            </View>
            <Text className="text-sm font-medium text-primary">
              {(item.hourlyRate ?? 0).toLocaleString()} XAF/hr
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2 ml-3">
          <TouchableOpacity
            className="w-10 h-10 rounded-lg bg-primary-muted items-center justify-center"
            onPress={() => router.push(`/edit-technician/${item.id}`)}
          >
            <Ionicons name="pencil" size={18} color="#1E40AF" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-10 h-10 rounded-lg bg-danger-light items-center justify-center"
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View className="p-4 gap-3">
      <View className="bg-surface rounded-2xl p-5 shadow-md">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xl font-semibold text-text">
              Technician Management
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              {technicians.length} technicians registered
            </Text>
          </View>
          <View className="w-14 h-14 rounded-xl bg-primary-muted items-center justify-center">
            <Ionicons name="people" size={28} color="#1E40AF" />
          </View>
        </View>
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center bg-primary rounded-xl py-3 gap-2 shadow-sm"
          onPress={() => router.push("/add-technician")}
        >
          <Ionicons name="add-circle" size={22} color="#FFFFFF" />
          <Text className="text-base font-medium text-surface">
            Add Technician
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-12 h-12 rounded-xl bg-surface items-center justify-center border-[1.5px] border-primary"
          onPress={handleReset}
        >
          <Ionicons name="refresh" size={20} color="#1E40AF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-background">
      {technicians.length === 0 ? (
        <>
          {renderHeader()}
          <EmptyState
            icon="📋"
            title="No technicians"
            message="Add your first technician using the button above."
          />
        </>
      ) : (
        <FlatList
          data={technicians}
          renderItem={renderTechnician}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#1E40AF"]}
              tintColor="#1E40AF"
            />
          }
        />
      )}
    </View>
  );
}
