/**
 * Setup Push Tokens Collection
 *
 * Creates a collection to store Expo push tokens for each user.
 *
 * Usage:
 *   node scripts/setup-push-tokens.js
 *
 * Required env vars:
 *   APPWRITE_ENDPOINT
 *   APPWRITE_PROJECT_ID
 *   APPWRITE_API_KEY
 *   APPWRITE_DATABASE_ID
 */

const { Client, Databases, ID, Permission, Role } = require("node-appwrite");

const ENDPOINT = process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

if (!PROJECT_ID || !API_KEY || !DATABASE_ID) {
  console.error("Missing required environment variables:");
  console.error("  APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🔔 Setting up push_tokens collection...\n");

  try {
    // Create push_tokens collection with document-level security
    const collection = await databases.createCollection(
      DATABASE_ID,
      ID.unique(),
      "push_tokens",
      [
        // Users can read/update/delete their own tokens
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true // documentSecurity enabled
    );
    console.log(`✅ Collection created: push_tokens (${collection.$id})`);

    // Create attributes
    // userId - the Appwrite user ID
    await databases.createStringAttribute(
      DATABASE_ID,
      collection.$id,
      "userId",
      36,
      true
    );

    // token - the Expo push token (e.g., "ExponentPushToken[xxx]")
    await databases.createStringAttribute(
      DATABASE_ID,
      collection.$id,
      "token",
      100,
      true
    );

    // platform - "ios" or "android"
    await databases.createStringAttribute(
      DATABASE_ID,
      collection.$id,
      "platform",
      20,
      false
    );

    // isAdmin - whether this user is an admin (for filtering who gets notified)
    await databases.createBooleanAttribute(
      DATABASE_ID,
      collection.$id,
      "isAdmin",
      false,
      false
    );

    // createdAt - timestamp
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      collection.$id,
      "createdAt",
      false
    );

    console.log("   ↳ Attributes created");

    // Wait for attributes to be ready
    await sleep(3000);

    // Create indexes
    await databases.createIndex(
      DATABASE_ID,
      collection.$id,
      "idx_userId",
      "key",
      ["userId"]
    );

    await databases.createIndex(
      DATABASE_ID,
      collection.$id,
      "idx_token",
      "unique",
      ["token"]
    );

    await databases.createIndex(
      DATABASE_ID,
      collection.$id,
      "idx_isAdmin",
      "key",
      ["isAdmin"]
    );

    console.log("   ↳ Indexes created");

    console.log("\n✅ Push tokens collection setup complete!");
    console.log(`\n📝 Add this to your .env file:`);
    console.log(`   EXPO_PUBLIC_APPWRITE_PUSH_TOKENS_COLLECTION_ID=${collection.$id}`);

  } catch (error) {
    if (error.code === 409) {
      console.log("ℹ️  Collection already exists");
    } else {
      console.error("❌ Error:", error.message);
      throw error;
    }
  }
}

main().catch(console.error);
