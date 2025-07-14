import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { headers } from 'next/headers';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!serviceAccount) {
  throw new Error('Firebase service account key is not set in environment variables.');
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminAuth = getAdminAuth();

const getInitialUser = async () => {
  const idToken = headers().get('Authorization')?.split('Bearer ')[1];

  if (!idToken) {
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const user = await adminAuth.getUser(decodedToken.uid);
    // We need to shape this to match the FirebaseUser type for the client
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      // Add other fields as needed, with default values if they don't exist
      // This is a simplified version for demonstration
      providerData: [],
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      }
    } as any; // Cast to any to bypass strict type checking for this adapter
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
};

export { adminAuth as auth, getInitialUser };
