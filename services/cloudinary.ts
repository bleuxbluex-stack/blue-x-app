import { Platform } from 'react-native';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
}

export async function uploadToCloudinary(
  fileUri: string,
  fileType: 'image' | 'raw' = 'image'
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration missing. Check EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env');
  }

  const filename = fileUri.split('/').pop() || 'document';
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpg';
  const mimeType = fileType === 'image' ? `image/${ext === 'jpg' ? 'jpeg' : ext}` : 'application/octet-stream';

  const formData = new FormData();
  
  if (Platform.OS === 'web') {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    formData.append('file', blob, filename);
  } else {
    formData.append('file', {
      uri: fileUri,
      name: filename,
      type: mimeType,
    } as any);
  }

  formData.append('upload_preset', UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${fileType}/upload`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    format: data.format,
    bytes: data.bytes,
  };
}

export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const str = String(url).trim();
  if (!str) return null;
  // Filter out demo/invalid Cloudinary URLs that cause 404 console errors
  if (
    str.includes('res.cloudinary.com/demo/') ||
    str.includes('v123456789/') ||
    str.includes('IMG_2980') ||
    str.includes('IMG_2981') ||
    str.includes('IMG_3003') ||
    str.includes('changes_1.png')
  ) {
    return null;
  }
  return str;
}

export function getValidProviderImage(url: string | null | undefined): string | null {
  return sanitizeImageUrl(url);
}

