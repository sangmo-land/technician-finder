import AsyncStorage from '@react-native-async-storage/async-storage';
import { Technician, TechnicianFormData } from '../types';
import { seedTechnicians } from '../data/seedData';

const STORAGE_KEY = '@technicians';
const INITIALIZED_KEY = '@initialized';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const initializeStorage = async (): Promise<void> => {
  try {
    const initialized = await AsyncStorage.getItem(INITIALIZED_KEY);
    if (!initialized) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedTechnicians));
      await AsyncStorage.setItem(INITIALIZED_KEY, 'true');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

export const getAllTechnicians = async (): Promise<Technician[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting technicians:', error);
    return [];
  }
};

export const getTechnicianById = async (id: string): Promise<Technician | null> => {
  try {
    const technicians = await getAllTechnicians();
    return technicians.find((t) => t.id === id) || null;
  } catch (error) {
    console.error('Error getting technician:', error);
    return null;
  }
};

export const addTechnician = async (data: TechnicianFormData): Promise<Technician> => {
  const newTechnician: Technician = {
    ...data,
    id: generateId(),
  };

  try {
    const technicians = await getAllTechnicians();
    technicians.push(newTechnician);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(technicians));
    return newTechnician;
  } catch (error) {
    console.error('Error adding technician:', error);
    throw error;
  }
};

export const updateTechnician = async (
  id: string,
  data: TechnicianFormData
): Promise<Technician | null> => {
  try {
    const technicians = await getAllTechnicians();
    const index = technicians.findIndex((t) => t.id === id);
    
    if (index === -1) {
      return null;
    }

    const updatedTechnician: Technician = { ...data, id };
    technicians[index] = updatedTechnician;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(technicians));
    return updatedTechnician;
  } catch (error) {
    console.error('Error updating technician:', error);
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
    console.error('Error deleting technician:', error);
    throw error;
  }
};

export const resetToSeedData = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedTechnicians));
  } catch (error) {
    console.error('Error resetting data:', error);
    throw error;
  }
};
