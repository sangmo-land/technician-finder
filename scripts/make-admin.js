/**
 * Promote (or demote) a user to admin by email.
 *
 * Usage:
 *   $env:APPWRITE_API_KEY="<key>"; node scripts/make-admin.js admin@example.com
 *   $env:APPWRITE_API_KEY="<key>"; node scripts/make-admin.js --remove admin@example.com
 */

const { Client, Users } = require("node-appwrite");

const ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = "69877dfb002b6b81d969";
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
  console.error("❌ Set APPWRITE_API_KEY env var first");
  process.exit(1);
}

const args = process.argv.slice(2);
const remove = args.includes("--remove");
const email = args.find((a) => !a.startsWith("--"));

if (!email) {
  console.log("Usage: node scripts/make-admin.js [--remove] user@email.com");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const users = new Users(client);

async function main() {
  // Find user by email
  const result = await users.list(undefined, undefined, undefined, `equal("email", ["${email}"])`);
  
  if (result.total === 0) {
    // Try with the Query helper
    const { Query } = require("node-appwrite");
    const result2 = await users.list([Query.equal("email", email)]);
    if (result2.total === 0) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }
    await processUser(result2.users[0]);
    return;
  }

  await processUser(result.users[0]);
}

async function processUser(user) {
  console.log(`Found user: ${user.name} (${user.email}) — ID: ${user.$id}`);
  console.log(`Current labels: [${user.labels.join(", ")}]`);

  let newLabels;
  if (remove) {
    newLabels = user.labels.filter((l) => l !== "admin");
    if (newLabels.length === user.labels.length) {
      console.log("ℹ️  User is not an admin, nothing to remove.");
      return;
    }
  } else {
    if (user.labels.includes("admin")) {
      console.log("ℹ️  User is already an admin.");
      return;
    }
    newLabels = [...user.labels, "admin"];
  }

  await users.updateLabels(user.$id, newLabels);
  console.log(`✅ ${remove ? "Removed admin from" : "Promoted to admin:"} ${user.email}`);
  console.log(`New labels: [${newLabels.join(", ")}]`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
