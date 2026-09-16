"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, Users, UserPlus, Trash2, ShieldCheck, Check } from "lucide-react";
import { UserPersona } from "../UserSwitcher/UserSwitcher";

interface ShareItem {
  id: string;
  userId: string;
  role: "VIEWER" | "EDITOR";
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    roleTitle?: string;
  };
}

interface ShareModalProps {
  documentId: string;
  documentTitle: string;
  isOpen: boolean;
  onClose: () => void;
  isOwner: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  documentId,
  documentTitle,
  isOpen,
  onClose,
  isOwner,
}) => {
  const [shares, setShares] = useState<ShareItem[]>([]);
  const [owner, setOwner] = useState<UserPersona | null>(null);
  const [allUsers, setAllUsers] = useState<UserPersona[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"VIEWER" | "EDITOR">("EDITOR");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchShares = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/share`);
      const data = await res.json();
      if (res.ok) {
        setShares(data.shares || []);
        setOwner(data.owner || null);
      }
    } catch (err) {
      console.error("Failed to load shares", err);
    }
  }, [documentId]);

  useEffect(() => {
    if (isOpen) {
      fetchShares();
      // Load all potential users to share with
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          if (data.users) setAllUsers(data.users);
        })
        .catch(console.error);
    }
  }, [isOpen, fetchShares]);

  if (!isOpen) return null;

  // Available users to add (excluding owner and already shared users)
  const availableUsers = allUsers.filter(
    (u) => u.id !== owner?.id && !shares.some((s) => s.userId === u.id)
  );

  const handleAddShare = async () => {
    if (!selectedUserId) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          role: selectedRole,
        }),
      });

      if (res.ok) {
        setSelectedUserId("");
        await fetchShares();
      }
    } catch (err) {
      console.error("Failed to grant share", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "VIEWER" | "EDITOR") => {
    try {
      await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      await fetchShares();
    } catch (err) {
      console.error("Failed to update share role", err);
    }
  };

  const handleRemoveShare = async (userId: string) => {
    try {
      await fetch(`/api/documents/${documentId}/share`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      await fetchShares();
    } catch (err) {
      console.error("Failed to revoke share", err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 540 }}>
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
              <Users size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Share &ldquo;{documentTitle}&rdquo;</h3>
              <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                Manage team collaborator access and permissions
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

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Add collaborator form (only for owner) */}
          {isOwner ? (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <UserPlus size={14} color="var(--accent-primary)" />
                ADD COLLABORATOR
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={{
                    flex: 1,
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "8px 12px",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                  }}
                >
                  <option value="">Select a team member...</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.roleTitle || u.email})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as "VIEWER" | "EDITOR")}
                  style={{
                    width: 110,
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "8px 10px",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                  }}
                >
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                </select>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddShare}
                  disabled={!selectedUserId || isLoading}
                  style={{ padding: "8px 14px", flexShrink: 0 }}
                >
                  Share
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                background: "rgba(255, 255, 255, 0.03)",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              Only the document owner can grant or modify sharing permissions.
            </div>
          )}

          {/* Collaborators List */}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: 12,
                letterSpacing: 0.5,
              }}
            >
              PEOPLE WITH ACCESS
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Owner Item */}
              {owner && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={owner.avatar}
                      alt={owner.name}
                      style={{ width: 34, height: 34, borderRadius: "50%" }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        {owner.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{owner.email}</div>
                    </div>
                  </div>
                  <span className="badge badge-owner">Owner</span>
                </div>
              )}

              {/* Shared Users */}
              {shares.map((share) => (
                <div
                  key={share.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={share.user.avatar}
                      alt={share.user.name}
                      style={{ width: 34, height: 34, borderRadius: "50%" }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        {share.user.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {share.user.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {isOwner ? (
                      <>
                        <select
                          value={share.role}
                          onChange={(e) =>
                            handleRoleChange(share.userId, e.target.value as "VIEWER" | "EDITOR")
                          }
                          style={{
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-sm)",
                            padding: "4px 8px",
                            fontSize: 12,
                            color: "var(--text-primary)",
                          }}
                        >
                          <option value="EDITOR">Editor</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleRemoveShare(share.userId)}
                          style={{ padding: "4px 6px", color: "var(--danger)" }}
                          title="Revoke access"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    ) : (
                      <span
                        className={
                          share.role === "EDITOR" ? "badge badge-editor" : "badge badge-viewer"
                        }
                      >
                        {share.role === "EDITOR" ? "Editor" : "Viewer"}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {shares.length === 0 && (
                <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "4px 8px" }}>
                  Not shared with anyone yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: "space-between" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopyLink}
            style={{ fontSize: 12 }}
          >
            {copiedLink ? <Check size={14} color="var(--success)" /> : <ShieldCheck size={14} />}
            {copiedLink ? "Link Copied!" : "Copy Document Link"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
