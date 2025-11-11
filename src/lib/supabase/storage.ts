// src/lib/supabase/storage.ts
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient();
const BUCKET_NAME = 'chart_uploads';

/**
 * Uploads an array of files to a user-specific folder in Supabase Storage.
 * @param files - An array of File objects to upload.
 * @param userId - The ID of the user from the form (used as a fallback).
 * @returns An array of objects, each containing either a `publicUrl` or an `error`.
 */
export async function uploadChartImages(
  files: File[], 
  userId: string // We still accept this, but will prefer the session ID
): Promise<{ publicUrl: string | null; error: any }[]> {
  
  // --- NEW: Explicitly check for an active session ---
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Error getting session:', sessionError);
    // Return an error for each file
    return files.map(() => ({ publicUrl: null, error: 'Auth session error' }));
  }

  if (!session) {
    console.error('No active session found for upload.');
    // Return a clear error for each file
    return files.map(() => ({ publicUrl: null, error: 'User not authenticated' }));
  }
  // --- END NEW ---

  // Use the session's user ID for security. This is the *real* user.
  const sessionUserId = session.user.id;

  const uploadPromises = files.map(async (file) => {
    const fileExt = file.name.split('.').pop();
    // Use the session user ID to build the path
    const filePath = `${sessionUserId}/${uuidv4()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      return { publicUrl: null, error };
    }

    // Get the public URL for the newly uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return { publicUrl, error: null };
  });

  return Promise.all(uploadPromises);
}
