export interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
}

export interface MergeState {
  isMerging: boolean;
  error: string | null;
  resultUrl: string | null;
  downloadName: string;
}

export interface GeminiState {
  isGeneratingName: boolean;
  error: string | null;
}
