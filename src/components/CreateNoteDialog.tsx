'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Note } from '@/types';
import { summarizeText } from '@/ai/flows/summarize-text';
import { summarizeImagePdf } from '@/ai/flows/summarize-image-pdf';
import { ScrollArea } from './ui/scroll-area';

interface CreateNoteDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (note: Note) => void;
  noteToEdit?: Note;
}

export function CreateNoteDialog({ isOpen, setIsOpen, onSave, noteToEdit }: CreateNoteDialogProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'upload'>('text');
  const [title, setTitle] = useState('');
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (noteToEdit) {
        setTitle(noteToEdit.title);
        setInputText(noteToEdit.originalText);
        setSummary(noteToEdit.summary);
        setActiveTab(noteToEdit.type === 'text' ? 'text' : 'upload');
      } else {
        setTitle('');
        setInputText('');
        setFile(null);
        setSummary('');
        setActiveTab('text');
      }
    }
  }, [noteToEdit, isOpen]);
  
  const handleGenerateSummary = () => {
    startTransition(async () => {
      setSummary('');
      try {
        if (activeTab === 'text') {
          if (!inputText.trim()) {
            toast({ title: 'Error', description: 'Please enter some text to summarize.', variant: 'destructive' });
            return;
          }
          const result = await summarizeText({ text: inputText });
          setSummary(result.summary);
        } else {
          if (!file) {
            toast({ title: 'Error', description: 'Please upload a file to summarize.', variant: 'destructive' });
            return;
          }
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = async () => {
            const dataUri = reader.result as string;
            try {
              const result = await summarizeImagePdf({ fileDataUri: dataUri });
              setInputText(`Content from file: ${file.name}`);
              setSummary(result.summary);
            } catch (error) {
              console.error(error);
              toast({ title: 'Error summarizing file', description: 'An issue occurred while processing the file. Please try again.', variant: 'destructive' });
            }
          };
        }
      } catch (error) {
        console.error(error);
        toast({ title: 'Error generating summary', description: 'The AI model could not generate a summary. Please try again.', variant: 'destructive' });
      }
    });
  };
  
  const handleSave = () => {
    if (!summary) {
        toast({ title: 'Error', description: 'Please generate a summary before saving.', variant: 'destructive' });
        return;
    }

    const finalTitle = title.trim() || inputText.split(' ').slice(0, 5).join(' ') || 'Untitled Note';
    
    const note: Note = {
      id: noteToEdit?.id || crypto.randomUUID(),
      title: finalTitle,
      originalText: inputText,
      summary: summary,
      timestamp: noteToEdit?.timestamp || Date.now(),
      type: activeTab,
      fileUrl: file ? URL.createObjectURL(file) : noteToEdit?.fileUrl,
    };
    onSave(note);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{noteToEdit ? 'Edit Note' : 'Create Note'}</DialogTitle>
          <DialogDescription>
            {noteToEdit ? 'Update your note details.' : 'Add a new note by typing text or uploading a file.'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="grid gap-4 py-4 pr-6">
              <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title for your note (optional)" />
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'text' | 'upload')}>
                  <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text" disabled={!!noteToEdit && noteToEdit.type !== 'text'}>Text Input</TabsTrigger>
                      <TabsTrigger value="upload" disabled={!!noteToEdit && noteToEdit.type !== 'upload'}>File Upload</TabsTrigger>
                  </TabsList>
                  <TabsContent value="text" className="mt-4">
                      <Textarea 
                          placeholder="Type or paste your note here..." 
                          className="min-h-[150px]"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                      />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-4">
                      <Input 
                          id="file" 
                          type="file" 
                          accept=".png, .jpg, .jpeg, .pdf"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                       <p className="text-xs text-muted-foreground mt-1">Supported formats: PNG, JPG, PDF.</p>
                  </TabsContent>
              </Tabs>
              
              <Button onClick={handleGenerateSummary} disabled={isPending}>
                  {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Summary
              </Button>
              
              {summary && (
                  <div className="mt-4 rounded-md border bg-muted/50 p-4">
                      <h4 className="font-semibold mb-2">Generated Summary:</h4>
                      <p className="text-sm">{summary}</p>
                  </div>
              )}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!summary || isPending}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
