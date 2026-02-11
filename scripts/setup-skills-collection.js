/**
 * Create the "skills" collection in Appwrite.
 *
 * Usage:
 *   APPWRITE_API_KEY=<your-key> node scripts/setup-skills-collection.js
 *
 * This creates a collection with attributes:
 *   - nameEn  (string, required)  — English skill name, used as the unique key
 *   - nameFr  (string, optional)  — French translation
 *   - color   (string, optional)  — Hex color code (auto-assigned if empty)
 *   - icon    (string, optional)  — Ionicons icon name
 *   - isDefault (boolean)         — true for the 5 built-in skills
 *
 * After running, add the printed collection ID to your .env file as:
 *   EXPO_PUBLIC_APPWRITE_SKILLS_COLLECTION_ID=<id>
 */

const { Client, Databases, ID, Permission, Role } = require("node-appwrite");

const ENDPOINT =
  process.env.APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID =
  process.env.APPWRITE_PROJECT_ID || "69877dfb002b6b81d969";
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID =
  process.env.APPWRITE_DATABASE_ID || "698a557e00324c8eb017";

if (!API_KEY) {
  console.error("❌ Set APPWRITE_API_KEY environment variable first.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Default skills to seed
const DEFAULT_SKILLS = [
  { nameEn: "Plumber", nameFr: "Plombier", color: "#2563EB", icon: "water" },
  { nameEn: "Electrician", nameFr: "Électricien", color: "#D97706", icon: "flash" },
  { nameEn: "Carpenter", nameFr: "Menuisier", color: "#7C3AED", icon: "hammer" },
  { nameEn: "Mason", nameFr: "Maçon", color: "#DC2626", icon: "cube" },
  { nameEn: "Painter", nameFr: "Peintre", color: "#059669", icon: "color-palette" },
];

async function main() {
  console.log("🚀 Creating skills collection...\n");

  // Create collection — readable by any user, writable only by admins
  const col = await databases.createCollection(
    DATABASE_ID,
    ID.unique(),
    "skills",
    [
      Permission.read(Role.any()),
      Permission.create(Role.label("admin")),
      Permission.update(Role.label("admin")),
      Permission.delete(Role.label("admin")),
    ],
  );
  console.log(`✅ Collection created: skills (${col.$id})`);

  // Attributes
  await databases.createStringAttribute(DATABASE_ID, col.$id, "nameEn", 64, true);
  await databases.createStringAttribute(DATABASE_ID, col.$id, "nameFr", 64, false, "");
  await databases.createStringAttribute(DATABASE_ID, col.$id, "color", 10, false, "");
  await databases.createStringAttribute(DATABASE_ID, col.$id, "icon", 30, false, "");
  await databases.createBooleanAttribute(DATABASE_ID, col.$id, "isDefault", false, false);
  console.log("   ↳ Attributes created");

  await sleep(3000);

  // Index on nameEn for uniqueness lookups
  await databases.createIndex(DATABASE_ID, col.$id, "idx_nameEn", "unique", ["nameEn"]);
  console.log("   ↳ Index created");

  await sleep(2000);

  // Seed default skills
  for (const skill of DEFAULT_SKILLS) {
    await databases.createDocument(DATABASE_ID, col.$id, ID.unique(), {
      ...skill,
      isDefault: true,
    });
    console.log(`   ↳ Seeded: ${skill.nameEn}`);
  }

  console.log("\n────────────────────────────────────────");
  console.log("Add this to your .env:\n");
  console.log(`EXPO_PUBLIC_APPWRITE_SKILLS_COLLECTION_ID=${col.$id}`);
  console.log("────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("❌ Setup failed:", err.message || err);
  process.exit(1);
});
