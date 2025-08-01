"use client";
import React, { useState, useEffect } from "react";
import StartOverModal from "./StartOverModal";
import { useDarkMode } from "@/contexts/DarkModeContext";
import styles from "./ImagePreview.module.css";

interface ImagePreviewProps {
  imageUrls?: string[];
  onStartOver?: (file: File) => void;
}

export default function ImagePreview({ imageUrls = [], onStartOver }: ImagePreviewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showStartOverModal, setShowStartOverModal] = useState(false);

  // Dark mode context
  const { isDark } = useDarkMode();

  useEffect(() => {
    if (imageUrls.length > 0) {
      setSelectedImage(imageUrls[0]);
    }
  }, [imageUrls]);

  const handleStartOver = () => {
    setShowStartOverModal(true);
  };

  const handleFileSelect = (file: File) => {
    if (onStartOver) {
      onStartOver(file);
    }
  };

  // Don't render anything if there are no images
  if (imageUrls.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`${styles.container} ${isDark ? 'dark' : ''}`}>
        {/* Preview Header */}
        <div className={styles.previewHeader}>
          <h3 className={styles.previewTitle}>
          🖼️ PNG Preview ({imageUrls.length} assets)
          </h3>
          <div className={styles.previewControls}>
            <button className={styles.startOverButton} onClick={handleStartOver}>
              <span className={styles.startOverIcon}>🔄</span>
              Start Over
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className={styles.previewContent}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            {imageUrls.map((url, index) => (
              <div
                key={index}
                className={`${styles.thumbnail} ${
                  selectedImage === url ? styles.selected : ""
                }`}
                onClick={() => setSelectedImage(url)}
              >
                <img src={url} alt={`Thumbnail ${index + 1}`} />
                <p className={styles.thumbnailLabel}>
                  Asset {index + 1}
                </p>
              </div>
            ))}
          </div>

          {/* Main Preview */}
          <div className={styles.mainPreview}>
            {selectedImage && <img src={selectedImage} alt="Selected Preview" />}
          </div>
        </div>
      </div>

      {/* Start Over Modal */}
      <StartOverModal
        isOpen={showStartOverModal}
        onClose={() => setShowStartOverModal(false)}
        onFileSelect={handleFileSelect}
      />
    </>
  );
}
