"use client";
import React, { useState, useEffect } from "react";
import StartOverModal from "./StartOverModal";
import AddPngsModal from "./AddPngsModal";
import { useDarkMode } from "@/contexts/DarkModeContext";
import styles from "./ImagePreview.module.css";

interface ImagePreviewProps {
  imageUrls?: string[];
  onStartOver?: (file: File) => void;
  onAddAssets?: (file: File) => void;
  onAddPngs?: (files: File[]) => void;
}

export default function ImagePreview({ imageUrls = [], onStartOver, onAddAssets, onAddPngs }: ImagePreviewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showStartOverModal, setShowStartOverModal] = useState(false);
  const [showAddAssetsModal, setShowAddAssetsModal] = useState(false);
  const [showAddPngsModal, setShowAddPngsModal] = useState(false);

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

  const handleAddAssets = () => {
    setShowAddAssetsModal(true);
  };

  const handleAddPngs = () => {
    setShowAddPngsModal(true);
  };

  const handleFileSelect = (file: File) => {
    if (onStartOver) {
      onStartOver(file);
    }
  };

  const handleAddAssetsFileSelect = (file: File) => {
    if (onAddAssets) {
      onAddAssets(file);
    }
  };

  const handleAddPngsFileSelect = (files: File[]) => {
    if (onAddPngs) {
      onAddPngs(files);
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
            📄 PDF Preview ({imageUrls.length} pages)
          </h3>
          <div className={styles.previewControls}>
            <button className={styles.addPngsButton} onClick={handleAddPngs}>
              <span className={styles.addPngsIcon}>🖼️</span>
              Add PNGs
            </button>
            <button className={styles.addAssetsButton} onClick={handleAddAssets}>
              <span className={styles.addAssetsIcon}>➕</span>
              Add Assets
            </button>
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

      {/* Add Assets Modal */}
      <StartOverModal
        isOpen={showAddAssetsModal}
        onClose={() => setShowAddAssetsModal(false)}
        onFileSelect={handleAddAssetsFileSelect}
        title="Add More Assets"
        description="Upload another Excel file to add more assets to your existing collection."
        warningText="This will add new assets to your current collection without replacing existing ones."
      />

              {/* Add PNGs Modal */}
        <AddPngsModal
          isOpen={showAddPngsModal}
          onClose={() => setShowAddPngsModal(false)}
          onFileSelect={handleAddPngsFileSelect}
        />
    </>
  );
}
