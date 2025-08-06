import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import type { UploadedFile } from '@/types/careercraft';

interface ResumeUploadProps {
  onFileUpload: (file: File) => void;
  uploadedFile: UploadedFile | null;
  onRemoveFile: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onFileUpload,
  uploadedFile,
  onRemoveFile
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFileUpload(files[0]);
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileChange(e.dataTransfer.files);
  }, [handleFileChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
  }, [handleFileChange]);

  if (uploadedFile) {
    return (
      <div className="career-section">
        <h2 className="text-xl font-semibold text-foreground mb-4">Resume</h2>
        <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-xl">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-success" />
            <span className="font-medium text-success">{uploadedFile.filename}</span>
          </div>
          <button
            onClick={onRemoveFile}
            className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4 text-destructive" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="career-section">
      <h2 className="text-xl font-semibold text-foreground mb-4">Upload Resume</h2>
      <div
        className={`career-upload-zone ${isDragOver ? 'dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('resume-upload')?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload resume file by clicking or dragging"
      >
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Drop your resume here
        </h3>
        <p className="text-muted-foreground mb-4">
          or click to browse files
        </p>
        <p className="text-sm text-muted-foreground">
          PDF files only • Max 10MB
        </p>
        <input
          id="resume-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
          aria-label="Upload resume file"
        />
      </div>
    </div>
  );
};