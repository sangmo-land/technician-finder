const https = require("https");
const API_KEY = process.env.APPWRITE_API_KEY;

// Step 1: Create a session for the admin user
const loginPayload = JSON.stringify({
  email: "sangmolandry12@gmail.com",
  password: "password123", // We need the actual password
});

// Actually, let's use API key + set the user ID header to simulate
// In Appwrite, we can use createExecution with an x-appwrite-user-id header
// when using API key auth to impersonate a user

const body = JSON.stringify({ action: "list" });
const execPayload = JSON.stringify({
  body: body,
  async: false,
  path: "/",
  method: "POST",
});

const opts = {
  hostname: "fra.cloud.appwrite.io",
  path: "/v1/functions/698bc7d50027633e8390/executions",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Appwrite-Project": "69877dfb002b6b81d969",
    "X-Appwrite-Key": API_KEY,
    "X-Appwrite-User-Id": "698a5dfcf05443977712", // Admin user ID
    "Content-Length": Buffer.byteLength(execPayload),
  },
};

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
req.write(execPayload);
req.end();
