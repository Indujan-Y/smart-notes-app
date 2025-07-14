// src/services/notes.ts
'use server';

import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import type { Note } from '@/types';

const db = getFirestore(app);
const notesCollection = collection(db, 'notes');

export async function createNote(userId: string, noteData: Omit<Note, 'id' | 'timestamp'> & { timestamp?: number }) {
  const newNote = {
    ...noteData,
    userId,
    timestamp: noteData.timestamp || Date.now(),
  };
  const docRef = await addDoc(notesCollection, newNote);
  return { ...newNote, id: docRef.id };
}

export async function getUserNotes(userId: string): Promise<Note[]> {
  const q = query(notesCollection, where('userId', '==', userId), orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
}

export async function updateNote(noteId: string, noteData: Partial<Note>) {
  const noteRef = doc(db, 'notes', noteId);
  await updateDoc(noteRef, noteData);
}

export async function deleteNote(noteId: string) {
  const noteRef = doc(db, 'notes', noteId);
  await deleteDoc(noteRef);
}
