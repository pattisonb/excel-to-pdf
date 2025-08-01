"use client";
import UploadZone from "@/components/upload/UploadZone";
import ImagePreview from "@/components/upload/ImagePreview";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import { DarkModeProvider, useDarkMode } from "@/contexts/DarkModeContext";
import useUpload from "@/hooks/useUpload";
import styles from "./page.module.css";

function HomeContent() {
  const { file, previewUrl, handleFileSelect } = useUpload();
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : ''}`}>
      <main className={styles.main}>
        {/* Dark Mode Toggle */}
        <DarkModeToggle isDark={isDark} onToggle={toggleDarkMode} />

        {/* Header */}
        <div className={styles.header}>
          <h1 className={`${styles.title} ${isDark ? styles.dark : ''}`}>
            Excel to PDF Builder
          </h1>
          <p className={`${styles.subtitle} ${isDark ? styles.dark : ''}`}>
            Convert your Excel sheets into professional PDFs with custom page breaks and previews
          </p>
        </div>

        {/* Main Content */}
        <div className={`${styles.contentCard} ${isDark ? styles.dark : ''}`}>
          <UploadZone />
        </div>

        {/* Preview Section - Now integrated into the page flow */}
        <div className={styles.previewSection}>
          <ImagePreview imageUrls={previewUrl ? [previewUrl] : []} />
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <DarkModeProvider>
      <HomeContent />
    </DarkModeProvider>
  );
}
