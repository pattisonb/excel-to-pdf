"use client";
import React, { useRef } from "react";
import Button from "../ui/Button";
import styles from "./AddPngsModal.module.css";

interface AddPngsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (files: File[]) => void;
}

export default function AddPngsModal({ isOpen, onClose, onFileSelect }: AddPngsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === "image/png" || file.name.toLowerCase().endsWith('.png')
    );
    if (files.length > 0) {
      onFileSelect(files);
      onClose();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type === "image/png" || file.name.toLowerCase().endsWith('.png')
    );
    if (files.length > 0) {
      onFileSelect(files);
      onClose();
    }
  };

  const handleUploadZoneClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Add PNGs</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <p className={styles.description}>
            Upload PNG files to add to your existing collection. You can select multiple files at once.
          </p>

          <div className={styles.warning}>
            <span className={styles.warningIcon}>ℹ️</span>
            <p className={styles.warningText}>
              Only PNG files will be accepted. Other file types will be ignored.
            </p>
          </div>

          <div
            className={styles.uploadZone}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={handleUploadZoneClick}
          >
            <div className={styles.uploadText}>🖼️ Drop PNG Files Here</div>
            <div className={styles.uploadSubtext}>or click to browse files (multiple selection allowed)</div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".png"
            multiple
            onChange={handleFileInput}
            style={{ display: "none" }}
          />
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
} 