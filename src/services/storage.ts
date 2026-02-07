import AsyncStorage from '@react-native-async-storage/async-storage';
import { Technician, TechnicianFormData } from '../types';
import { seedTechnicians } from '../data/seedData';

const STORAGE_KEY = '@technicians';
const INITIALIZED_KEY = '@initialized';
const FAVORITES_KEY = "@favorites";

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const initializeStorage = async (): Promise<void> => {
  try {
    const initialized = await AsyncStorage.getItem(INITIALIZED_KEY);
    if (!initialized) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedTechnicians));
      await AsyncStorage.setItem(INITIALIZED_KEY, "v3");
    } else if (initialized === "true" || initialized === "v2") {
      // Migrate from older data model → re-seed with gallery field
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedTechnicians));
      await AsyncStorage.setItem(INITIALIZED_KEY, "v3");
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
};

export const getAllTechnicians = async (): Promise<Technician[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting technicians:", error);
    return [];
  }
};

export const getTechnicianById = async (
  id: string,
): Promise<Technician | null> => {
  try {
    const technicians = await getAllTechnicians();
    return technicians.find((t) => t.id === id) || null;
  } catch (error) {
    console.error("Error getting technician:", error);
    return null;
  }
};

export const addTechnician = async (
  data: TechnicianFormData,
): Promise<Technician> => {
  const newTechnician: Technician = {
    ...data,
    id: generateId(),
    rating: 0,
    reviewCount: 0,
    jobsCompleted: 0,
    gallery: data.gallery || [],
  };

  try {
    const technicians = await getAllTechnicians();
    technicians.push(newTechnician);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(technicians));
    return newTechnician;
  } catch (error) {
    console.error("Error adding technician:", error);
    throw error;
  }
};

export const updateTechnician = async (
  id: string,
  data: TechnicianFormData,
): Promise<Technician | null> => {
  try {
    const technicians = await getAllTechnicians();
    const index = technicians.findIndex((t) => t.id === id);

    if (index === -1) {
      return null;
    }

    const updatedTechnician: Technician = {
      ...technicians[index],
      ...data,
      id,
    };
    technicians[index] = updatedTechnician;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(technicians));
    return updatedTechnician;
  } catch (error) {
    console.error("Error updating technician:", error);
    throw error;
  }
};

export const deleteTechnician = async (id: string): Promise<boolean> => {
  try {
    const technicians = await getAllTechnicians();
    const filtered = technicians.filter((t) => t.id !== id);

    if (filtered.length === technicians.length) {
      return false;
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting technician:", error);
    throw error;
  }
};

export const resetToSeedData = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedTechnicians));
  } catch (error) {
    console.error("Error resetting data:", error);
    throw error;
  }
};

// ── Favorites ──

export const getFavorites = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
};

export const toggleFavorite = async (
  technicianId: string,
): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    const index = favorites.indexOf(technicianId);
    let isFavorite: boolean;

    if (index === -1) {
      favorites.push(technicianId);
      isFavorite = true;
    } else {
      favorites.splice(index, 1);
      isFavorite = false;
    }

    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return isFavorite;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};

export const isFavorite = async (technicianId: string): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.includes(technicianId);
  } catch (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
};

export const getFavoriteTechnicians = async (): Promise<Technician[]> => {
  try {
    const [technicians, favoriteIds] = await Promise.all([
      getAllTechnicians(),
      getFavorites(),
    ]);
    return technicians.filter((t) => favoriteIds.includes(t.id));
  } catch (error) {
    console.error("Error getting favorite technicians:", error);
    return [];
  }
};
