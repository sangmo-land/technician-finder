/**
 * Appwrite Setup Script
 *
 * Run this once to create the database, collections, attributes, and storage bucket.
 *
 * Usage:
 *   1. Install node-appwrite:  npm install --save-dev node-appwrite
 *   2. Copy .env.example to .env.local and fill in your values
 *   3. Run:  node scripts/setup-appwrite.js
 *
 * Required env vars (or edit the constants below):
 *   APPWRITE_ENDPOINT
 *   APPWRITE_PROJECT_ID
 *   APPWRITE_API_KEY          ← Server-side API key (create in Appwrite console → API Keys)
 *   APPWRITE_DATABASE_ID      ← (optional) will be auto-generated if empty
 */

const { Client, Databases, Storage, ID } = require("node-appwrite");

// ── Configuration ──
const ENDPOINT = process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || "<YOUR_PROJECT_ID>";
const API_KEY = process.env.APPWRITE_API_KEY || "<YOUR_API_KEY>";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "698a557e00324c8eb017";

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);
const storageClient = new Storage(client);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🚀 Setting up Appwrite backend...\n");

  // ── 1. Use existing Database ──
  const dbId = DATABASE_ID;
  console.log(`✅ Using existing database: ${dbId}`);

  // ── 2. Create "users" collection ──
  const usersCol = await databases.createCollection(dbId, ID.unique(), "users");
  console.log(`✅ Collection created: users (${usersCol.$id})`);

  // Attributes for "users"
  await databases.createStringAttribute(dbId, usersCol.$id, "userId", 36, true);
  await databases.createStringAttribute(dbId, usersCol.$id, "name", 128, true);
  await databases.createStringAttribute(dbId, usersCol.$id, "phone", 30, false);
  await databases.createStringAttribute(dbId, usersCol.$id, "location", 64, false);
  await databases.createStringAttribute(dbId, usersCol.$id, "role", 20, false, "user");
  console.log("   ↳ Attributes created for users");

  // Wait for attributes to be ready before creating indexes
  await sleep(2000);

  // Indexes for "users"
  await databases.createIndex(dbId, usersCol.$id, "idx_userId", "unique", ["userId"]);
  await databases.createIndex(dbId, usersCol.$id, "idx_role", "key", ["role"]);
  console.log("   ↳ Indexes created for users");

  // ── 3. Create "technicians" collection ──
  const techCol = await databases.createCollection(dbId, ID.unique(), "technicians");
  console.log(`✅ Collection created: technicians (${techCol.$id})`);

  // Attributes for "technicians"
  await databases.createStringAttribute(dbId, techCol.$id, "userId", 36, true);
  // skills is a string array
  await databases.createStringAttribute(dbId, techCol.$id, "skills", 30, true, undefined, true);
  await databases.createIntegerAttribute(dbId, techCol.$id, "experienceYears", true, 0, 100);
  await databases.createStringAttribute(dbId, techCol.$id, "bio", 2048, false);
  await databases.createFloatAttribute(dbId, techCol.$id, "hourlyRate", true, 0, 1000000);
  await databases.createStringAttribute(dbId, techCol.$id, "availability", 20, false, "available");
  await databases.createFloatAttribute(dbId, techCol.$id, "rating", false, 0, 5, 0);
  await databases.createIntegerAttribute(dbId, techCol.$id, "reviewCount", false, 0, 1000000, 0);
  await databases.createIntegerAttribute(dbId, techCol.$id, "jobsCompleted", false, 0, 1000000, 0);
  // gallery is a string array of Appwrite Storage file IDs
  await databases.createStringAttribute(dbId, techCol.$id, "gallery", 36, false, undefined, true);
  console.log("   ↳ Attributes created for technicians");

  // Wait for attributes to be ready
  await sleep(2000);

  // Indexes for "technicians"
  await databases.createIndex(dbId, techCol.$id, "idx_userId", "unique", ["userId"]);
  await databases.createIndex(dbId, techCol.$id, "idx_availability", "key", ["availability"]);
  await databases.createIndex(dbId, techCol.$id, "idx_rating", "key", ["rating"]);
  await databases.createIndex(dbId, techCol.$id, "idx_hourlyRate", "key", ["hourlyRate"]);
  await databases.createIndex(dbId, techCol.$id, "idx_experienceYears", "key", ["experienceYears"]);
  console.log("   ↳ Indexes created for technicians");

  // ── 4. Create Storage bucket for gallery images ──
  const bucket = await storageClient.createBucket(
    ID.unique(),
    "gallery",
    undefined, // permissions (configure in console or pass array)
    false,     // fileSecurity
    true,      // enabled
    10 * 1024 * 1024, // 10 MB max file size
    ["image/jpeg", "image/png", "image/webp"], // allowed MIME types
  );
  console.log(`✅ Storage bucket created: gallery (${bucket.$id})`);

  // ── Summary ──
  console.log("\n────────────────────────────────────────");
  console.log("Add these to your .env / app config:\n");
  console.log(`EXPO_PUBLIC_APPWRITE_DATABASE_ID=${dbId}`);
  console.log(`EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID=${usersCol.$id}`);
  console.log(`EXPO_PUBLIC_APPWRITE_TECHNICIANS_COLLECTION_ID=${techCol.$id}`);
  console.log(`EXPO_PUBLIC_APPWRITE_GALLERY_BUCKET_ID=${bucket.$id}`);
  console.log("────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("❌ Setup failed:", err.message || err);
  process.exit(1);
});
