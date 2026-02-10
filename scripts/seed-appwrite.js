/**
 * Seed Appwrite database with sample data.
 *
 * Usage:
 *   node scripts/seed-appwrite.js
 *
 * Requires the same env vars as setup-appwrite.js:
 *   APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY,
 *   APPWRITE_DATABASE_ID, APPWRITE_USERS_COLLECTION_ID, APPWRITE_TECHNICIANS_COLLECTION_ID
 */

const { Client, Databases, ID } = require("node-appwrite");

// ── Configuration ──
const ENDPOINT = process.env.APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || "69877dfb002b6b81d969";
const API_KEY = process.env.APPWRITE_API_KEY || "<YOUR_API_KEY>";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "698a557e00324c8eb017";
const USERS_COLLECTION_ID = process.env.APPWRITE_USERS_COLLECTION_ID || "698ba2f10029df0d1279";
const TECHNICIANS_COLLECTION_ID = process.env.APPWRITE_TECHNICIANS_COLLECTION_ID || "698ba2f7002c5e6ada4d";

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// ── Seed Data ──

const seedUserProfiles = [
  { userId: "u1",  name: "Jean-Pierre Nkomo",   phone: "+237 6 70 12 34 56", location: "Douala",       role: "technician" },
  { userId: "u2",  name: "Marie-Claire Fotso",  phone: "+237 6 99 87 65 43", location: "Yaoundé",      role: "technician" },
  { userId: "u3",  name: "Paul Biya Tchamba",   phone: "+237 6 55 44 33 22", location: "Bamenda",      role: "technician" },
  { userId: "u4",  name: "Cécile Nguemo",       phone: "+237 6 77 88 99 00", location: "Bafoussam",    role: "technician" },
  { userId: "u5",  name: "Emmanuel Ndongo",     phone: "+237 6 22 33 44 55", location: "Douala",       role: "technician" },
  { userId: "u6",  name: "Françoise Meka",      phone: "+237 6 11 22 33 44", location: "Yaoundé",      role: "technician" },
  { userId: "u7",  name: "Samuel Tabi",         phone: "+237 6 88 77 66 55", location: "Limbe",        role: "technician" },
  { userId: "u8",  name: "Jeanne Mbarga",       phone: "+237 6 44 55 66 77", location: "Buea",         role: "technician" },
  { userId: "u9",  name: "Patrick Essomba",     phone: "+237 6 33 22 11 00", location: "Kribi",        role: "technician" },
  { userId: "u10", name: "Bernadette Atanga",   phone: "+237 6 66 77 88 99", location: "Garoua",       role: "technician" },
  { userId: "u11", name: "Joseph Kamga",        phone: "+237 6 99 88 77 66", location: "Ngaoundéré",   role: "technician" },
  { userId: "u12", name: "Angèle Njoya",        phone: "+237 6 55 66 77 88", location: "Maroua",       role: "technician" },
];

