import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

const ALLOWED_MIMES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const CLOUDINARY_UPLOAD_PRESET =
  process.env.CLOUDINARY_UPLOAD_PRESET ?? process.env.cloudinary_upload_preset ?? "kickpay";

// Prefer the explicit folder path if provided, otherwise fall back to folder name.
const CLOUDINARY_BASE_FOLDER = "kickpay-file";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

// Configure Cloudinary once at module load.
cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ??
    process.env.cloudinary_cloud_name ??
    process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY ?? process.env.cloudinary_api_key,
  api_secret: process.env.CLOUDINARY_API_SECRET ?? process.env.cloudinary_api_secret,
  secure:
    (process.env.CLOUDINARY_SECURE ?? process.env.cloudinary_secure ?? "true").toLowerCase() ===
    "true",
});

/**
 * Upload a verification document to Cloudinary using the `kickpay` upload preset.
 * Returns the secure URL of the uploaded asset.
 */
export async function saveVerificationFile(
  userId: string,
  submissionId: string,
  file: File
): Promise<string> {
  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary upload preset is not configured");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large (max 10MB)");
  }

  const mime = file.type?.toLowerCase() ?? "";
  if (!ALLOWED_MIMES.includes(mime)) {
    throw new Error("Invalid file type. Allowed: PDF, JPEG, PNG");
  }

  const ext = path.extname(file.name) || (mime === "application/pdf" ? ".pdf" : ".jpg");
  const baseName = sanitizeFilename(path.basename(file.name, path.extname(file.name))) || "doc";

  const buffer = Buffer.from(await file.arrayBuffer());

  const folderParts = [CLOUDINARY_BASE_FOLDER, userId, submissionId].filter(Boolean);
  const folder = folderParts.join("/");

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        upload_preset: CLOUDINARY_UPLOAD_PRESET,
        resource_type: "auto",
        folder,
        public_id: baseName,
        overwrite: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          return reject(new Error("Failed to upload document. Please try again."));
        }
        // Prefer secure URL when available.
        resolve(result.secure_url ?? result.url ?? "");
      }
    );

    uploadStream.end(buffer);
  });
}
