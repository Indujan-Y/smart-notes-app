// src/services/notes.ts
'use server';

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Note } from '@/types';

const notesCollection = collection(db, 'notes');
const usersCollection = collection(db, 'users');

export async function createNote(userId: string, noteData: Omit<Note, 'id' | 'timestamp'> & { timestamp?: number }) {
  const newNote = {
    ...noteData,
    userId,
    timestamp: noteData.timestamp || Date.now(),
  };
  // Add the note to the 'notes' collection
  const docRef = await addDoc(notesCollection, newNote);
  
  // Add the new note's ID to the user's 'notes' array
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
    notes: arrayUnion(docRef.id)
  }, { merge: true }); // Use merge to avoid overwriting the user document if it doesn't exist

  return { ...newNote, id: docRef.id };
}

export async function getUserNotes(userId: string): Promise<Note[]> {
  const q = query(notesCollection, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
}

export async function updateNote(noteId: string, noteData: Partial<Note>) {
  const noteRef = doc(db, 'notes', noteId);
  await updateDoc(noteRef, noteData);
}

export async function deleteNote(userId: string, noteId: string) {
  // Delete the note document
  const noteRef = doc(db, 'notes', noteId);
  await deleteDoc(noteRef);

  // Remove the note's ID from the user's 'notes' array
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
      notes: arrayRemove(noteId)
  });
}
