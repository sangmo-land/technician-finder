const https = require("https");
const API_KEY = process.env.APPWRITE_API_KEY;
const opts = {
  hostname: "fra.cloud.appwrite.io",
  path: "/v1/users",
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
    if (r.users) {
      r.users.forEach((u) =>
        console.log(u.$id, u.email, u.name, "labels:", JSON.stringify(u.labels))
      );
    } else {
      console.log(b);
    }
  });
});
req.end();
