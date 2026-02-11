/**
 * Migration: Add "profileViews" integer attribute to the technicians collection.
 *
 * Usage:
 *   node scripts/add-profile-views.js
 *
 * Requires APPWRITE_API_KEY env var (server-side key).
 */

const { Client, Databases } = require("node-appwrite");

const ENDPOINT =
  process.env.APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID =
  process.env.APPWRITE_PROJECT_ID || "69877dfb002b6b81d969";
const API_KEY = process.env.APPWRITE_API_KEY || "";
const DATABASE_ID =
  process.env.APPWRITE_DATABASE_ID || "698a557e00324c8eb017";
const TECHNICIANS_COLLECTION_ID =
  process.env.APPWRITE_TECHNICIANS_COLLECTION_ID || "698ba2f7002c5e6ada4d";

if (!API_KEY) {
  console.error(
    "❌ Please set APPWRITE_API_KEY env var.\n   Example: $env:APPWRITE_API_KEY='your-key'; node scripts/add-profile-views.js",
  );
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function main() {
  console.log("Adding profileViews attribute to technicians collection...\n");

  try {
    await databases.createIntegerAttribute(
      DATABASE_ID,
      TECHNICIANS_COLLECTION_ID,
      "profileViews", // key
      false, // required
      0, // min
      100000000, // max
      0, // default
    );
    console.log("✅ profileViews attribute created successfully!");
    console.log(
      "   It may take a few seconds for Appwrite to finish processing the attribute.",
    );
  } catch (err) {
    if (err.message?.includes("already exists") || err.code === 409) {
      console.log("ℹ️  profileViews attribute already exists — nothing to do.");
    } else {
      throw err;
    }
  }
}

main().catch((err) => {
  console.error("❌ Migration failed:", err.message || err);
  process.exit(1);
});
