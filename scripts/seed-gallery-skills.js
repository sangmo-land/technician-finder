/**
 * Re-seed the Appwrite gallery bucket with images that match
 * each technician's skill set.
 *
 * 1. Deletes ALL existing files in the gallery bucket
 * 2. Downloads skill-relevant images from loremflickr
 * 3. Uploads them and links file IDs to each technician document
 *
 * Usage:
 *   $env:APPWRITE_API_KEY="<key>"; node scripts/seed-gallery-skills.js
 */

const { Client, Databases, Storage, ID, Query } = require("node-appwrite");
const {
  InputFile,
} = require(
  require("path").join(
    require("path").dirname(require.resolve("node-appwrite")),
    "inputFile.js",
  ),
);
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ── Configuration ──
const ENDPOINT =
  process.env.APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID =
  process.env.APPWRITE_PROJECT_ID || "69877dfb002b6b81d969";
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID =
  process.env.APPWRITE_DATABASE_ID || "698a557e00324c8eb017";
const TECHNICIANS_COLLECTION_ID =
  process.env.APPWRITE_TECHNICIANS_COLLECTION_ID || "698ba2f7002c5e6ada4d";
const GALLERY_BUCKET_ID =
  process.env.APPWRITE_GALLERY_BUCKET_ID || "698ba30000343f2a174a";

if (!API_KEY || API_KEY === "<YOUR_API_KEY>") {
  console.error("❌ Set APPWRITE_API_KEY env var first");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);
const databases = new Databases(client);
const storage = new Storage(client);

// ── Skill-based image search terms + lock IDs for deterministic results ──
// loremflickr.com format: /width/height/keyword1,keyword2?lock=N
const skillImageConfig = {
  Plumber: [
    { keywords: "plumbing,pipes", lock: 1 },
    { keywords: "plumber,wrench", lock: 2 },
    { keywords: "faucet,water", lock: 3 },
    { keywords: "bathroom,plumbing", lock: 4 },
    { keywords: "pipe,fitting", lock: 5 },
    { keywords: "drain,repair", lock: 6 },
    { keywords: "water,heater", lock: 7 },
    { keywords: "kitchen,sink", lock: 8 },
  ],
  Electrician: [
    { keywords: "electrician,wiring", lock: 10 },
    { keywords: "electrical,panel", lock: 11 },
    { keywords: "light,switch", lock: 12 },
    { keywords: "circuit,breaker", lock: 13 },
    { keywords: "power,cable", lock: 14 },
    { keywords: "solar,panel", lock: 15 },
    { keywords: "generator,power", lock: 16 },
    { keywords: "led,lighting", lock: 17 },
  ],
  Carpenter: [
    { keywords: "carpentry,woodwork", lock: 20 },
    { keywords: "furniture,wood", lock: 21 },
    { keywords: "cabinet,kitchen", lock: 22 },
    { keywords: "wooden,shelf", lock: 23 },
    { keywords: "saw,timber", lock: 24 },
    { keywords: "woodworking,tool", lock: 25 },
    { keywords: "table,craft", lock: 26 },
    { keywords: "door,wooden", lock: 27 },
  ],
  Mason: [
    { keywords: "masonry,brick", lock: 30 },
    { keywords: "concrete,foundation", lock: 31 },
    { keywords: "stone,wall", lock: 32 },
    { keywords: "bricklaying,construction", lock: 33 },
    { keywords: "cement,block", lock: 34 },
    { keywords: "tiling,floor", lock: 35 },
    { keywords: "building,construction", lock: 36 },
    { keywords: "wall,plaster", lock: 37 },
  ],
  Painter: [
    { keywords: "house,painting", lock: 40 },
    { keywords: "wall,paint", lock: 41 },
    { keywords: "roller,brush", lock: 42 },
    { keywords: "interior,painting", lock: 43 },
    { keywords: "color,palette", lock: 44 },
    { keywords: "mural,wall", lock: 45 },
    { keywords: "home,renovation", lock: 46 },
    { keywords: "exterior,paint", lock: 47 },
  ],
};

/**
 * For each technician, pick images from their primary skill set.
 * Multi-skill technicians get a mix from each skill.
 */
