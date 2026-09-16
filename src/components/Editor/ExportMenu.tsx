"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, FileCode, FileText, Printer, Globe, ChevronDown } from "lucide-react";
import {
  exportDocumentToMarkdown,
  exportDocumentToPdf,
  exportDocumentToHtml,
  exportDocumentToPlainText,
} from "@/lib/export-utils";

interface ExportMenuProps {
  documentTitle: string;
  getDocumentHtml: () => string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  documentTitle,
  getDocumentHtml,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportMarkdown = () => {
    exportDocumentToMarkdown(documentTitle, getDocumentHtml());
    setIsOpen(false);
  };

  const handleExportPdf = () => {
    exportDocumentToPdf();
    setIsOpen(false);
  };

  const handleExportHtml = () => {
    exportDocumentToHtml(documentTitle, getDocumentHtml());
    setIsOpen(false);
  };

  const handleExportText = () => {
    exportDocumentToPlainText(documentTitle, getDocumentHtml());
    setIsOpen(false);
  };

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setIsOpen(!isOpen)}
        title="Export document to Markdown, PDF, HTML, or Text"
        id="export-doc-btn"
        style={{ padding: "8px 12px" }}
      >
        <Download size={15} />
        <span>Export</span>
        <ChevronDown size={13} style={{ color: "var(--text-muted)", marginLeft: 2 }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: 220,
            background: "#0f172a",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            padding: "6px",
            zIndex: 100,
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              padding: "6px 10px",
              letterSpacing: 0.5,
              borderBottom: "1px solid var(--border-subtle)",
              marginBottom: 4,
            }}
          >
            EXPORT AS
          </div>

          <button
            type="button"
            className="user-persona-item"
            style={{ width: "100%", border: "none", background: "transparent", textAlign: "left" }}
            onClick={handleExportMarkdown}
            id="export-md-option"
          >
            <FileCode size={16} color="#818cf8" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                Markdown (.md)
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Standard GitHub markdown</div>
            </div>
          </button>

          <button
            type="button"
            className="user-persona-item"
            style={{ width: "100%", border: "none", background: "transparent", textAlign: "left" }}
            onClick={handleExportPdf}
            id="export-pdf-option"
          >
            <Printer size={16} color="#f43f5e" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                PDF Document (.pdf)
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Formatted print preview</div>
            </div>
          </button>

          <button
            type="button"
            className="user-persona-item"
            style={{ width: "100%", border: "none", background: "transparent", textAlign: "left" }}
            onClick={handleExportHtml}
          >
            <Globe size={16} color="#10b981" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                Web Page (.html)
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Standalone styled HTML</div>
            </div>
          </button>

          <button
            type="button"
            className="user-persona-item"
            style={{ width: "100%", border: "none", background: "transparent", textAlign: "left" }}
            onClick={handleExportText}
          >
            <FileText size={16} color="#e2e8f0" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                Plain Text (.txt)
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Unformatted text file</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
