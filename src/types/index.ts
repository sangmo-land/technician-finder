export type Skill = 'Plumber' | 'Electrician' | 'Carpenter' | 'Mason' | 'Painter';

export type Availability = "available" | "busy" | "offline";

export type Role = "user" | "technician" | "admin";

export type SortOption = "rating" | "experience" | "price_low" | "price_high";

// ── Users collection (extends Appwrite Auth) ──

export interface UserProfile {
  $id: string;
  userId: string; // Appwrite Auth userId
  name: string;
  phone: string;
  location: string;
  role: Role;
  avatar?: string; // URL to avatar image
}

export type UserProfileFormData = Omit<UserProfile, "$id">;

// ── Technicians collection ──

export interface Technician {
  $id: string;
  userId: string; // Appwrite Auth userId (links to UserProfile)
  skills: Skill[]; // many skills per technician
  experienceYears: number;
  bio: string;
  bioFr: string;
  hourlyRate: number;
  availability: Availability;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  profileViews: number;
  gallery: string[]; // Appwrite Storage file IDs
  createdAt: string; // ISO date string ($createdAt from Appwrite)
}

export type TechnicianFormData = Omit<
  Technician,
  | "$id"
  | "rating"
  | "reviewCount"
  | "jobsCompleted"
  | "profileViews"
  | "createdAt"
>;

// ── Combined view for UI (joins UserProfile + Technician) ──

export interface TechnicianWithProfile {
  $id: string; // Technician document ID
  userId: string;
  name: string; // from UserProfile
  phone: string; // from UserProfile
  location: string; // from UserProfile
  avatar: string; // from UserProfile
  skills: Skill[];
  experienceYears: number;
  bio: string;
  bioFr: string;
  hourlyRate: number;
  availability: Availability;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  profileViews: number;
  gallery: string[]; // Appwrite Storage file IDs
  createdAt: string; // ISO date string
}

export const SKILLS: Skill[] = [
  "Plumber",
  "Electrician",
  "Carpenter",
  "Mason",
  "Painter",
];

export const AVAILABILITY_OPTIONS: Availability[] = [
  "available",
  "busy",
  "offline",
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "rating", label: "Top Rated" },
  { value: "experience", label: "Most Experienced" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

export const LOCATIONS = [
  "Douala",
  "Yaoundé",
  "Bamenda",
  "Bafoussam",
  "Garoua",
  "Maroua",
  "Ngaoundéré",
  "Bertoua",
  "Limbe",
  "Buea",
  "Kribi",
  "Ebolowa",
];
