"use client";

import React from "react";
import Link from "next/link";
import { FileText, Paperclip, Trash2 } from "lucide-react";

export interface DocumentItem {
  id: string;
  title: string;
  contentHtml: string;
  ownerId: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  sharedRole?: "EDITOR" | "VIEWER";
  _count?: {
    attachments: number;
  };
}

interface DocumentCardProps {
  document: DocumentItem;
  currentUserId: string;
  onDelete?: (id: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  currentUserId,
  onDelete,
}) => {
  const isOwner = document.ownerId === currentUserId;
  const previewText = document.contentHtml
    ? document.contentHtml.replace(/<[^>]*>/g, " ").trim().slice(0, 140)
    : "No text content yet...";

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${document.title}"?`)) {
      onDelete?.(document.id);
    }
  };

  return (
    <Link href={`/doc/${document.id}`} className="doc-card">
      <div>
        <div className="doc-card-top">
          <div className="doc-icon-box">
            <FileText size={20} />
          </div>
          <div>
            {isOwner ? (
              <span className="badge badge-owner">Owner</span>
            ) : document.sharedRole === "EDITOR" ? (
              <span className="badge badge-editor">Editor</span>
            ) : (
              <span className="badge badge-viewer">Viewer</span>
            )}
          </div>
        </div>

        <h3 className="doc-card-title">{document.title || "Untitled Document"}</h3>
        <p className="doc-card-preview">{previewText || "Empty document"}</p>
      </div>

      <div className="doc-card-footer">
        <div className="doc-card-meta">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={document.owner.avatar}
            alt={document.owner.name}
            className="doc-card-avatar"
            title={`Owner: ${document.owner.name}`}
          />
          <span>{timeAgo(document.updatedAt)}</span>
          {(document._count?.attachments ?? 0) > 0 && (
            <span
              style={{ display: "flex", alignItems: "center", gap: 3 }}
              title={`${document._count?.attachments} attachment(s)`}
            >
              <Paperclip size={12} />
              {document._count?.attachments}
            </span>
          )}
        </div>

        {isOwner && onDelete && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: "4px 8px", color: "var(--danger)" }}
            onClick={handleDelete}
            title="Delete document"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </Link>
  );
};
