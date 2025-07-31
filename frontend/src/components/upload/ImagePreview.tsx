"use client";
import React, { useState, useEffect } from "react";
import styles from "./ImagePreview.module.css";

interface ImagePreviewProps {
  imageUrls?: string[];
}

export default function ImagePreview({ imageUrls = [] }: ImagePreviewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (imageUrls.length > 0) {
      setSelectedImage(imageUrls[0]);
    }
  }, [imageUrls]);

  if (imageUrls.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "16px", color: "#9ca3af" }}>
        No previews available yet
      </div>
    );
  }

  return (
    <div className={styles.fullscreenContainer}>
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
            <p style={{ textAlign: "center", fontSize: "12px", color: "#6b7280" }}>
              Page {index + 1}
            </p>
          </div>
        ))}
      </div>

      {/* Main Preview */}
      <div className={styles.mainPreview}>
        {selectedImage && <img src={selectedImage} alt="Selected Preview" />}
      </div>
    </div>
  );
}
