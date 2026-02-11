/**
 * Deploy the promote-admin Appwrite Function.
 *
 * Usage (PowerShell):
 *   $env:APPWRITE_API_KEY="<key>"; node scripts/deploy-admin-function.js
 *
 * What it does:
 *   1. Creates the function in Appwrite (runtime: node-18.0, execute: label:admin)
 *   2. Creates a tar.gz of the function code
 *   3. Uploads & activates the deployment
 *   4. Prints the Function ID to add to your .env
 *
 * Prerequisites: node-appwrite (devDependency already installed)
 */

const { Client, Functions, ID } = require("node-appwrite");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = "69877dfb002b6b81d969";
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
  console.error("❌ Set APPWRITE_API_KEY env var first.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const functions = new Functions(client);

async function main() {
  const funcDir = path.resolve(__dirname, "..", "functions", "promote-admin");
  const tarPath = path.resolve(__dirname, "..", "functions", "promote-admin.tar.gz");

  // 1. Create tar.gz of function code
  console.log("📦 Packaging function code...");
  execSync(`tar -czf "${tarPath}" -C "${funcDir}" .`, { stdio: "inherit" });
  console.log("   ✅ Created promote-admin.tar.gz");

  // 2. Create the function in Appwrite
  console.log("☁️  Creating function in Appwrite...");
  let func;
  try {
    // Check if function already exists by listing
    const existing = await functions.list();
    func = existing.functions.find((f) => f.name === "promote-admin");

    if (func) {
      console.log(`   ℹ️  Function already exists: ${func.$id}`);
    } else {
      func = await functions.create(
        ID.unique(),
        "promote-admin",
        "node-18.0",
        ["label:admin"],  // execute permissions — only admins can call
        undefined,         // events
        undefined,         // schedule
        15,                // timeout (seconds)
        true,              // enabled
        true,              // logging
        "src/main.js",     // entrypoint
        "npm install",     // build commands
        undefined,         // scopes
      );
      console.log(`   ✅ Created function: ${func.$id}`);
    }
  } catch (err) {
    console.error("❌ Failed to create function:", err.message);
    // If the create API differs, try alternative params
    try {
      func = await functions.create(
        ID.unique(),
        "promote-admin",
        "node-18.0",
        ["label:admin"],
      );
      // Update settings
      await functions.update(func.$id, "promote-admin", "node-18.0", ["label:admin"], undefined, undefined, 15, true, true, "src/main.js", "npm install");
      console.log(`   ✅ Created function (alt): ${func.$id}`);
    } catch (err2) {
      console.error("❌ Alt creation also failed:", err2.message);
      process.exit(1);
    }
  }

  // 3. Enable required scopes (users.read, users.write) so the function gets APPWRITE_FUNCTION_API_KEY
  console.log("🔐 Note: Enable these scopes in Appwrite Console → Functions → promote-admin → Settings → Scopes:");
  console.log("   • users.read");
  console.log("   • users.write");

  // 4. Deploy the code
  console.log("🚀 Deploying function code...");
  try {
    // node-appwrite InputFile handling
    let InputFile;
    try {
      InputFile = require("node-appwrite").InputFile;
    } catch {
      const dir = path.dirname(require.resolve("node-appwrite"));
      InputFile = require(path.join(dir, "inputFile.js")).default || require(path.join(dir, "inputFile.js"));
    }

    const deployment = await functions.createDeployment(
      func.$id,
      InputFile.fromPath(tarPath, "code.tar.gz"),
      true,         // activate
      "src/main.js", // entrypoint
      "npm install", // commands
    );
    console.log(`   ✅ Deployment created: ${deployment.$id}`);
  } catch (err) {
    console.error("❌ Deployment failed:", err.message);
    console.log("\n📋 Manual deploy alternative:");
    console.log("   1. Open Appwrite Console → Functions → promote-admin");
    console.log("   2. Click 'Create Deployment'");
    console.log(`   3. Upload: functions/promote-admin.tar.gz`);
    console.log("   4. Entrypoint: src/main.js");
    console.log("   5. Build commands: npm install");
  }

  // 5. Cleanup tar
  try { fs.unlinkSync(tarPath); } catch {}

  // 6. Print result
  console.log("\n" + "═".repeat(60));
  console.log("✅ Function ID:", func.$id);
  console.log("═".repeat(60));
  console.log("\nAdd this to your .env file:");
  console.log(`EXPO_PUBLIC_APPWRITE_ADMIN_FUNCTION_ID='${func.$id}'`);
  console.log("\n⚠️  Don't forget to enable scopes in the Console:");
  console.log("   Functions → promote-admin → Settings → Scopes → users.read + users.write");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
