"use client";
import React, { useState, useRef } from "react";
import ImagePreview from "./ImagePreview";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useDarkMode } from "@/contexts/DarkModeContext";
import styles from "./UploadZone.module.css";

interface SheetInfo {
  index: number;
  name: string;
}

interface SheetConfig {
  index: number;
  name: string;
  columns: string;
  assetCount: number;
  assets: { start: number; end: number }[];
}

const hardcodedRanges = [
  { sheet: 1, ranges: [[1, 6], [7, 42], [44, 58], [60, 69], [71, 79], [81, 86], [88, 94], [96, 103], [105, 122], [123, 128]] },
  { sheet: 2, ranges: [[6, 15], [17, 29], [31, 38]] },
];

export default function UploadZone() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [sheetConfigs, setSheetConfigs] = useState<SheetConfig[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [useTestData, setUseTestData] = useState(false);

  // ✅ NEW: Track progress bar state
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("");

  // ✅ NEW: Track add assets mode
  const [isAddingAssets, setIsAddingAssets] = useState(false);
  const [addAssetsFile, setAddAssetsFile] = useState<File | null>(null);
  const [originalJobId, setOriginalJobId] = useState<string | null>(null);

  // File input ref for click to browse functionality
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dark mode context
  const { isDark } = useDarkMode();

  const resetState = () => {
    setStep(1);
    setFile(null);
    setSheets([]);
    setSheetConfigs([]);
    setImages([]);
    setLoading(false);
    setUseTestData(false);
    setProgress(0);
    setStatus("");
    setIsAddingAssets(false);
    setAddAssetsFile(null);
    setOriginalJobId(null);
  };

  const handleFileDrop = async (droppedFile: File) => {
    setFile(droppedFile);
    setLoading(true);
    setProgress(0);
    setStatus("Inspecting file...");

    const formData = new FormData();
    formData.append("file", droppedFile);

    const response = await fetch("http://localhost:8000/inspect-excel/", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setSheets(data.sheets);
    setLoading(false);
    setStep(2);
  };

  const handleFileSelect = (selectedFile: File) => {
    handleFileDrop(selectedFile);
  };

  const handleUploadZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartOver = async (newFile: File) => {
    // Reset all state
    resetState();
    
    // Process the new file
    await handleFileDrop(newFile);
  };

  const handleAddAssets = async (newFile: File) => {
    // Start add assets configuration flow
    setAddAssetsFile(newFile);
    setIsAddingAssets(true);
    setLoading(true);
    setProgress(0);
    setStatus("Inspecting additional file...");

    const formData = new FormData();
    formData.append("file", newFile);

    // First inspect the new file
    const inspectResponse = await fetch("http://localhost:8000/inspect-excel/", {
      method: "POST",
      body: formData,
    });

    const inspectData = await inspectResponse.json();
    setSheets(inspectData.sheets);
    setLoading(false);
    setStep(2); // Go to sheet selection step
  };

  const handleAddPngs = async (pngFiles: File[]) => {
    if (!originalJobId) return;

    setLoading(true);
    setProgress(0);
    setStatus("Uploading PNG files...");

    const formData = new FormData();
    formData.append("existing_job_id", originalJobId);
    
    // Add each PNG file to the form data
    pngFiles.forEach((file, index) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("http://localhost:8000/add-pngs/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Get the new image URLs from the backend response
        // The backend returns the complete updated images array
        const allImageUrls = data.images.map((url: string) => `http://localhost:8000${url}`);
        console.log("allImageUrls", allImageUrls)
        setImages(allImageUrls);
        setLoading(false);
        setProgress(100);
        setStatus(`Added ${data.added_count} PNG files`);
        
        // Clear status after a few seconds
        setTimeout(() => {
          setStatus("");
          setProgress(0);
        }, 2000);
      } else {
        setLoading(false);
        setStatus("Error uploading PNG files");
      }
    } catch (error) {
      setLoading(false);
      setStatus("Error uploading PNG files");
      console.error("Error uploading PNGs:", error);
    }
  };

  const handleProcessAddAssets = async (configSheets: SheetConfig[]) => {
    if (!addAssetsFile || !originalJobId) return;

    setLoading(true);
    setProgress(0);
    setStatus("Processing additional assets...");

    const config = { sheets: configSheets };

    const formData = new FormData();
    formData.append("file", addAssetsFile);
    formData.append("config", JSON.stringify(config));
    formData.append("existing_job_id", originalJobId);

    const response = await fetch("http://localhost:8000/add-assets/", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    const jobId = data.job_id;

    // Monitor progress
    const ws = new WebSocket(`ws://localhost:8000/progress/${jobId}`);
    
    ws.onmessage = (event) => {
      const progressData = JSON.parse(event.data);
      setProgress(progressData.percent);
      setStatus(progressData.step);
      
      if (progressData.percent >= 100 && progressData.images) {
        // The backend now returns all images (existing + new)
        const urls = progressData.images.map((url: string) => `http://localhost:8000${url}`);
        console.log("urls", urls)
        setImages(urls);
        setLoading(false);
        setProgress(0);
        setStatus("");
        
        // Reset add assets mode and go back to preview
        setIsAddingAssets(false);
        setAddAssetsFile(null);
        setStep(4);
        ws.close();
      }
    };

    ws.onerror = () => {
      setLoading(false);
      setStatus("Error processing additional assets");
    };
  };

  const toggleSheetSelection = (sheet: SheetInfo) => {
    setSheetConfigs((prev) => {
      const exists = prev.find((s) => s.index === sheet.index);
      if (exists) {
        return prev.filter((s) => s.index !== sheet.index);
      } else {
        return [
          ...prev,
          { index: sheet.index, name: sheet.name, columns: "C:J", assetCount: 1, assets: [{ start: 1, end: 10 }] },
        ];
      }
    });
  };

  const handleProcess = async (configSheets: SheetConfig[]) => {
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setStatus("Starting process...");

    const config = { sheets: configSheets };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("config", JSON.stringify(config));

    const response = await fetch("http://localhost:8000/process-excel/", {
      method: "POST",
      body: formData,
    });

    const { job_id } = await response.json();
    
    // Store the job ID for future add assets operations
    setOriginalJobId(job_id);

    const ws = new WebSocket(`ws://localhost:8000/progress/${job_id}`);
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setProgress(update.percent);
      setStatus(update.step);

      if (update.percent >= 100 && update.images) {
        const urls = update.images.map((url: string) => `http://localhost:8000${url}`);
        setImages(urls);
        setStep(4);
        setLoading(false);
        ws.close();
      }
    };
  };

  const handleNext = () => {
    if (useTestData) {
      const hardcodedSheetConfigs = hardcodedRanges.map((sheetData) => ({
        index: sheetData.sheet,
        name: `Sheet ${sheetData.sheet}`,
        columns: "C:J",
        assetCount: sheetData.ranges.length,
        assets: sheetData.ranges.map(([start, end]) => ({ start, end })),
      }));
      if (isAddingAssets) {
        handleProcessAddAssets(hardcodedSheetConfigs);
      } else {
        handleProcess(hardcodedSheetConfigs);
      }
    } else {
      setStep(3);
    }
  };

  return (
    <div className={`${styles.container} ${isDark ? 'dark' : ''}`}>
      {/* Hidden file input for click to browse */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) {
            handleFileSelect(selectedFile);
          }
        }}
        style={{ display: "none" }}
      />

      {/* STEP 1: Upload */}
      {step === 1 && (
        <div
          className={styles.uploadZone}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) handleFileDrop(f);
          }}
          onClick={handleUploadZoneClick}
        >
          <div className={styles.uploadText}>📄 Drag & Drop Excel File Here</div>
          <div className={styles.uploadSubtext}>or click to browse files</div>
        </div>
      )}

      {/* STEP 2: Select Sheets */}
      {step === 2 && (
        <div className={styles.sheetSelection}>
          <h3 className={styles.sheetTitle}>
            {isAddingAssets ? "Select Sheets to Add:" : "Select Sheets:"}
          </h3>
          <div className={styles.sheetList}>
            {sheets.map((sheet) => (
              <div key={sheet.index} className={styles.sheetItem}>
                <input
                  type="checkbox"
                  className={styles.sheetCheckbox}
                  checked={sheetConfigs.some((s) => s.index === sheet.index)}
                  onChange={() => toggleSheetSelection(sheet)}
                  disabled={useTestData}
                />
                <label className={styles.sheetLabel}>{sheet.name}</label>
              </div>
            ))}
          </div>

          <div className={styles.testDataToggle}>
            <input
              type="checkbox"
              id="testData"
              className={styles.testDataCheckbox}
              checked={useTestData}
              onChange={() => setUseTestData(!useTestData)}
            />
            <label htmlFor="testData" className={styles.testDataLabel}>
              Use test data (bypass manual input)
            </label>
          </div>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!useTestData && sheetConfigs.length === 0}
            loading={loading}
          >
            Next
          </Button>
        </div>
      )}

      {/* STEP 3: Configure */}
      {step === 3 && (
        <div className={styles.configuration}>
          <h3 className={styles.configTitle}>
            {isAddingAssets ? "Configure Additional Sheets:" : "Configure Each Sheet:"}
          </h3>
          {sheetConfigs.map((sheet) => (
            <div key={sheet.index} className={styles.sheetConfig}>
              <h4 className={styles.sheetConfigTitle}>{sheet.name}</h4>
              
              {/* Columns Configuration */}
              <div className={styles.inputGroup}>
                <Input
                  label="Columns (e.g., C:J)"
                  value={sheet.columns}
                  onChange={(e) =>
                    setSheetConfigs((prev) =>
                      prev.map((s) =>
                        s.index === sheet.index ? { ...s, columns: e.target.value } : s
                      )
                    )
                  }
                  placeholder="C:J"
                />
              </div>

              {/* Asset Count Configuration */}
              <div className={styles.inputGroup}>
                <Input
                  type="number"
                  label="Number of Assets"
                  value={sheet.assetCount === 0 ? '' : sheet.assetCount}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Allow empty input for better UX
                    if (inputValue === '') {
                      setSheetConfigs((prev) =>
                        prev.map((s) => {
                          if (s.index === sheet.index) {
                            // Show 1 asset form when empty
                            return { ...s, assetCount: 0, assets: [{ start: 1, end: 10 }] };
                          }
                          return s;
                        })
                      );
                    } else {
                      const newCount = Math.max(1, Math.min(20, parseInt(inputValue) || 1));
                      setSheetConfigs((prev) =>
                        prev.map((s) => {
                          if (s.index === sheet.index) {
                            // Create or trim assets array based on new count
                            const newAssets = [];
                            for (let i = 0; i < newCount; i++) {
                              if (i < s.assets.length) {
                                newAssets.push(s.assets[i]);
                              } else {
                                newAssets.push({ start: 1, end: 10 });
                              }
                            }
                            return { ...s, assetCount: newCount, assets: newAssets };
                          }
                          return s;
                        })
                      );
                    }
                  }}
                  placeholder="1"
                  helperText="Enter a number between 1 and 20"
                />
              </div>

              {/* Dynamic Asset Range Inputs */}
              <div className={styles.assetsContainer}>
                <h5 className={styles.assetsTitle}>Asset Ranges:</h5>
                {sheet.assets.slice(0, sheet.assetCount === 0 ? 1 : sheet.assetCount).map((asset, idx) => (
                  <div key={idx} className={styles.assetGroup}>
                    <h6 className={styles.assetTitle}>Asset {idx + 1}</h6>
                    <div className={styles.assetInputs}>
                      <Input
                        type="number"
                        value={asset.start === 0 ? '' : asset.start}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const newValue = inputValue === '' ? 0 : parseInt(inputValue) || 0;
                          setSheetConfigs((prev) =>
                            prev.map((s) => {
                              if (s.index === sheet.index) {
                                const updatedAssets = [...s.assets];
                                updatedAssets[idx].start = newValue;
                                return { ...s, assets: updatedAssets };
                              }
                              return s;
                            })
                          );
                        }}
                        placeholder="Start row"
                        size="small"
                        label="Start Row"
                      />
                      <Input
                        type="number"
                        value={asset.end === 0 ? '' : asset.end}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const newValue = inputValue === '' ? 0 : parseInt(inputValue) || 0;
                          setSheetConfigs((prev) =>
                            prev.map((s) => {
                              if (s.index === sheet.index) {
                                const updatedAssets = [...s.assets];
                                updatedAssets[idx].end = newValue;
                                return { ...s, assets: updatedAssets };
                              }
                              return s;
                            })
                          );
                        }}
                        placeholder="End row"
                        size="small"
                        label="End Row"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button
            variant="success"
            onClick={() => isAddingAssets ? handleProcessAddAssets(sheetConfigs) : handleProcess(sheetConfigs)}
            loading={loading}
          >
            {isAddingAssets ? "Add Assets" : "Process"}
          </Button>
        </div>
      )}

      {/* STEP 4: Preview */}
      {step === 4 && (
        <ImagePreview 
          imageUrls={images} 
          onStartOver={handleStartOver}
          onAddAssets={handleAddAssets}
          onAddPngs={handleAddPngs}
        />
      )}

      {/* ✅ Progress Modal */}
      {loading && (
        <div className={styles.progressOverlay}>
          <div className={styles.progressModal}>
            <div className={styles.progressContent}>
              <h3 className={styles.progressTitle}>Processing...</h3>
              <p className={styles.progressStatus}>{status}</p>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className={styles.progressText}>{progress}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
