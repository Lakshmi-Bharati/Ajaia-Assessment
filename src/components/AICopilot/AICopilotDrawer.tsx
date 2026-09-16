"use client";

import React, { useState } from "react";
import { Sparkles, X, FileText, CheckSquare, Wand2, PlusCircle, Check, Copy } from "lucide-react";

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  getDocumentText: () => string;
  onInsertContent: (html: string) => void;
  canEdit: boolean;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  documentTitle,
  getDocumentText,
  onInsertContent,
  canEdit,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const runAIAction = async (action: string) => {
    const text = getDocumentText();
    if (!text || text.trim().length === 0) {
      setResult("Document is currently empty. Please write some notes or content first!");
      return;
    }

    setLoadingAction(action);
    setResult(null);

    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text,
          documentTitle,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.result);
      } else {
        setResult("AI assistant encountered an error. Please try again.");
      }
    } catch (err) {
      console.error("AI error", err);
      setResult("Failed to connect to AI assistant.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (!result) return;
    // Format simple markdown into HTML
    const formattedHtml = result
      .split("\n\n")
      .map((block) => `<p>${block.replace(/\n/g, "<br/>")}</p>`)
      .join("");
    onInsertContent(formattedHtml);
    onClose();
  };

  return (
    <div className="side-drawer" style={{ width: 380 }}>
      <div className="side-drawer-header">
        <div className="side-drawer-title">
          <Sparkles size={18} color="#d946ef" />
          Ajaia AI Writing Copilot
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
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
          Intelligent agentic assistant to speed up document drafting, executive summaries, and action extraction.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          <button
            type="button"
            className="ai-action-btn"
            onClick={() => runAIAction("summarize")}
            disabled={!!loadingAction}
          >
            <FileText size={16} color="#6366f1" />
            <span>Generate Executive Summary</span>
          </button>

          <button
            type="button"
            className="ai-action-btn"
            onClick={() => runAIAction("action_items")}
            disabled={!!loadingAction}
          >
            <CheckSquare size={16} color="#10b981" />
            <span>Extract Action Items & Next Steps</span>
          </button>

          <button
            type="button"
            className="ai-action-btn"
            onClick={() => runAIAction("polish")}
            disabled={!!loadingAction}
          >
            <Wand2 size={16} color="#f59e0b" />
            <span>Improve Tone, Flow & Clarity</span>
          </button>

          <button
            type="button"
            className="ai-action-btn"
            onClick={() => runAIAction("expand")}
            disabled={!!loadingAction}
          >
            <Sparkles size={16} color="#d946ef" />
            <span>Expand Strategic Scope</span>
          </button>
        </div>

        {loadingAction && (
          <div
            style={{
              padding: "24px 16px",
              textAlign: "center",
              background: "rgba(99, 102, 241, 0.05)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                border: "3px solid rgba(99, 102, 241, 0.2)",
                borderTopColor: "var(--accent-primary)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
              Analyzing document context...
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {result && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>
                AI GENERATED OUTPUT
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="btn btn-secondary"
                  style={{ padding: "3px 8px", fontSize: 11 }}
                >
                  {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                {canEdit && (
                  <button
                    type="button"
                    onClick={handleInsert}
                    className="btn btn-primary"
                    style={{ padding: "3px 8px", fontSize: 11 }}
                  >
                    <PlusCircle size={12} />
                    Insert in Doc
                  </button>
                )}
              </div>
            </div>

            <div className="ai-result-box">{result}</div>
          </div>
        )}
      </div>
    </div>
  );
};
