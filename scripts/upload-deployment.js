/**
 * Upload deployment for the promote-admin function.
 * Usage: node scripts/upload-deployment.js
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const FUNCTION_ID = "698bc7d50027633e8390";
const PROJECT_ID = "69877dfb002b6b81d969";
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) { console.error("Set APPWRITE_API_KEY"); process.exit(1); }

const filePath = path.resolve(__dirname, "..", "functions", "promote-admin.tar.gz");
const fileData = fs.readFileSync(filePath);
const boundary = "----FormBoundary" + Date.now().toString(16);

function field(name, value) {
  return `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
}

const parts = [];
parts.push(Buffer.from(field("activate", "true")));
parts.push(Buffer.from(field("entrypoint", "src/main.js")));
parts.push(Buffer.from(field("commands", "npm install")));
parts.push(Buffer.from(
  `--${boundary}\r\nContent-Disposition: form-data; name="code"; filename="code.tar.gz"\r\nContent-Type: application/gzip\r\n\r\n`
));
parts.push(fileData);
parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

const body = Buffer.concat(parts);

const options = {
  hostname: "fra.cloud.appwrite.io",
  path: `/v1/functions/${FUNCTION_ID}/deployments`,
  method: "POST",
  headers: {
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
    "X-Appwrite-Project": PROJECT_ID,
    "X-Appwrite-Key": API_KEY,
    "Content-Length": body.length,
  },
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const result = JSON.parse(data);
      console.log(`✅ Deployment created: ${result.$id}`);
      console.log(`   Status: ${result.status}`);
    } else {
      console.error(`❌ HTTP ${res.statusCode}: ${data}`);
    }
  });
});

req.on("error", (e) => console.error("❌ Error:", e.message));
req.write(body);
req.end();
