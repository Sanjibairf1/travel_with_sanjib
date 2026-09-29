import { createClient } from '@/lib/supabase';

export async function uploadEditorialImage(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return { error: 'Use a JPG, PNG, or WebP image.' };
  if (file.size > 5 * 1024 * 1024) return { error: 'Use an image smaller than 5 MB.' };
  const supabase = createClient();
  if (!supabase) return { error: 'Supabase is not configured.' };
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('editorial-media').upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: error.message };
  return { url: supabase.storage.from('editorial-media').getPublicUrl(path).data.publicUrl };
}
