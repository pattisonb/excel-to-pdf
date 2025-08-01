"use client";
import React, { useRef } from "react";
import Button from "../ui/Button";
import styles from "./StartOverModal.module.css";

interface StartOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
}

export default function StartOverModal({ isOpen, onClose, onFileSelect }: StartOverModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      onFileSelect(file);
      onClose();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
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
          <h2 className={styles.title}>Start Over with New File</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <p className={styles.description}>
            Upload a new Excel file to replace the current one. This will clear all current configurations and start fresh.
          </p>

          <div className={styles.warning}>
            <span className={styles.warningIcon}>⚠️</span>
            <p className={styles.warningText}>
              This action will replace your current file and all configurations. Make sure you have saved any important work.
            </p>
          </div>

          <div
            className={styles.uploadZone}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={handleUploadZoneClick}
          >
            <div className={styles.uploadText}>📄 Drop New Excel File Here</div>
            <div className={styles.uploadSubtext}>or click to browse files</div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
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