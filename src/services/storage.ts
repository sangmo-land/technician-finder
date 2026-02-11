import AsyncStorage from "@react-native-async-storage/async-storage";
import { TechnicianWithProfile, TechnicianFormData, Skill } from "../types";
import {
  listTechnicians as appwriteListTechnicians,
  getTechnicianById as appwriteGetTechnicianById,
  createTechnician as appwriteCreateTechnician,
  updateTechnician as appwriteUpdateTechnician,
  deleteTechnician as appwriteDeleteTechnician,
  createUserProfile,
  getUserProfile,
  getGalleryImageUrl,
  Query,
  databases,
} from "./appwrite";

const FAVORITES_KEY = "@favorites";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

// ── Helpers ──

/** Resolve gallery file IDs → viewable URLs */
function resolveGallery(fileIds: string[]): string[] {
  if (!fileIds || fileIds.length === 0) return [];
  return fileIds.map((id) => getGalleryImageUrl(id));
}

/** Join a technician doc with its user profile */
async function joinWithProfile(
  tech: any,
): Promise<TechnicianWithProfile> {
  const profile = await getUserProfile(tech.userId);
  return {
    $id: tech.$id,
    userId: tech.userId,
    name: profile?.name ?? "Unknown",
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    skills: tech.skills ?? [],
    experienceYears: tech.experienceYears ?? 0,
    bio: tech.bio ?? "",
    bioFr: tech.bioFr ?? "",
    hourlyRate: tech.hourlyRate ?? 0,
    availability: tech.availability ?? "offline",
    rating: tech.rating ?? 0,
    reviewCount: tech.reviewCount ?? 0,
    jobsCompleted: tech.jobsCompleted ?? 0,
    profileViews: tech.profileViews ?? 0,
    gallery: resolveGallery(tech.gallery ?? []),
  };
}

// ── No-op (kept for backward compat — data now lives in Appwrite) ──
export const initializeStorage = async (): Promise<void> => {};

// ── Read ──

export const getAllTechnicians = async (): Promise<TechnicianWithProfile[]> => {
  try {
    const techs = await appwriteListTechnicians([Query.limit(100)]);
    // Fetch all user profiles in parallel
    const results = await Promise.all(techs.map(joinWithProfile));
    return results;
  } catch (error) {
    console.error("Error getting technicians:", error);
    return [];
  }
};

export const getTechnicianById = async (
  id: string,
): Promise<TechnicianWithProfile | null> => {
  try {
    const tech = await appwriteGetTechnicianById(id);
    return joinWithProfile(tech);
  } catch (error) {
    console.error("Error getting technician:", error);
    return null;
  }
};

// ── Write ──

export const addTechnician = async (
  data: TechnicianFormData,
): Promise<TechnicianWithProfile> => {
  const tech = await appwriteCreateTechnician({
    ...data,
    gallery: data.gallery || [],
  });
  return joinWithProfile(tech);
};

export const updateTechnician = async (
  id: string,
  data: Partial<TechnicianFormData>,
): Promise<TechnicianWithProfile | null> => {
  try {
    const tech = await appwriteUpdateTechnician(id, data);
    return joinWithProfile(tech);
  } catch (error) {
    console.error("Error updating technician:", error);
    return null;
  }
};

export const deleteTechnician = async (id: string): Promise<boolean> => {
  try {
    await appwriteDeleteTechnician(id);
    return true;
  } catch (error) {
    console.error("Error deleting technician:", error);
    return false;
  }
};

export const resetToSeedData = async (): Promise<void> => {
  // In the Appwrite world this is a no-op.
  // Use the seed scripts to re-populate if needed.
  console.warn("resetToSeedData is not supported with Appwrite backend");
};

// ── Favorites (still local via AsyncStorage) ──

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

export const getFavoriteTechnicians = async (): Promise<
  TechnicianWithProfile[]
> => {
  try {
    const favoriteIds = await getFavorites();
    if (favoriteIds.length === 0) return [];

    // Fetch only the favorited technicians instead of all technicians
    const techs = await appwriteListTechnicians([
      Query.equal("$id", favoriteIds),
      Query.limit(favoriteIds.length),
    ]);

    const results = await Promise.all(techs.map(joinWithProfile));
    return results;
  } catch (error) {
    console.error("Error getting favorite technicians:", error);
    return [];
  }
};
