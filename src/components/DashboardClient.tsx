
'use client';

import { useState, useMemo, useCallback, useEffect, useTransition } from 'react';
import type { Note } from '@/types';
import { NoteCard } from '@/components/NoteCard';
import { CreateNoteDialog } from '@/components/CreateNoteDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createNote, updateNote, getUserNotes } from '@/services/notes';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { uploadFileAndGetURL } from '@/services/storage';

export function DashboardClient() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | undefined>(undefined);

  const { toast } = useToast();

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userNotes = await getUserNotes(user.uid);
      setNotes(userNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({ title: "Error fetching notes", description: "Could not retrieve your notes.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.originalText && note.originalText.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [notes, searchQuery]);

  const handleCreateNote = () => {
    setNoteToEdit(undefined);
    setCreateDialogOpen(true);
  };

  const handleSaveNote = async (note: Omit<Note, 'id'> & { id?: string }, file?: File | null) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save notes.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    
    try {
      let fileUrl = note.fileUrl || undefined;

      // If there's a new file, upload it and get the URL
      if (file) {
        fileUrl = await uploadFileAndGetURL(file, user.uid);
      }

      const noteToSave = { ...note, fileUrl };

      if (note.id) {
        const noteId = note.id;
        const noteDataToUpdate = { ...noteToSave };
        delete noteDataToUpdate.id; 
        await updateNote(noteId, noteDataToUpdate);
        toast({ title: "Note Updated", description: "Your note has been successfully updated." });
      } else {
        await createNote(user.uid, noteToSave);
        toast({ title: "Note Created", description: "Your new note has been saved." });
      }
      await fetchNotes(); // Refetch notes
    } catch (error) {
      console.error("Failed to save note:", error);
      toast({ title: "Error", description: "Failed to save the note.", variant: "destructive" });
    } finally {
      setIsSaving(false);
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
        isSaving={isSaving}
      />
    </>
  );
}
