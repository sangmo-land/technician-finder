/**
 * Migration: Add "avatar" string attribute to the users collection.
 *
 * Usage:
 *   node scripts/add-avatar-field.js
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
const USERS_COLLECTION_ID =
  process.env.APPWRITE_USERS_COLLECTION_ID || "698ba2f10029df0d1279";

if (!API_KEY) {
  console.error(
    "❌ Please set APPWRITE_API_KEY env var.\n   Example: $env:APPWRITE_API_KEY='your-key'; node scripts/add-avatar-field.js",
  );
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function main() {
  console.log("Adding avatar attribute to users collection...\n");

  try {
    await databases.createStringAttribute(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      "avatar",     // key
      512,           // max length (URL)
      false,         // required
      "",            // default
    );
    console.log("✅ avatar attribute created successfully!");
    console.log(
      "⏳ It may take a moment for the attribute to become available.",
    );
  } catch (error) {
    if (error.message?.includes("already exists")) {
      console.log("ℹ️  avatar attribute already exists — skipping.");
    } else {
      console.error("❌ Failed to create attribute:", error.message || error);
    }
  }
}

main();
