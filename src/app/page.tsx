"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  UploadCloud,
  Search,
  FolderLock,
  Share2,
  Layers,
  Sparkles,
} from "lucide-react";
import { UserSwitcher, UserPersona } from "@/components/UserSwitcher/UserSwitcher";
import { DocumentCard, DocumentItem } from "@/components/Dashboard/DocumentCard";
import { ImportModal } from "@/components/Dashboard/ImportModal";
import "@/styles/dashboard.css";

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserPersona | null>(null);
  const [ownedDocs, setOwnedDocs] = useState<DocumentItem[]>([]);
  const [sharedDocs, setSharedDocs] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "owned" | "shared">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.currentUser);
        setOwnedDocs(data.ownedDocuments || []);
        setSharedDocs(data.sharedDocuments || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleCreateDocument = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Document",
          contentHtml: "<p></p>",
        }),
      });

      const data = await res.json();
      if (res.ok && data.document) {
        router.push(`/doc/${data.document.id}`);
      }
    } catch (err) {
      console.error("Failed to create document", err);
      setIsCreating(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOwnedDocs((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  // Filtered documents list based on tab and search
  const displayedDocuments = useMemo(() => {
    let list: DocumentItem[] = [];
    if (activeTab === "all") {
      list = [...ownedDocs, ...sharedDocs];
    } else if (activeTab === "owned") {
      list = ownedDocs;
    } else {
      list = sharedDocs;
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (doc) =>
        doc.title.toLowerCase().includes(q) ||
        doc.contentHtml.toLowerCase().includes(q) ||
        doc.owner.name.toLowerCase().includes(q)
    );
  }, [activeTab, ownedDocs, sharedDocs, searchQuery]);

  return (
    <main className="dashboard-container">
      {/* Top Header */}
      <header className="dashboard-header">
        <div className="brand-section">
          <div className="brand-logo-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="brand-title">Ajaia Docs</div>
            <div className="brand-tagline">AI-Native Collaborative Document Studio</div>
          </div>
        </div>

        <div className="dashboard-actions">
          <UserSwitcher
            currentUser={currentUser}
            onUserChange={() => fetchDocuments()}
          />
        </div>
      </header>

      {/* Hero Quick-Start Banner */}
      <section className="hero-banner">
        <div className="hero-text">
          <h1>Welcome back, {currentUser?.name?.split(" ")[0] || "Team Member"}</h1>
          <p>
            Create documents with rich text formatting, collaborate with team permissions, import
            Markdown or Word docs, and supercharge writing with our integrated AI copilot.
          </p>
        </div>

        <div className="hero-buttons">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsImportModalOpen(true)}
            id="import-doc-btn"
          >
            <UploadCloud size={16} />
            Import File (.md / .docx / .txt)
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateDocument}
            disabled={isCreating}
            id="create-doc-btn"
          >
            <Plus size={16} />
            {isCreating ? "Creating..." : "New Blank Doc"}
          </button>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="controls-bar">
        <div className="tabs-group">
          <button
            type="button"
            className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <Layers size={15} />
            All Documents ({ownedDocs.length + sharedDocs.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "owned" ? "active" : ""}`}
            onClick={() => setActiveTab("owned")}
          >
            <FolderLock size={15} />
            My Documents ({ownedDocs.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "shared" ? "active" : ""}`}
            onClick={() => setActiveTab("shared")}
          >
            <Share2 size={15} />
            Shared with Me ({sharedDocs.length})
          </button>
        </div>

        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search documents by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-secondary)" }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid rgba(99, 102, 241, 0.2)",
              borderTopColor: "var(--accent-primary)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p>Loading documents...</p>
        </div>
      ) : displayedDocuments.length > 0 ? (
        <div className="documents-grid">
          {displayedDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              currentUserId={currentUser?.id || ""}
              onDelete={handleDeleteDocument}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FileText className="empty-state-icon" />
          <h3>No documents found</h3>
          <p>
            {searchQuery
              ? `No documents matching "${searchQuery}".`
              : activeTab === "shared"
              ? "No documents have been shared with your account yet."
              : "Get started by creating a new document or importing one from your disk."}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateDocument}
            style={{ margin: "0 auto" }}
          >
            <Plus size={16} />
            Create Your First Document
          </button>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </main>
  );
}
