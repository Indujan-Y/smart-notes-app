import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 text-primary", className)}>
      <BrainCircuit className="h-7 w-7" />
      <span className="text-xl font-bold font-headline">Smart Scribe</span>
    </div>
  );
}
