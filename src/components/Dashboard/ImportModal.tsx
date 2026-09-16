"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const validExts = [".txt", ".md", ".markdown", ".docx"];
    const name = selectedFile.name.toLowerCase();
    const isValid = validExts.some((ext) => name.endsWith(ext));

    if (!isValid) {
      setError("Supported file types are: .txt, .md, .docx");
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to import document");
      }

      onClose();
      router.push(`/doc/${data.document.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload error");
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-sm)",
                background: "rgba(99, 102, 241, 0.15)",
                color: "#818cf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UploadCloud size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Import Document</h3>
              <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                Convert an existing file into an editable document
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: "4px 8px" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragging ? "var(--accent-primary)" : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-md)",
              padding: "32px 20px",
              textAlign: "center",
              background: isDragging ? "rgba(99, 102, 241, 0.08)" : "rgba(255, 255, 255, 0.02)",
              cursor: "pointer",
              position: "relative",
              transition: "all var(--transition-fast)",
            }}
          >
            <input
              type="file"
              accept=".txt,.md,.markdown,.docx"
              onChange={handleFileChange}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: "pointer",
              }}
            />
            <div
              style={{
                width: 48,
                height: 48,
                margin: "0 auto 12px",
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.1)",
                color: "var(--accent-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UploadCloud size={24} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              Click or drag file to import
            </p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              Supported formats: <strong>.txt</strong>, <strong>.md</strong>, <strong>.docx</strong>
            </p>
          </div>

          {file && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 16,
                padding: "10px 14px",
                background: "rgba(99, 102, 241, 0.08)",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
              }}
            >
              <FileText size={20} color="var(--accent-primary)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {file.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
              <CheckCircle2 size={16} color="var(--success)" />
            </div>
          )}

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 16,
                padding: "10px 14px",
                background: "var(--danger-bg)",
                borderRadius: "var(--radius-md)",
                color: "#f87171",
                fontSize: 13,
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? "Importing..." : "Convert & Open Document"}
          </button>
        </div>
      </div>
    </div>
  );
};
