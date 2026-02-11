const https = require("https");
const API_KEY = process.env.APPWRITE_API_KEY;

// Get function details
const opts = {
  hostname: "fra.cloud.appwrite.io",
  path: "/v1/functions/698bc7d50027633e8390",
  method: "GET",
  headers: {
    "X-Appwrite-Project": "69877dfb002b6b81d969",
    "X-Appwrite-Key": API_KEY,
  },
};
const req = https.request(opts, (res) => {
  let b = "";
  res.on("data", (c) => (b += c));
  res.on("end", () => {
    const r = JSON.parse(b);
    console.log("Function:", r.name);
    console.log("Execute permissions:", JSON.stringify(r.execute));
    console.log("Enabled:", r.enabled);
    console.log("Status:", r.status);
    console.log("Scopes:", JSON.stringify(r.scopes));
  });
});
req.end();
