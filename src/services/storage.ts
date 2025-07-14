// src/services/storage.ts
'use server';

import { adminStorage } from '@/lib/firebase-admin';
import { randomUUID } from 'crypto';

/**
 * Uploads a file to Firebase Storage using the Admin SDK and returns its public URL.
 * @param file The file to upload.
 * @param userId The ID of the user uploading the file.
 * @returns The public URL of the uploaded file.
 */
export async function uploadFileAndGetURL(file: File, userId: string): Promise<string> {
  if (!file || !userId) {
    throw new Error('File and user ID are required for upload.');
  }

  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error('Firebase Storage bucket name is not configured in environment variables.');
  }

  const bucket = adminStorage.bucket(bucketName);
  const filePath = `user-uploads/${userId}/${Date.now()}-${file.name}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const fileUpload = bucket.file(filePath);
  const downloadToken = randomUUID();

  await fileUpload.save(fileBuffer, {
    metadata: {
      contentType: file.type,
      // Generate a unique token for public access
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  });

  // Construct the public URL manually.
  // Note: getSignedUrl is often preferred for private files, but for public access, this is standard.
  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;

  return publicUrl;
}
