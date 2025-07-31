"use client";
import React, { useState } from "react";
import ImagePreview from "./ImagePreview";

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
  { sheet: 1, ranges: [[3, 6], [7, 42], [44, 58], [60, 69], [71, 79], [81, 86], [88, 94], [96, 103], [105, 122], [123, 128]] },
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

      handleProcess(hardcodedSheetConfigs);
    } else {
      setStep(3);
    }
  };

  return (
    <div className="p-4">
      {/* STEP 1: Upload */}
      {step === 1 && (
        <div
          style={{
            border: "2px dashed #ccc",
            padding: "20px",
            textAlign: "center",
            cursor: "pointer",
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) handleFileDrop(f);
          }}
        >
          Drag & Drop Excel File Here
        </div>
      )}

      {/* STEP 2: Select Sheets */}
      {step === 2 && (
        <div>
          <h3 className="text-lg font-bold mb-2">Select Sheets:</h3>
          {sheets.map((sheet) => (
            <div key={sheet.index}>
              <input
                type="checkbox"
                checked={sheetConfigs.some((s) => s.index === sheet.index)}
                onChange={() => toggleSheetSelection(sheet)}
                disabled={useTestData}
              />
              <label className="ml-2">{sheet.name}</label>
            </div>
          ))}

          <div className="mt-4">
            <input
              type="checkbox"
              id="testData"
              checked={useTestData}
              onChange={() => setUseTestData(!useTestData)}
            />
            <label htmlFor="testData" className="ml-2">
              Use test data (bypass manual input)
            </label>
          </div>

          <button
            onClick={handleNext}
            disabled={!useTestData && sheetConfigs.length === 0}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        </div>
      )}

      {/* STEP 3: Configure */}
      {step === 3 && (
        <div>
          <h3 className="text-lg font-bold mb-4">Configure Each Sheet:</h3>
          {sheetConfigs.map((sheet) => (
            <div key={sheet.index} className="border p-4 mb-4 rounded">
              <h4 className="font-bold mb-2">{sheet.name}</h4>
              <div className="mb-2">
                <label className="block">Columns (e.g., C:J):</label>
                <input
                  type="text"
                  value={sheet.columns}
                  onChange={(e) =>
                    setSheetConfigs((prev) =>
                      prev.map((s) =>
                        s.index === sheet.index ? { ...s, columns: e.target.value } : s
                      )
                    )
                  }
                  className="border p-2 w-full"
                />
              </div>
              {sheet.assets.map((asset, idx) => (
                <div key={idx} className="mb-2">
                  <h5>Asset {idx + 1}</h5>
                  <input
                    type="number"
                    value={asset.start}
                    onChange={(e) =>
                      setSheetConfigs((prev) =>
                        prev.map((s) => {
                          if (s.index === sheet.index) {
                            const updatedAssets = [...s.assets];
                            updatedAssets[idx].start = Number(e.target.value);
                            return { ...s, assets: updatedAssets };
                          }
                          return s;
                        })
                      )
                    }
                    className="border p-1 mr-2"
                    placeholder="Start row"
                  />
                  <input
                    type="number"
                    value={asset.end}
                    onChange={(e) =>
                      setSheetConfigs((prev) =>
                        prev.map((s) => {
                          if (s.index === sheet.index) {
                            const updatedAssets = [...s.assets];
                            updatedAssets[idx].end = Number(e.target.value);
                            return { ...s, assets: updatedAssets };
                          }
                          return s;
                        })
                      )
                    }
                    className="border p-1"
                    placeholder="End row"
                  />
                </div>
              ))}
            </div>
          ))}

          <button
            onClick={() => handleProcess(sheetConfigs)}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Process
          </button>
        </div>
      )}

      {/* STEP 4: Preview */}
      {step === 4 && <ImagePreview imageUrls={images} />}

      {/* ✅ Progress Bar */}
      {loading && (
        <div className="mt-6">
          <p className="text-center mb-2">{status}</p>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center mt-1">{progress}%</p>
        </div>
      )}
    </div>
  );
}
