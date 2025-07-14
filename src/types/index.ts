export type Note = {
  id: string;
  title: string;
  originalText: string;
  summary: string;
  timestamp: number;
  fileUrl?: string;
  type: 'text' | 'file';
};
