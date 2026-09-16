"use client";

import React, { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Paperclip,
  Sparkles,
  Lock,
  Clock,
  AlertCircle,
} from "lucide-react";
import { UserSwitcher, UserPersona } from "@/components/UserSwitcher/UserSwitcher";
import { TiptapEditor } from "@/components/Editor/TiptapEditor";
import { ShareModal } from "@/components/Sharing/ShareModal";
import { AttachmentPanel, AttachmentItem } from "@/components/Attachments/AttachmentPanel";
import { AICopilotDrawer } from "@/components/AICopilot/AICopilotDrawer";
import { ExportMenu } from "@/components/Editor/ExportMenu";
import { Editor } from "@tiptap/react";
import "@/styles/editor.css";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roleTitle?: string;
}

interface DocumentDetail {
  id: string;
  title: string;
  contentHtml: string;
  contentJson: string;
  ownerId: string;
  updatedAt: string;
  owner: Collaborator;
  shares: Array<{
    id: string;
    userId: string;
    role: string;
    user: Collaborator;
  }>;
  attachments: AttachmentItem[];
}

export default function DocumentStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const docId = resolvedParams.id;

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [userRole, setUserRole] = useState<"OWNER" | "EDITOR" | "VIEWER" | null>(null);
  const [currentUser, setCurrentUser] = useState<UserPersona | null>(null);
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({ words: 0, characters: 0 });

  // Drawer / Modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);

  // Editor instance ref for AI insertion
  const editorInstanceRef = useRef<Editor | null>(null);

  const fetchDocument = async () => {
    try {
      const res = await fetch(`/api/documents/${docId}`);
      const data = await res.json();
      if (res.ok) {
        setDocument(data.document);
        setTitle(data.document.title);
        setUserRole(data.userRole);
        setCurrentUser(data.currentUser);

        // Initial stats
        const text = data.document.contentHtml.replace(/<[^>]*>/g, " ").trim();
        const words = text ? text.split(/\s+/).length : 0;
        setStats({ words, characters: text.length });
      } else {
        setErrorMessage(data.error || "Failed to load document");
      }
    } catch (err) {
      console.error("Error loading document:", err);
      setErrorMessage("An unexpected error occurred while loading this document.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [docId]);

  const canEdit = userRole === "OWNER" || userRole === "EDITOR";
  const isOwner = userRole === "OWNER";

  // Auto-save content handler
  const handleContentChange = async (html: string, json: string) => {
    if (!canEdit) return;

    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentHtml: html,
          contentJson: json,
        }),
      });

      if (res.ok) {
        setSaveStatus("saved");
      }
    } catch (err) {
      console.error("Auto-save failed", err);
    }
  };

  // Title update handler
  const handleTitleBlur = async () => {
    if (!canEdit || !title.trim() || title === document?.title) return;

    setIsSaving(true);
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (res.ok) {
        setSaveStatus("saved");
      }
    } catch (err) {
      console.error("Title save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  // Callback when AI generates content to insert
  const handleInsertAIContent = (htmlContent: string) => {
    if (editorInstanceRef.current && canEdit) {
      editorInstanceRef.current.commands.insertContent(htmlContent);
    }
  };

  const getDocTextForAI = () => {
    if (editorInstanceRef.current) {
      return editorInstanceRef.current.getText();
    }
    return document?.contentHtml ? document.contentHtml.replace(/<[^>]*>/g, " ") : "";
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg-primary)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(99, 102, 241, 0.2)",
            borderTopColor: "var(--accent-primary)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            marginBottom: 16,
          }}
        />
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Opening document studio...</p>
      </div>
    );
  }

  if (errorMessage || !document) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg-primary)",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--danger-bg)",
            color: "var(--danger)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <AlertCircle size={28} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Access Denied or Not Found</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: 440, marginBottom: 24, lineHeight: 1.5 }}>
          {errorMessage || "You do not have permission to access this document."}
        </p>
        <Link href="/" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="editor-layout">
      {/* Top Sticky Header */}
      <header className="editor-header">
        <div className="editor-header-left">
          <Link href="/" className="back-btn" title="Back to documents dashboard" id="back-to-dashboard-btn">
            <ArrowLeft size={18} />
          </Link>

          <div className="doc-title-wrapper">
            <input
              type="text"
              className="doc-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              disabled={!canEdit}
              title={canEdit ? "Click to rename document" : "Document title"}
              placeholder="Document Title"
              id="doc-title-input"
            />
            <div className="save-status-badge">
              <span className={`save-status-dot ${saveStatus === "saving" ? "saving" : ""}`} />
              <span>
                {saveStatus === "saving"
                  ? "Saving to cloud..."
                  : isSaving
                  ? "Saving..."
                  : "All changes saved"}
              </span>
            </div>
          </div>
        </div>

        <div className="editor-header-right">
          {/* Active Collaborators */}
          <div className="collaborators-group" title="Document Collaborators">
            {/* Owner avatar */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={document.owner.avatar}
              alt={document.owner.name}
              className="collab-avatar"
              title={`Owner: ${document.owner.name}`}
            />
            {/* Shared users */}
            {document.shares.slice(0, 3).map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.id}
                src={s.user.avatar}
                alt={s.user.name}
                className="collab-avatar"
                title={`${s.user.name} (${s.role})`}
              />
            ))}
          </div>

          {/* Attachments drawer button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setIsAttachmentsOpen(!isAttachmentsOpen);
              setIsAICopilotOpen(false);
            }}
            title="View or upload file attachments"
            id="attachments-btn"
          >
            <Paperclip size={15} />
            Attachments ({document.attachments?.length || 0})
          </button>

          {/* AI Writing Copilot button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setIsAICopilotOpen(!isAICopilotOpen);
              setIsAttachmentsOpen(false);
            }}
            style={{
              borderColor: "rgba(217, 70, 239, 0.3)",
              background: "rgba(217, 70, 239, 0.08)",
            }}
            title="Ajaia AI Writing Assistant"
            id="ai-copilot-btn"
          >
            <Sparkles size={15} color="#d946ef" />
            AI Copilot
          </button>

          {/* Export Menu button */}
          <ExportMenu
            documentTitle={title}
            getDocumentHtml={() =>
              editorInstanceRef.current
                ? editorInstanceRef.current.getHTML()
                : document.contentHtml
            }
          />

          {/* Share button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsShareModalOpen(true)}
            id="share-btn"
          >
            <Share2 size={15} />
            Share
          </button>

          {/* User persona switcher */}
          <UserSwitcher
            currentUser={currentUser}
            onUserChange={() => fetchDocument()}
          />
        </div>
      </header>

      {/* Read-only notification if Viewer */}
      {!canEdit && (
        <div className="readonly-banner">
          <Lock size={15} />
          <span>You have view-only permissions for this document. Editing is disabled.</span>
        </div>
      )}

      {/* Editor & Side Drawers */}
      <div className="editor-main">
        <TiptapEditor
          initialContent={document.contentHtml}
          canEdit={canEdit}
          onContentChange={handleContentChange}
          onStatsChange={setStats}
          editorRef={editorInstanceRef}
        />

        {/* Attachments Drawer */}
        <AttachmentPanel
          documentId={docId}
          attachments={document.attachments || []}
          isOpen={isAttachmentsOpen}
          onClose={() => setIsAttachmentsOpen(false)}
          canEdit={canEdit}
          onAttachmentUploaded={(newAtt) => {
            setDocument((prev) =>
              prev ? { ...prev, attachments: [newAtt, ...(prev.attachments || [])] } : prev
            );
          }}
          onAttachmentDeleted={(deletedId) => {
            setDocument((prev) =>
              prev ? { ...prev, attachments: (prev.attachments || []).filter((a) => a.id !== deletedId) } : prev
            );
          }}
        />

        {/* AI Copilot Drawer */}
        <AICopilotDrawer
          isOpen={isAICopilotOpen}
          onClose={() => setIsAICopilotOpen(false)}
          documentTitle={title}
          getDocumentText={getDocTextForAI}
          onInsertContent={handleInsertAIContent}
          canEdit={canEdit}
        />
      </div>

      {/* Word Count / Status Footer */}
      <footer className="editor-footer">
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span>{stats.words} words</span>
          <span>•</span>
          <span>{stats.characters} characters</span>
          <span>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={12} />
            {Math.max(1, Math.ceil(stats.words / 200))} min read
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span>
            Role: <strong style={{ color: "var(--text-primary)" }}>{userRole}</strong>
          </span>
        </div>
      </footer>

      {/* Share Modal */}
      <ShareModal
        documentId={docId}
        documentTitle={title}
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          fetchDocument();
        }}
        isOwner={isOwner}
      />
    </div>
  );
}
