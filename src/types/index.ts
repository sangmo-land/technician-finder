export type Skill = 'Plumber' | 'Electrician' | 'Carpenter' | 'Mason' | 'Painter';

export type Availability = "available" | "busy" | "offline";

export type SortOption = "rating" | "experience" | "price_low" | "price_high";

export interface Technician {
  id: string;
  name: string;
  skill: Skill;
  phone: string;
  location: string;
  experienceYears: number;
  bio: string;
  hourlyRate: number;
  availability: Availability;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  gallery: string[]; // local file URIs of work showcase images
}

export type TechnicianFormData = Omit<
  Technician,
  "id" | "rating" | "reviewCount" | "jobsCompleted"
>;

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
  'Douala',
  'Yaoundé',
  'Bamenda',
  'Bafoussam',
  'Garoua',
  'Maroua',
  'Ngaoundéré',
  'Bertoua',
  'Limbe',
  'Buea',
  'Kribi',
  'Ebolowa',
];
