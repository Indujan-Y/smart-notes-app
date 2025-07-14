// src/services/users.ts
'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  avatarUrl?: string;
};

export async function createUserProfile(user: { uid: string; email: string | null; name?: string }) {
  if (!user.email) {
    throw new Error("User email is required to create a profile.");
  }
  const userRef = doc(db, 'users', user.uid);
  const newUserProfile: UserProfile = {
    uid: user.uid,
    email: user.email,
    name: user.name || user.email.split('@')[0], // Default name from email
  };
  await setDoc(userRef, newUserProfile);
  return newUserProfile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
}
