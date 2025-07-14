// src/services/storage.ts
'use server';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Uploads a file to Firebase Storage and returns its public URL.
 * @param file The file to upload.
 * @param userId The ID of the user uploading the file.
 * @returns The public URL of the uploaded file.
 */
export async function uploadFileAndGetURL(file: File, userId: string): Promise<string> {
  if (!file || !userId) {
    throw new Error('File and user ID are required for upload.');
  }

  // Create a unique path for the file to prevent overwrites
  const filePath = `user-uploads/${userId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);

  // Upload the file
  const snapshot = await uploadBytes(storageRef, file);
  
  // Get the public download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}
