
'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FileText, Type } from 'lucide-react';
import type { Note } from '@/types';
import Image from 'next/image';
import { format } from 'date-fns';

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Link href={`/dashboard/notes/${note.id}`} className="flex">
      <Card className="flex flex-col w-full hover:shadow-lg transition-shadow duration-300">
        {note.type === 'upload' && note.fileUrl && (
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
            <CardTitle className="font-headline text-lg line-clamp-2">{note.title}</CardTitle>
          </div>
          <CardDescription className="flex items-center gap-2 text-xs pt-1">
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
          <Accordion type="single" collapsible className="w-full" onClick={(e) => e.preventDefault()}>
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
    </Link>
  );
}
