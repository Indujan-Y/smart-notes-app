
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import type { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Edit, Trash2, ArrowLeft, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteNote, updateNote } from '@/services/notes';
import { CreateNoteDialog } from '@/components/CreateNoteDialog';

export default function NoteDetailPage() {
  const { noteId } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }

    const fetchNote = async () => {
      setIsLoading(true);
      try {
        const noteRef = doc(db, 'notes', noteId as string);
        const noteSnap = await getDoc(noteRef);

        if (noteSnap.exists() && noteSnap.data().userId === user.uid) {
          setNote({ id: noteSnap.id, ...noteSnap.data() } as Note);
        } else {
          toast({
            title: 'Error',
            description: 'Note not found or you do not have permission to view it.',
            variant: 'destructive',
          });
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Failed to fetch note:", error);
        toast({
          title: 'Error',
          description: 'Could not load the note.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (noteId && user) {
      fetchNote();
    }
  }, [noteId, user, authLoading, router, toast]);

  const handleDelete = async () => {
    if (!note || !user) return;
    setIsDeleting(true);
    try {
      await deleteNote(user.uid, note.id);
      toast({
        title: 'Note Deleted',
        description: 'Your note has been successfully deleted.',
      });
      router.push('/dashboard');
    } catch (error) {
      setIsDeleting(false);
      toast({
        title: 'Error',
        description: 'Failed to delete the note.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveNote = async (noteData: Omit<Note, 'id'> & { id?: string }) => {
     if (!user || !note) {
      toast({ title: "Error", description: "You must be logged in to save notes.", variant: "destructive" });
      return;
    }
    
    try {
      const noteId = note.id;
      const noteToUpdate = { ...noteData };
      delete noteToUpdate.id;
      await updateNote(noteId, noteToUpdate);
      setNote({ ...note, ...noteData }); // Update local state
      toast({ title: "Note Updated", description: "Your note has been successfully updated." });
    } catch (error) {
      console.error("Failed to save note:", error);
      toast({ title: "Error", description: "Failed to save the note.", variant: "destructive" });
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!note) {
    return null; // or a 'not found' component
  }

  return (
    <>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notes
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <CardTitle className="font-headline text-2xl">{note.title}</CardTitle>
                    <CardDescription>
                      Created on {new Date(note.timestamp).toLocaleDateString()}
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    {note.fileUrl && (
                      <a href={note.fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                        </Button>
                      </a>
                    )}
                    <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-sm text-foreground/80">{note.summary}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Original Text</h3>
              <div className="max-h-96 overflow-y-auto rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
                  <pre className="whitespace-pre-wrap font-sans">{note.originalText}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <CreateNoteDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        onSave={handleSaveNote}
        noteToEdit={note}
      />
    </>
  );
}
