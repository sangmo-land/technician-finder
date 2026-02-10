const { Client, Storage } = require("node-appwrite");

const c = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("69877dfb002b6b81d969")
  .setKey(process.env.APPWRITE_API_KEY);

const s = new Storage(c);

async function main() {
  const res = await s.listFiles("698ba30000343f2a174a");
  const f = res.files[0];
  console.log("File:", f.name, f.$id);
  const viewUrl =
    "https://fra.cloud.appwrite.io/v1/storage/buckets/698ba30000343f2a174a/files/" +
    f.$id +
    "/view?project=69877dfb002b6b81d969";
  console.log("URL:", viewUrl);
  const resp = await fetch(viewUrl);
  console.log("Status:", resp.status, resp.headers.get("content-type"));
}

main().catch((e) => console.error(e.message));
