'use client';

import { useState, useMemo } from 'react';
import type { Note } from '@/types';
import { NoteCard } from '@/components/NoteCard';
import { CreateNoteDialog } from '@/components/CreateNoteDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Meeting Summary',
    originalText: 'The meeting was about the Q3 roadmap. We discussed the new features for the Smart Scribe app. The main points were to add collaboration, real-time editing, and more export options. The team agreed on the priorities. The deadline is end of Q3.',
    summary: 'Q3 roadmap meeting focused on new Smart Scribe features like collaboration, real-time editing, and more export options, with a deadline set for the end of Q3.',
    timestamp: new Date('2023-10-26T10:00:00Z').getTime(),
    type: 'text',
  },
  {
    id: '2',
    title: 'AI Research Insights',
    originalText: 'Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by humans or animals. Leading AI textbooks define the field as the study of "intelligent agents": any system that perceives its environment and takes actions that maximize its chance of successfully achieving its goals.',
    summary: 'AI, or artificial intelligence, is the study and application of intelligent agents—systems that perceive their environment and act to maximize goal achievement, contrasting with natural intelligence.',
    timestamp: new Date('2023-10-25T14:30:00Z').getTime(),
    type: 'text',
  },
  {
    id: '3',
    title: 'Lunch Receipt Details',
    originalText: 'Receipt from The Good Cafe. Total: $25.50. Items: Sandwich, Coffee.',
    summary: 'Lunch receipt from The Good Cafe totaling $25.50 for a sandwich and coffee.',
    timestamp: new Date('2023-10-27T12:00:00Z').getTime(),
    type: 'file',
    fileUrl: 'https://placehold.co/600x400.png',
  }
];

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | undefined>(undefined);

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

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };
  
  const handleSaveNote = (note: Note) => {
    const existingNoteIndex = notes.findIndex(n => n.id === note.id);
    if (existingNoteIndex > -1) {
      const updatedNotes = [...notes];
      updatedNotes[existingNoteIndex] = note;
      setNotes(updatedNotes);
    } else {
      setNotes([note, ...notes]);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4">
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
      
      {filteredNotes.length > 0 ? (
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
