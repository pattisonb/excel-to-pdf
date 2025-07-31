import { useState } from "react";

export default function useUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);

    // TEMP: Show fake image preview for now
    // Later: Generate real preview from backend
    setPreviewUrl("/placeholder.png");
  };

  return { file, previewUrl, handleFileSelect };
}