function getImageListForTechnician(skills, count) {
  const images = [];
  if (skills.length === 1) {
    const pool = skillImageConfig[skills[0]] || [];
    for (let i = 0; i < Math.min(count, pool.length); i++) {
      images.push({ ...pool[i], label: skills[0] });
    }
  } else {
    // Interleave images from each skill
    const pools = skills.map((s) => skillImageConfig[s] || []);
    let idx = 0;
    while (images.length < count) {
      for (const pool of pools) {
        if (idx < pool.length && images.length < count) {
          images.push({ ...pool[idx], label: skills[pools.indexOf(pool)] });
        }
      }
      idx++;
      if (idx > 10) break; // safety
    }
  }
  return images;
}

// How many images per technician
const imagesPerTechnician = {
  u1: 3,
  u2: 4, // dual: Electrician + Plumber
  u3: 3,
  u4: 3, // dual: Mason + Painter
  u5: 3,
  u6: 2,
  u7: 3,
  u8: 4, // dual: Carpenter + Mason
  u9: 4,
  u10: 2,
  u11: 3, // dual: Plumber + Mason
  u12: 3,
};

/** Download a URL to a file, following redirects (http + https) */
function downloadToFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    const doRequest = (u) => {
      const p = u.startsWith("https") ? https : http;
      p.get(u, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          // Resolve relative redirects against the original URL
          let next = res.headers.location;
          if (!next.startsWith("http")) {
            const parsed = new URL(u);
            next = `${parsed.protocol}//${parsed.host}${next}`;
          }
          return doRequest(next);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${u}`));
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      }).on("error", reject);
    };
    doRequest(url);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function deleteAllBucketFiles() {
  console.log("🗑️  Clearing existing gallery files...");
  let deleted = 0;
  while (true) {
    const res = await storage.listFiles(GALLERY_BUCKET_ID, [Query.limit(100)]);
    if (res.files.length === 0) break;
    for (const f of res.files) {
      await storage.deleteFile(GALLERY_BUCKET_ID, f.$id);
      deleted++;
    }
  }
  console.log(`   Deleted ${deleted} file(s)\n`);
}

async function main() {
  console.log("🖼️  Seeding gallery with skill-matched images...\n");

  // Step 1: Delete all existing files
  await deleteAllBucketFiles();

  // Step 2: Fetch all technician documents
  const techDocs = await databases.listDocuments(
    DATABASE_ID,
    TECHNICIANS_COLLECTION_ID,
    [Query.limit(25)],
  );
  console.log(`Found ${techDocs.documents.length} technicians\n`);

  const tmpDir = path.join(os.tmpdir(), "tf-gallery-seed-v2");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  for (const doc of techDocs.documents) {
    const count = imagesPerTechnician[doc.userId] || 3;
    const skills = doc.skills || [];
    const imageList = getImageListForTechnician(skills, count);

    if (imageList.length === 0) {
      console.log(`⏭️  ${doc.userId} (${skills.join(", ")}) – no image config, skipping`);
      continue;
    }

    console.log(
      `👤 ${doc.userId} (${skills.join(", ")}) – downloading ${imageList.length} images`,
    );

    const fileIds = [];
    for (let i = 0; i < imageList.length; i++) {
      const img = imageList[i];
      const filename = `${doc.userId}_${img.label.toLowerCase()}_${i + 1}.jpg`;
      const tmpFile = path.join(tmpDir, filename);
      const url = `https://loremflickr.com/600/400/${img.keywords}?lock=${img.lock}`;

      process.stdout.write(`   ⬇ ${filename} ...`);

      try {
        await downloadToFile(url, tmpFile);

        const fileBuffer = fs.readFileSync(tmpFile);
        const uploaded = await storage.createFile(
          GALLERY_BUCKET_ID,
          ID.unique(),
          InputFile.fromBuffer(fileBuffer, filename),
        );
        fileIds.push(uploaded.$id);
        console.log(` ✅ (${uploaded.$id})`);

        fs.unlinkSync(tmpFile);
      } catch (err) {
        console.log(` ❌ ${err.message}`);
      }

      // Small delay to avoid rate-limiting loremflickr
      await sleep(300);
    }

    // Update the technician document with new file IDs
    await databases.updateDocument(
      DATABASE_ID,
      TECHNICIANS_COLLECTION_ID,
      doc.$id,
      { gallery: fileIds },
    );
    console.log(`   📎 Updated ${doc.userId} with ${fileIds.length} images\n`);
  }

  // Cleanup temp dir
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log("🎉 Gallery seeding complete!");
}

main().catch((err) => {
  console.error("❌ Gallery seeding failed:", err.message || err);
  process.exit(1);
});
