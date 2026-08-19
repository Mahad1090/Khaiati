"use server";

import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ActionResult } from "./customers";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Uploads a cropped image to Supabase Storage and returns the storage path.
 * Pages should render images through the Cloudflare Worker CDN proxy using
 * that path — never the raw Supabase URL — per the required architecture.
 */
export async function uploadDesignImage(
  formData: FormData
): Promise<ActionResult<{ path: string }>> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file provided." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Only JPEG, PNG, or WebP images are allowed." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Image must be smaller than 5MB." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      ok: false,
      error:
        "Image storage isn't configured yet. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `designs/${randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("khaiati-images")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) {
    console.error("uploadDesignImage failed", error);
    return { ok: false, error: "Upload failed. Please try again." };
  }

  return { ok: true, data: { path } };
}
