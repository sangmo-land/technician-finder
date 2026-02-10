/**
 * Seed the Appwrite gallery bucket with sample images and
 * update each technician document with the uploaded file IDs.
 *
 * Usage:
 *   node scripts/seed-gallery.js
 */

const { Client, Databases, Storage, ID, Query } = require("node-appwrite");
const { InputFile } = require(require("path").join(require("path").dirname(require.resolve("node-appwrite")), "inputFile.js"));
const https = require("https");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ── Configuration ──
const ENDPOINT = process.env.APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || "69877dfb002b6b81d969";
const API_KEY = process.env.APPWRITE_API_KEY || "<YOUR_API_KEY>";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "698a557e00324c8eb017";
const TECHNICIANS_COLLECTION_ID = process.env.APPWRITE_TECHNICIANS_COLLECTION_ID || "698ba2f7002c5e6ada4d";
const GALLERY_BUCKET_ID = process.env.APPWRITE_GALLERY_BUCKET_ID || "698ba30000343f2a174a";

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);
const storage = new Storage(client);

// Map each technician userId to an array of picsum image seeds
const galleryImages = {
  u1:  ["plumb1", "plumb2", "plumb3"],
  u2:  ["elec1", "elec2", "elec3", "elec4"],
  u3:  ["carp1", "carp2", "carp3"],
  u4:  ["mason1", "mason2", "mason3"],
  u5:  ["paint1", "paint2", "paint3"],
  u6:  ["plumb4", "plumb5"],
  u7:  ["elec5", "elec6", "elec7"],
  u8:  ["carp4", "carp5", "carp6", "carp7"],
  u9:  ["mason4", "mason5", "mason6", "mason7"],
  u10: ["paint4", "paint5"],
  u11: ["plumb6", "plumb7", "plumb8"],
  u12: ["elec8", "elec9", "elec10"],
};

/** Download a URL to a temp file, following redirects */
function downloadToFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    const request = (u) => {
      https.get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // follow redirect
          return request(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${u}`));
        }
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(); });
      }).on("error", reject);
    };
    request(url);
  });
}

async function main() {
  console.log("🖼️  Seeding gallery images...\n");

  const tmpDir = path.join(os.tmpdir(), "tf-gallery-seed");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  // Fetch all technician documents
  const techDocs = await databases.listDocuments(DATABASE_ID, TECHNICIANS_COLLECTION_ID, [
    Query.limit(25),
  ]);

  for (const doc of techDocs.documents) {
    const seeds = galleryImages[doc.userId];
    if (!seeds) continue;

    const fileIds = [];
    for (const seed of seeds) {
      const url = `https://picsum.photos/seed/${seed}/600/400`;
      const tmpFile = path.join(tmpDir, `${seed}.jpg`);

      // Download
      process.stdout.write(`   ⬇ ${seed}.jpg ...`);
      await downloadToFile(url, tmpFile);

      // Upload to Appwrite Storage
      const fileId = ID.unique();
      const fileBuffer = fs.readFileSync(tmpFile);
      const inputFile = {
        type: "file",
        stream: fileBuffer,
        filename: `${seed}.jpg`,
        size: fileBuffer.length,
      };

      // Use the SDK's createFile with a Node buffer
      const uploaded = await storage.createFile(
        GALLERY_BUCKET_ID,
        fileId,
        InputFile.fromBuffer(fileBuffer, `${seed}.jpg`),
      );
      fileIds.push(uploaded.$id);
      console.log(` ✅ (${uploaded.$id})`);

      // Clean up temp file
      fs.unlinkSync(tmpFile);
    }

    // Update the technician document with file IDs
    await databases.updateDocument(DATABASE_ID, TECHNICIANS_COLLECTION_ID, doc.$id, {
      gallery: fileIds,
    });
    console.log(`   📎 Updated ${doc.userId} with ${fileIds.length} images\n`);
  }

  // Cleanup temp dir
  fs.rmdirSync(tmpDir, { recursive: true });

  console.log("🎉 Gallery seeding complete!");
}

main().catch((err) => {
  console.error("❌ Gallery seeding failed:", err.message || err);
  process.exit(1);
});
