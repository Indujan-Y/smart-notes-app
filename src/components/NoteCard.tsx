'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from './ui/button';
import { MoreHorizontal, FileText, Type, Trash2, Edit } from 'lucide-react';
import type { Note } from '@/types';
import Image from 'next/image';
import { format } from 'date-fns';

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
      {note.type === 'file' && note.fileUrl && (
        <div className="relative h-40 w-full">
            <Image 
                src={note.fileUrl} 
                alt={note.title} 
                fill
                className="rounded-t-lg object-cover"
                data-ai-hint="document receipt"
            />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="font-headline text-lg">{note.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="flex items-center gap-2 text-xs">
          {note.type === 'text' ? (
            <Type className="h-3 w-3" />
          ) : (
            <FileText className="h-3 w-3" />
          )}
          <span>{format(new Date(note.timestamp), "MMM d, yyyy")}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground/80 line-clamp-4">{note.summary}</p>
      </CardContent>
      <CardFooter>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger>View Original</AccordionTrigger>
            <AccordionContent>
              <div className="max-h-48 overflow-y-auto rounded-md bg-muted/50 p-2 text-sm text-muted-foreground">
                <pre className="whitespace-pre-wrap font-sans">{note.originalText}</pre>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardFooter>
    </Card>
  );
}
