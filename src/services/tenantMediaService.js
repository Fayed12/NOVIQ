import { supabase } from './lib/supabaseClient';

/**
 * Handles uploads to the `business-media` bucket (migration
 * 007_storage_buckets_and_policies). NOT a table service — this only
 * deals with the storage file itself and returns the public URL; saving
 * that URL onto `tenants.cover_url` / `tenants.logo_url` / `services.image_url`
 * is a separate, normal `.update()` call via the relevant table service
 * (see usage examples below).
 *
 * Path convention (enforced by RLS — the first folder MUST be the
 * tenant_id, or the upload is rejected): {tenant_id}/{kind}/{filename}
 */
export const tenantMediaService = {
  async upload(tenantId, kind, file) {
    if (!file) throw new Error("No file provided for upload.");

    // Security check: Validate MIME type against strict whitelist
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedMimeTypes.includes(file.type?.toLowerCase())) {
        throw new Error("Security Violation: Only JPG, PNG, and WebP image formats are permitted.");
    }

    // Security check: Validate file size limit (max 5MB)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
        throw new Error("File size exceeds the 5MB upload limit.");
    }

    // Sanitize extension to prevent extension spoofing or path traversal
    const rawExt = file.name?.split('.').pop() || 'png';
    const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '');
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    const safeExt = allowedExts.includes(cleanExt) ? cleanExt : 'png';

    const filename = `${crypto.randomUUID()}.${safeExt}`;
    const path = `${tenantId}/${kind}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('business-media')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || `image/${safeExt}`,
      });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('business-media').getPublicUrl(path);
    return data.publicUrl;
  },

  /** Deletes a previously uploaded file, given the path portion of its public URL. */
  async remove(tenantId, kind, filename) {
    const { error } = await supabase.storage
      .from('business-media')
      .remove([`${tenantId}/${kind}/${filename}`]);
    if (error) throw error;
  },
};