const seedTechnicians = [
  { userId: "u1",  skills: ["Plumber"],              experienceYears: 8,  bio: "Experienced plumber specializing in residential and commercial installations. Expert in pipe fitting, drain cleaning, and bathroom renovations.", hourlyRate: 5000, availability: "available", rating: 4.8, reviewCount: 124, jobsCompleted: 215, gallery: [] },
  { userId: "u2",  skills: ["Electrician", "Plumber"], experienceYears: 12, bio: "Licensed electrician with 12+ years of experience in wiring, panel upgrades, and solar installations. Also handles basic plumbing work.", hourlyRate: 7500, availability: "available", rating: 4.9, reviewCount: 203, jobsCompleted: 340, gallery: [] },
  { userId: "u3",  skills: ["Carpenter"],             experienceYears: 15, bio: "Master carpenter crafting custom furniture, cabinets, and wooden structures. Passionate about quality woodwork and traditional techniques.", hourlyRate: 6000, availability: "busy",      rating: 4.7, reviewCount: 89,  jobsCompleted: 178, gallery: [] },
  { userId: "u4",  skills: ["Mason", "Painter"],      experienceYears: 10, bio: "Skilled mason with expertise in bricklaying, concrete work, and structural foundations. Also offers painting services.", hourlyRate: 5500, availability: "available", rating: 4.6, reviewCount: 67,  jobsCompleted: 142, gallery: [] },
  { userId: "u5",  skills: ["Painter"],               experienceYears: 6,  bio: "Professional painter offering interior and exterior painting, wallpapering, and decorative finishes. Attention to clean lines.", hourlyRate: 3500, availability: "available", rating: 4.4, reviewCount: 45,  jobsCompleted: 98,  gallery: [] },
  { userId: "u6",  skills: ["Plumber"],               experienceYears: 9,  bio: "Dependable plumber for emergency repairs, water heater installations, and kitchen plumbing. Available for urgent calls.", hourlyRate: 5500, availability: "offline",   rating: 4.5, reviewCount: 78,  jobsCompleted: 156, gallery: [] },
  { userId: "u7",  skills: ["Electrician"],            experienceYears: 7,  bio: "Electrician focused on home automation, security systems, and energy-efficient lighting solutions.", hourlyRate: 6000, availability: "available", rating: 4.3, reviewCount: 34,  jobsCompleted: 87,  gallery: [] },
  { userId: "u8",  skills: ["Carpenter", "Mason"],    experienceYears: 11, bio: "Creative carpenter specializing in modern furniture design, kitchen remodels, and custom shelving. Also experienced in masonry.", hourlyRate: 6500, availability: "busy",      rating: 4.8, reviewCount: 112, jobsCompleted: 195, gallery: [] },
  { userId: "u9",  skills: ["Mason"],                 experienceYears: 14, bio: "Veteran mason with expertise in stone work, retaining walls, and large-scale construction projects.", hourlyRate: 7000, availability: "available", rating: 4.9, reviewCount: 156, jobsCompleted: 289, gallery: [] },
  { userId: "u10", skills: ["Painter"],               experienceYears: 5,  bio: "Artistic painter specializing in decorative murals, texture painting, and color consultation for homes and offices.", hourlyRate: 3000, availability: "available", rating: 4.2, reviewCount: 23,  jobsCompleted: 54,  gallery: [] },
  { userId: "u11", skills: ["Plumber", "Mason"],      experienceYears: 13, bio: "Highly experienced plumber handling complex water systems, irrigation, and industrial plumbing. Also does concrete work.", hourlyRate: 8000, availability: "available", rating: 4.7, reviewCount: 98,  jobsCompleted: 267, gallery: [] },
  { userId: "u12", skills: ["Electrician"],            experienceYears: 8,  bio: "Certified electrician providing reliable wiring, generator installation, and electrical maintenance services.", hourlyRate: 5500, availability: "busy",      rating: 4.6, reviewCount: 56,  jobsCompleted: 134, gallery: [] },
];

async function main() {
  console.log("🌱 Seeding Appwrite database...\n");

  // ── Seed user profiles ──
  let userCount = 0;
  for (const user of seedUserProfiles) {
    await databases.createDocument(DATABASE_ID, USERS_COLLECTION_ID, ID.unique(), user);
    userCount++;
    process.stdout.write(`\r   Users: ${userCount}/${seedUserProfiles.length}`);
  }
  console.log(" ✅");

  // ── Seed technicians ──
  let techCount = 0;
  for (const tech of seedTechnicians) {
    await databases.createDocument(DATABASE_ID, TECHNICIANS_COLLECTION_ID, ID.unique(), tech);
    techCount++;
    process.stdout.write(`\r   Technicians: ${techCount}/${seedTechnicians.length}`);
  }
  console.log(" ✅");

  console.log(`\n🎉 Seeded ${userCount} user profiles and ${techCount} technicians.`);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err.message || err);
  process.exit(1);
});
