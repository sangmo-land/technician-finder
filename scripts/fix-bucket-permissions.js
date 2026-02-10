const { Client, Storage, Permission, Role } = require("node-appwrite");

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("69877dfb002b6b81d969")
  .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

async function main() {
  const bucket = await storage.updateBucket({
    bucketId: "698ba30000343f2a174a",
    name: "gallery",
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
    fileSecurity: false,
    enabled: true,
    maximumFileSize: 10 * 1024 * 1024,
    allowedFileExtensions: ["jpg", "jpeg", "png", "webp"],
  });
  console.log("✅ Bucket updated — permissions:", bucket.$permissions);
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
