import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = "uploads";
const ALLOWED_MIMES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

export function getUploadDir(userId: string, submissionId: string): string {
  return path.join(process.cwd(), UPLOAD_DIR, userId, submissionId);
}

/**
 * Save an uploaded file to uploads/{userId}/{submissionId}/{sanitizedFilename}.
 * Returns the relative path stored in DB (userId/submissionId/filename).
 */
export async function saveVerificationFile(
  userId: string,
  submissionId: string,
  file: File
): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large (max 10MB)");
  }
  const mime = file.type?.toLowerCase() ?? "";
  if (!ALLOWED_MIMES.includes(mime)) {
    throw new Error("Invalid file type. Allowed: PDF, JPEG, PNG");
  }
  const dir = getUploadDir(userId, submissionId);
  await mkdir(dir, { recursive: true });
  const ext = path.extname(file.name) || (mime === "application/pdf" ? ".pdf" : ".jpg");
  const base = sanitizeFilename(path.basename(file.name, path.extname(file.name))) || "doc";
  const filename = `${base}-${Date.now()}${ext}`;
  const filepath = path.join(dir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, bytes);
  return path.join(userId, submissionId, filename);
}
