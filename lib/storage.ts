import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─── R2 Client ────────────────────────────────────────────────────────────────

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

// ─── Asset Types ──────────────────────────────────────────────────────────────

// Supabase Storage: avatar, certificate, report_photo, report_pdf, cms_media
// Cloudflare R2:   attendance_selfie, payment_proof
export type R2AssetType = "attendance_selfie" | "payment_proof";

const R2_PREFIXES: Record<R2AssetType, string> = {
  attendance_selfie: "attendance-selfies",
  payment_proof: "payment-proofs",
};

const R2_CONTENT_TYPES: Record<R2AssetType, string> = {
  attendance_selfie: "image/jpeg",
  payment_proof: "image/jpeg",
};

// ─── Upload to R2 ─────────────────────────────────────────────────────────────

/**
 * Upload a file (Buffer/Uint8Array) to Cloudflare R2.
 * Returns the R2 object key.
 *
 * Usage (server-side only — e.g. API route or Server Action):
 *   const key = await uploadToR2(buffer, "attendance_selfie", coachId);
 */
export async function uploadToR2(
  file: Buffer | Uint8Array,
  type: R2AssetType,
  ownerId: string,
  options?: { extension?: string; contentType?: string }
): Promise<string> {
  const ext = options?.extension ?? "jpg";
  const contentType = options?.contentType ?? R2_CONTENT_TYPES[type];
  const prefix = R2_PREFIXES[type];
  const timestamp = Date.now();
  const key = `${prefix}/${ownerId}/${timestamp}.${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return key;
}

// ─── Delete from R2 ───────────────────────────────────────────────────────────

export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

// ─── Get Signed URL (private read) ───────────────────────────────────────────

/**
 * Generate a short-lived signed URL for private R2 objects.
 * Default expiry: 1 hour.
 */
export async function getR2SignedUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(r2, command, { expiresIn: expiresInSeconds });
}

// ─── Public URL (if bucket has public access configured) ──────────────────────

/**
 * Returns a public URL for objects in a publicly-accessible R2 bucket/domain.
 * Only use this if NEXT_PUBLIC_R2_PUBLIC_URL is configured.
 */
export function getR2PublicUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!base) throw new Error("NEXT_PUBLIC_R2_PUBLIC_URL is not configured");
  return `${base}/${key}`;
}
