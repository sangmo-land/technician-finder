import { DEFAULT_SKILLS, setSkillsList } from "../types";
import { skillColors } from "../constants/colors";
import { databases, Query } from "./appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const SKILLS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_SKILLS_COLLECTION_ID!;

// Predefined color palette for auto-assigning to new skills
const EXTRA_COLORS = [
  "#0891B2", // cyan
  "#7C3AED", // violet
  "#DB2777", // pink
  "#EA580C", // orange
  "#4F46E5", // indigo
  "#0D9488", // teal
  "#B91C1C", // red-dark
  "#15803D", // green-dark
  "#6D28D9", // purple-dark
  "#CA8A04", // yellow-dark
];

export interface SkillDocument {
  $id: string;
  nameEn: string;
  nameFr: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

/**
 * Load all skills from Appwrite and merge into the runtime SKILLS list.
 * Must be called at app startup.
 */
export async function loadCustomSkills(): Promise<string[]> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      SKILLS_COLLECTION_ID,
      [Query.limit(100)],
    );
    const docs = res.documents as unknown as SkillDocument[];

    const names = docs.map((d) => d.nameEn);
    setSkillsList(names);

    // Populate skillColors from the DB
    let colorIdx = 0;
    for (const doc of docs) {
      if (doc.color) {
        skillColors[doc.nameEn] = doc.color;
      } else if (!skillColors[doc.nameEn]) {
        skillColors[doc.nameEn] = EXTRA_COLORS[colorIdx % EXTRA_COLORS.length];
        colorIdx++;
      }
    }

    return names;
  } catch (error) {
    console.log("Failed to load skills from Appwrite, using defaults:", error);
    setSkillsList([...DEFAULT_SKILLS]);
    return [...DEFAULT_SKILLS];
  }
}

/**
 * Get all skill documents from Appwrite.
 */
export async function getAllSkillDocs(): Promise<SkillDocument[]> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      SKILLS_COLLECTION_ID,
      [Query.limit(100)],
    );
    return res.documents as unknown as SkillDocument[];
  } catch {
    return [];
  }
}

/**
 * Get only the custom (non-default) skills.
 */
export async function getCustomSkills(): Promise<string[]> {
  try {
    const docs = await getAllSkillDocs();
    return docs.filter((d) => !d.isDefault).map((d) => d.nameEn);
  } catch {
    return [];
  }
}

/**
 * Add a new custom skill to Appwrite. Returns the updated full skill list.
 */
export async function addCustomSkill(
  nameEn: string,
  nameFr?: string,
): Promise<string[]> {
  const trimmedEn = nameEn.trim();
  const trimmedFr = (nameFr || trimmedEn).trim();

  // Check if already exists
  const existing = await getAllSkillDocs();
  if (
    existing.some(
      (d) => d.nameEn.toLowerCase() === trimmedEn.toLowerCase(),
    )
  ) {
    throw new Error("Skill already exists");
  }

  // Assign a color
  const usedColors = existing.map((d) => d.color).filter(Boolean);
  let newColor = "";
  for (const c of EXTRA_COLORS) {
    if (!usedColors.includes(c)) {
      newColor = c;
      break;
    }
  }
  if (!newColor) {
    newColor = EXTRA_COLORS[existing.length % EXTRA_COLORS.length];
  }

  const { ID } = await import("react-native-appwrite");
  await databases.createDocument(
    DATABASE_ID,
    SKILLS_COLLECTION_ID,
    ID.unique(),
    {
      nameEn: trimmedEn,
      nameFr: trimmedFr,
      color: newColor,
      icon: "build",
      isDefault: false,
    },
  );

  skillColors[trimmedEn] = newColor;

  // Reload full list
  return loadCustomSkills();
}

/**
 * Remove a custom skill from Appwrite. Cannot remove default skills.
 */
export async function removeCustomSkill(name: string): Promise<string[]> {
  const docs = await getAllSkillDocs();
  const doc = docs.find((d) => d.nameEn === name);

  if (!doc) throw new Error("Skill not found");
  if (doc.isDefault) throw new Error("Cannot remove default skill");

  await databases.deleteDocument(DATABASE_ID, SKILLS_COLLECTION_ID, doc.$id);

  // Reload full list
  return loadCustomSkills();
}
