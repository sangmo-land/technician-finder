const https = require("https");
const API_KEY = process.env.APPWRITE_API_KEY;

// Update function execute permissions from label:admin to users
const payload = JSON.stringify({
  name: "promote-admin",
  runtime: "node-18.0",
  execute: ["users"],
  scopes: ["users.read", "users.write"],
});

const opts = {
  hostname: "fra.cloud.appwrite.io",
  path: "/v1/functions/698bc7d50027633e8390",
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "X-Appwrite-Project": "69877dfb002b6b81d969",
    "X-Appwrite-Key": API_KEY,
    "Content-Length": Buffer.byteLength(payload),
  },
};
const req = https.request(opts, (res) => {
  let b = "";
  res.on("data", (c) => (b += c));
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    try {
      const r = JSON.parse(b);
      console.log("Execute:", JSON.stringify(r.execute));
      console.log("Name:", r.name);
    } catch {
      console.log("Raw:", b.substring(0, 500));
    }
  });
});
req.write(payload);
req.end();
