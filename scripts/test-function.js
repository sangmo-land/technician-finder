const https = require("https");
const API_KEY = process.env.APPWRITE_API_KEY;

// Test 1: Execute function with API key (server-side)
console.log("=== Test 1: Execute with API key ===");
const body = JSON.stringify({ action: "list" });
const opts = {
  hostname: "fra.cloud.appwrite.io",
  path: "/v1/functions/698bc7d50027633e8390/executions",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Appwrite-Project": "69877dfb002b6b81d969",
    "X-Appwrite-Key": API_KEY,
  },
};
const payload = JSON.stringify({
  body: body,
  async: false,
  path: "/",
  method: "POST",
});
opts.headers["Content-Length"] = Buffer.byteLength(payload);

const req = https.request(opts, (res) => {
  let b = "";
  res.on("data", (c) => (b += c));
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    try {
      const r = JSON.parse(b);
      console.log("Execution status:", r.status);
      console.log("Response body:", r.responseBody);
      if (r.errors) console.log("Errors:", r.errors);
    } catch {
      console.log("Raw:", b.substring(0, 500));
    }
  });
});
req.write(payload);
req.end();
