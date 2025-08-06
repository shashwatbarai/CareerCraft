import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import type { UploadedFile } from '@/types/careercraft';

export const useFileUpload = () => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload only PDF files.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB.",
        variant: "destructive"
      });
      return;
    }

    const uploadedFileData: UploadedFile = {
      file,
      filename: file.name
    };

    setUploadedFile(uploadedFileData);
    
    toast({
      title: "Resume Uploaded",
      description: `${file.name} uploaded successfully.`,
      variant: "default"
    });
  }, [toast]);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
  }, []);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    handleFileUpload(files[0]);
  }, [handleFileUpload]);

  return {
    uploadedFile,
    isDragOver,
    setIsDragOver,
    handleFileUpload,
    handleRemoveFile,
    handleFileChange
  };
};