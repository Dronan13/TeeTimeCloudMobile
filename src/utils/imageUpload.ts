import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabaseClient';

export interface ImageUploadResult {
  uri: string;
  publicUrl: string;
}

/**
 * Pick an image from the device's gallery
 */
export async function pickImageFromGallery(): Promise<string | null> {
  // Request permissions
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    throw new Error('Permission to access gallery is required');
  }

  // Launch image picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
    aspect: [4, 3],
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Upload image to Supabase Storage
 * @param uri - Local file URI
 * @param bucket - Storage bucket name (default: 'support-images')
 * @param folder - Optional folder path within bucket
 */
export async function uploadImageToStorage(
  uri: string,
  bucket: string = 'support-images',
  folder?: string
): Promise<ImageUploadResult> {
  try {
    // Fetch the image as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Generate unique filename
    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: `image/${fileExt}`,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      uri: data.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete image from Supabase Storage
 * @param filePath - Path to file in storage
 * @param bucket - Storage bucket name
 */
export async function deleteImageFromStorage(
  filePath: string,
  bucket: string = 'support-images'
): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Combined function to pick and upload image
 */
export async function pickAndUploadImage(
  bucket: string = 'support-images',
  folder?: string
): Promise<ImageUploadResult | null> {
  const imageUri = await pickImageFromGallery();

  if (!imageUri) {
    return null;
  }

  return await uploadImageToStorage(imageUri, bucket, folder);
}
