'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Note } from '@/types';
import { NoteCard } from '@/components/NoteCard';
import { CreateNoteDialog } from '@/components/CreateNoteDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getUserNotes, createNote, updateNote, deleteNote } from '@/services/notes';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | undefined>(undefined);
  const [userId, setUserId] = useState<string | null>(null);

  const auth = getAuth(app);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setNotes([]);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const fetchNotes = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const userNotes = await getUserNotes(userId);
      setNotes(userNotes);
    } catch (error) {
      toast({ title: "Error fetching notes", description: "Could not retrieve your notes.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.originalText.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [notes, searchQuery]);

  const handleCreateNote = () => {
    setNoteToEdit(undefined);
    setCreateDialogOpen(true);
  };
  
  const handleEditNote = (note: Note) => {
    setNoteToEdit(note);
    setCreateDialogOpen(true);
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
      toast({ title: "Note Deleted", description: "Your note has been successfully deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete the note.", variant: "destructive" });
    }
  };
  
  const handleSaveNote = async (note: Omit<Note, 'id'> & { id?: string }) => {
    if (!userId) {
      toast({ title: "Error", description: "You must be logged in to save a note.", variant: "destructive" });
      return;
    }
    
    try {
      if (note.id) { // Update existing note
        const noteId = note.id;
        const noteDataToUpdate = { ...note };
        delete noteDataToUpdate.id; // Don't update the id field
        await updateNote(noteId, noteDataToUpdate);
        await fetchNotes(); // Refetch to get updated list
        toast({ title: "Note Updated", description: "Your note has been successfully updated." });
      } else { // Create new note
        await createNote(userId, note);
        await fetchNotes(); // Refetch to get the new note
        toast({ title: "Note Created", description: "Your new note has been saved." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save the note.", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">My Notes</h1>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search notes..."
              className="w-full max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateNote} className="flex items-center gap-2 shrink-0">
            <PlusCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Create Note</span>
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => handleEditNote(note)}
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8">
          <div className="flex flex-col items-center gap-1 text-center p-8">
            <h3 className="text-2xl font-bold tracking-tight font-headline">You have no notes</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No notes match your search." : "Start by creating a new note."}
            </p>
            <Button className="mt-4" onClick={handleCreateNote}>Create Note</Button>
          </div>
        </div>
      )}

      <CreateNoteDialog
        isOpen={isCreateDialogOpen}
        setIsOpen={setCreateDialogOpen}
        onSave={handleSaveNote}
        noteToEdit={noteToEdit}
      />
    </>
  );
}
