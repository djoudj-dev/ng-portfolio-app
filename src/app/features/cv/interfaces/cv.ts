export interface CvMetadata {
  id: string;
  userId: string;
  fileName: string;
  originalName?: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  version: string | null;
  downloadCount: number;
  createdAt: string;
}

export interface UploadCvResponse {
  path: string;
}