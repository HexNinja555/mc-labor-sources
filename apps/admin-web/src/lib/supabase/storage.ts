import { createClient } from './client';

export type StorageBucket = 'documents' | 'signatures' | 'safety-bulletins';

function sb() {
  return createClient();
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function uploadFile(
  bucket: StorageBucket,
  file: File,
  folder = 'uploads',
): Promise<string> {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const path = `${folder}/${Date.now()}-${sanitizeFileName(file.name || `file.${ext}`)}`;

  const { error } = await sb().storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = sb().storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadDataUrl(
  bucket: StorageBucket,
  dataUrl: string,
  fileName: string,
  folder = 'uploads',
): Promise<string> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], fileName, { type: blob.type || 'image/png' });
  return uploadFile(bucket, file, folder);
}

export async function deleteStorageFile(bucket: StorageBucket, fileUrl: string) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = fileUrl.indexOf(marker);
  if (idx === -1) return;
  const path = fileUrl.slice(idx + marker.length);
  const { error } = await sb().storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}
