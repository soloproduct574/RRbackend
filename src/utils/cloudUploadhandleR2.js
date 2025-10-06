import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function test() {
  const result = await R2.send(
    new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME })
  );
  console.log("✅ R2 LIST OBJECTS RESULT:", result);
}

test().catch(console.error);
