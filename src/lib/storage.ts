import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

/** Maximum image dimension (width or height) before compression */
const MAX_IMAGE_SIZE_PX = 1600;
/** Target file size after compression */
const MAX_FILE_SIZE_MB = 1;
/** JPEG quality after compression */
const INITIAL_QUALITY = 0.8;

/**
 * Compresses an image file to reduce upload size and AI processing time.
 * Targets max 1600px dimensions and ~1MB file size.
 */
export async function compressImage(file: File | Blob): Promise<File> {
  const imageFile = file instanceof File ? file : new File([file], 'capture.jpg', { type: 'image/jpeg' });

  const options = {
    maxSizeMB: MAX_FILE_SIZE_MB,
    maxWidthOrHeight: MAX_IMAGE_SIZE_PX,
    initialQuality: INITIAL_QUALITY,
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
  };

  try {
    const compressed = await imageCompression(imageFile, options);
    return compressed;
  } catch (error) {
    console.warn('Image compression failed, using original:', error);
    return imageFile;
  }
}

/**
 * Uploads a food scan image to Supabase Storage.
 * Images are stored in the `food-scans` bucket under `{userId}/{scanId}.jpg`.
 * 
 * @returns The public URL of the uploaded image
 */
export async function uploadScanImage(
  userId: string,
  imageFile: File | Blob
): Promise<string> {
  // Compress before upload
  const compressed = await compressImage(imageFile instanceof File ? imageFile : new File([imageFile], 'capture.jpg', { type: 'image/jpeg' }));
  
  const scanId = crypto.randomUUID();
  const filePath = `${userId}/${scanId}.jpg`;

  const { data, error } = await supabase.storage
    .from('food-scans')
    .upload(filePath, compressed, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload scan image: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('food-scans')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Converts a File/Blob to a base64-encoded string for AI API calls.
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
