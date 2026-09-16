"use client";

import React, { useState } from "react";
import { X, Paperclip, Upload, Download, File, Trash2, CheckCircle2 } from "lucide-react";

export interface AttachmentItem {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  createdAt: string;
}

interface AttachmentPanelProps {
  documentId: string;
  attachments: AttachmentItem[];
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onAttachmentUploaded: (attachment: AttachmentItem) => void;
}

export const AttachmentPanel: React.FC<AttachmentPanelProps> = ({
  documentId,
  attachments,
  isOpen,
  onClose,
  canEdit,
  onAttachmentUploaded,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/documents/${documentId}/attachments`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.attachment) {
        onAttachmentUploaded(data.attachment);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to upload attachment", err);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="side-drawer">
      <div className="side-drawer-header">
        <div className="side-drawer-title">
          <Paperclip size={18} color="var(--accent-primary)" />
          Document Attachments ({attachments.length})
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

      <div className="side-drawer-body">
        {canEdit && (
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 16px",
                border: "1px dashed var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                background: "rgba(255, 255, 255, 0.02)",
                cursor: isUploading ? "not-allowed" : "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                style={{ display: "none" }}
              />
              <Upload size={22} color="var(--accent-primary)" style={{ marginBottom: 8 }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {isUploading ? "Uploading..." : "Attach a reference file"}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                PDF, images, spreadsheets, briefs
              </span>
            </label>

            {uploadSuccess && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--success)",
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
                <CheckCircle2 size={14} /> File attached successfully!
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {attachments.map((att) => (
            <div
              key={att.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                <File size={18} color="#818cf8" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: "var(--text-primary)",
                    }}
                    title={att.filename}
                  >
                    {att.filename}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {formatBytes(att.fileSize)}
                  </div>
                </div>
              </div>

              <a
                href={att.filePath}
                download={att.filename}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ padding: "6px 8px", marginLeft: 8 }}
                title="Download file"
              >
                <Download size={14} />
              </a>
            </div>
          ))}

          {attachments.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "36px 12px",
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              No attachments yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
