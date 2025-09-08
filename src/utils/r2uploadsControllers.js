import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import mime from "mime-types";
import dotenv from "dotenv";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { randomUUID } from "crypto"; // ✅ UUID for unique folder names

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// ✅ Setup R2 Client
const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

// 🎥 Convert video to HLS
const processVideoForStreaming = async (filePath, outputDir) => {
  return new Promise((resolve, reject) => {
    const fileBase = path.basename(filePath, path.extname(filePath));

    fs.mkdir(outputDir, { recursive: true })
      .then(() => {
        ffmpeg(filePath)
          .outputOptions([
            "-preset veryfast",
            "-g 48",
            "-sc_threshold 0",
            "-hls_time 6",
            "-hls_playlist_type vod",
          ])
          .output(`${outputDir}/${fileBase}.m3u8`)
          .on("end", () => resolve(`${outputDir}/${fileBase}.m3u8`))
          .on("error", reject)
          .run();
      })
      .catch(reject);
  });
};

export const uploadFileToR2 = async (filePath, mimetype) => {
  if (!filePath) throw new Error("File path is required");

  try {
    if (!existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

    const stats = await fs.stat(filePath);
    if (stats.size === 0) {
      await fs.unlink(filePath);
      throw new Error("File is empty");
    }

    const originalFileName = path.basename(filePath);
    const ext = path.extname(originalFileName).toLowerCase();
    const baseName = path.basename(originalFileName, ext);

    const contentType = mimetype || mime.lookup(ext) || "application/octet-stream";
    const folder = contentType.startsWith("image/")
      ? "images"
      : contentType.startsWith("video/")
      ? "videos"
      : "misc";

    let results = [];

    // ✅ Handle Images (direct upload)
    if (contentType.startsWith("image/")) {
      const uniqueFileName = `${randomUUID()}-${baseName}${ext}`;
      const fileKey = `${folder}/${uniqueFileName}`;
      const fileContent = await fs.readFile(filePath);

      await R2.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: fileKey,
          Body: fileContent,
          ContentType: contentType,
        })
      );

      results.push(getPublicUrl(fileKey));
    }

    // 🎥 Handle Videos (convert to HLS + parallel upload)
    if (contentType.startsWith("video/")) {
      const uniqueId = randomUUID(); // ✅ Unique folder name
      const uniqueFolder = `videos/${uniqueId}-${baseName}`;
      const tmpDir = `./tmp-${uniqueId}-${baseName}`;

      const m3u8File = await processVideoForStreaming(filePath, tmpDir);
      const files = await fs.readdir(tmpDir);

      await Promise.all(
        files.map(async (f) => {
          const absFilePath = path.join(tmpDir, f);
          const fileKey = `${uniqueFolder}/${f}`;
          const fileBuffer = await fs.readFile(absFilePath);
          const mimeType = mime.lookup(f) || "application/octet-stream";

          await R2.send(
            new PutObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME,
              Key: fileKey,
              Body: fileBuffer,
              ContentType: mimeType,
            })
          );

          if (f.endsWith(".m3u8")) {
            results.push(getPublicUrl(fileKey)); // ✅ Return manifest URL
          }

          await fs.unlink(absFilePath); // 🧹 Cleanup after upload
        })
      );

      await fs.rmdir(tmpDir);
    }

    // 🧹 Always remove local original file
    try {
      await fs.unlink(filePath);
    } catch {}

    return results;
  } catch (err) {
    console.error("❌ uploadFileToR2 Error:", err.message);
    if (existsSync(filePath)) {
      try {
        await fs.unlink(filePath);
      } catch {}
    }
    throw err;
  }
};

const getPublicUrl = (key) => {
  const baseUrl = process.env.R2_PUBLIC_URL.replace(/\/$/, "");
  return `${baseUrl}/${key}`;
};

export const generateSignedUrl = async (fileKey, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
  });
  return getSignedUrl(R2, command, { expiresIn });
};

export const deleteFileFromR2 = async (fileKey) => {
  await R2.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
    })
  );
  return { success: true };
};
