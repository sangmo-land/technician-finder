/**
 * Seed: Assign random DiceBear avatars to all existing users who don't have one.
 *
 * Usage:
 *   node scripts/seed-avatars.js
 *
 * Requires APPWRITE_API_KEY env var (server-side key).
 */

const { Client, Databases, Query } = require("node-appwrite");

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
    "❌ Please set APPWRITE_API_KEY env var.\n   Example: $env:APPWRITE_API_KEY='your-key'; node scripts/seed-avatars.js",
  );
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

const AVATAR_SEEDS = [
  "Felix", "Aneka", "Leo", "Nala", "Jasper",
  "Luna", "Oscar", "Mia", "Zara", "Max",
  "Cleo", "Sam", "Riley", "Kai", "Ava", "Eli",
];

function randomAvatar() {
  const seed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];
  return `https://api.dicebear.com/9.x/adventurer/png?seed=${seed}&size=128`;
}

async function main() {
  console.log("Seeding avatars for users without one...\n");

  let offset = 0;
  const limit = 100;
  let updated = 0;
  let skipped = 0;

  while (true) {
    const res = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.limit(limit), Query.offset(offset)],
    );

    if (res.documents.length === 0) break;

    for (const doc of res.documents) {
      if (doc.avatar) {
        skipped++;
        console.log(`  ⏭️  ${doc.name || doc.userId} — already has avatar`);
        continue;
      }

      const avatarUrl = randomAvatar();
      try {
        await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          doc.$id,
          { avatar: avatarUrl },
        );
        updated++;
        console.log(`  ✅ ${doc.name || doc.userId} → ${avatarUrl.split("seed=")[1]?.split("&")[0]}`);
      } catch (err) {
        console.error(`  ❌ Failed to update ${doc.name || doc.userId}:`, err.message);
      }
    }

    if (res.documents.length < limit) break;
    offset += limit;
  }

  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);
}

main();
