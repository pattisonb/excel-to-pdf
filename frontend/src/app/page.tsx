"use client";
import UploadZone from "@/components/upload/UploadZone";
import ImagePreview from "@/components/upload/ImagePreview";
import useUpload from "@/hooks/useUpload";

export default function Home() {
  const { file, previewUrl, handleFileSelect } = useUpload();

  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-6">Excel to PDF Builder</h1>
      <UploadZone onFileSelect={handleFileSelect} />
      <ImagePreview imageUrl={previewUrl} />
    </main>
  );
}
