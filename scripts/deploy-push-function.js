/**
 * Deploy the send-push-notification function to Appwrite
 *
 * Usage:
 *   node scripts/deploy-push-function.js
 *
 * Required env vars:
 *   APPWRITE_ENDPOINT
 *   APPWRITE_PROJECT_ID
 *   APPWRITE_API_KEY
 *   APPWRITE_DATABASE_ID
 *   APPWRITE_PUSH_TOKENS_COLLECTION_ID
 */

const { Client, Functions, ID } = require("node-appwrite");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ENDPOINT = process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const PUSH_TOKENS_COLLECTION_ID = process.env.APPWRITE_PUSH_TOKENS_COLLECTION_ID;
const USERS_COLLECTION_ID = process.env.APPWRITE_USERS_COLLECTION_ID;

if (!PROJECT_ID || !API_KEY) {
  console.error("Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const functions = new Functions(client);

async function main() {
  console.log("🚀 Deploying send-push-notification function...\n");

  const functionDir = path.join(__dirname, "../functions/send-push-notification");
  const tarFile = path.join(__dirname, "../functions/send-push-notification.tar.gz");

  // Install dependencies and create tarball
  console.log("📦 Installing dependencies...");
  execSync("npm install", { cwd: functionDir, stdio: "inherit" });

  console.log("📦 Creating deployment package...");
  execSync(`tar -czvf "${tarFile}" -C "${functionDir}" .`, { stdio: "inherit" });

  // Create or update function
  let functionId;
  
  try {
    // Try to list existing functions to find ours
    const existing = await functions.list();
    const existingFunc = existing.functions.find(f => f.name === "send-push-notification");
    
    if (existingFunc) {
      functionId = existingFunc.$id;
      console.log(`✅ Found existing function: ${functionId}`);
    }
  } catch (e) {
    // Ignore errors when listing
  }

  if (!functionId) {
    // Create new function
    console.log("Creating new function...");
    const func = await functions.create(
      ID.unique(),
      "send-push-notification",
      "node-22.0", // Runtime
      undefined, // execute permissions (we'll use events instead)
      [
        // Trigger on new user document creation
        `databases.${DATABASE_ID}.collections.${USERS_COLLECTION_ID}.documents.*.create`
      ],
      undefined, // schedule
      undefined, // timeout
      undefined, // enabled
      undefined, // logging
      undefined, // entrypoint
      undefined, // commands
      undefined, // scopes
      undefined, // installationId
      undefined, // providerRepositoryId
      undefined, // providerBranch
      undefined, // providerSilentMode
      undefined, // providerRootDirectory
      undefined, // templateRepository
      undefined, // templateOwner
      undefined, // templateRootDirectory
      undefined, // templateVersion
      undefined, // specification
    );
    functionId = func.$id;
    console.log(`✅ Created function: ${functionId}`);
  }

  // Update function variables
  console.log("Setting environment variables...");
  try {
    await functions.createVariable(functionId, "APPWRITE_DATABASE_ID", DATABASE_ID);
  } catch (e) {
    if (e.code !== 409) throw e; // Ignore already exists
  }
  
  try {
    await functions.createVariable(functionId, "APPWRITE_PUSH_TOKENS_COLLECTION_ID", PUSH_TOKENS_COLLECTION_ID);
  } catch (e) {
    if (e.code !== 409) throw e;
  }

  // Create deployment
  console.log("Uploading deployment...");
  const deployment = await functions.createDeployment(
    functionId,
    fs.createReadStream(tarFile),
    true, // activate
    "src/main.js" // entrypoint
  );
  
  console.log(`✅ Deployment created: ${deployment.$id}`);
  console.log("\n🎉 Function deployed successfully!");
  console.log(`\n📝 Function ID: ${functionId}`);
  console.log("\n⚠️  Make sure to configure the event trigger in Appwrite Console:");
  console.log(`   Event: databases.${DATABASE_ID}.collections.${USERS_COLLECTION_ID}.documents.*.create`);

  // Clean up
  fs.unlinkSync(tarFile);
}

main().catch(console.error);
