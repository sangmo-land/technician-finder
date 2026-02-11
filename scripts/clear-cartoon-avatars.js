/**
 * Clear DiceBear cartoon avatar URLs from all user profiles
 * Sets avatar to empty string so the silhouette fallback is shown
 *
 * Usage: node scripts/clear-cartoon-avatars.js
 */
const sdk = require("node-appwrite");
require("dotenv").config();

const client = new sdk.Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID;

async function clearCartoonAvatars() {
  console.log("Fetching user profiles...");
  const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
    sdk.Query.limit(100),
  ]);

  let cleared = 0;
  for (const doc of response.documents) {
    if (doc.avatar && doc.avatar.includes("dicebear.com")) {
      await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, doc.$id, {
        avatar: "",
      });
      console.log(`  Cleared cartoon avatar for: ${doc.name || doc.$id}`);
      cleared++;
    }
  }

  console.log(`\nDone! Cleared ${cleared} cartoon avatars out of ${response.total} users.`);
}

clearCartoonAvatars().catch(console.error);
