# Architecture & Technical Decision Note

> **Product**: Ajaia Docs — AI-Native Collaborative Document Studio  
> **Prepared for**: Ajaia Technical Evaluation  

---

## 1. System Architecture Overview

Ajaia Docs is engineered as a unified full-stack web application built on **Next.js 15 (App Router)** and **TypeScript**, leveraging **SQLite via Prisma ORM** for persistent local data integrity and **Tiptap (ProseMirror)** for rich-text state handling.

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router                    │
├──────────────────────────────┬──────────────────────────────┤
│    Frontend Client Layer     │     Backend Server Layer     │
│  - Document Studio & Canvas  │  - /api/documents (CRUD)     │
│  - Tiptap / ProseMirror Core │  - /api/documents/:id/share  │
│  - Simulated Persona Switcher│  - /api/upload (MD/DOCX/TXT) │
│  - Sharing & Access Dialog   │  - /api/documents/:id/attach │
│  - AI Writing Copilot Drawer │  - /api/ai/assist (Prompts)  │
│  - Multi-Format Export Menu  │  - /api/users (Directory)    │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
      [State / Autosave]              [Prisma ORM Client]
               │                              │
               └───────────────┬──────────────┘
                               ▼
                    SQLite Database (dev.db)
```

---

## 2. Key Architectural Decisions & Rationale

### 1. Headless Tiptap / ProseMirror vs. Browser `contentEditable`
- **Why**: Browser-native `contentEditable` with `execCommand` is notoriously inconsistent across browsers and produces unpredictable, messy markup.
- **Decision**: Tiptap provides a structured, headless Abstract Syntax Tree (AST). It models documents as a predictable node hierarchy, enabling clean serialization to both JSON (for structure) and HTML/Markdown (for export and persistence).

### 2. SQLite with Prisma ORM
- **Why**: Ajaia's reviewers need to run or inspect the project without configuring cloud infrastructure or database credentials.
- **Decision**: SQLite provides a zero-config, portable relational database that commits directly to the local disk and survives all refreshes. Prisma provides strict TypeScript schema definitions, cascading deletions, and instant migrations. In production, switching from SQLite to PostgreSQL (Vercel Postgres, Supabase, Neon) requires changing only one line in `schema.prisma`.

### 3. Dual-Layer Role-Based Access Control (RBAC)
- **Why**: Client-only authorization is easily bypassed.
- **Decision**: 
  - *Presentation Layer*: Non-editing personas (Viewers) see an amber read-only banner, the canvas is locked, and formatting buttons are disabled.
  - *Data Layer*: Every mutating API route (`PUT /api/documents/[id]`, `DELETE`, `POST .../share`) verifies the caller's role directly against `DocumentShare` and `Document.ownerId`. Viewers attempting write mutations are strictly rejected with `HTTP 403 Forbidden`.

### 4. High-Performance Vanilla CSS Design System
- **Why**: Many candidates rely on standard Tailwind or heavyweight component libraries that introduce CSS bloat and look generic.
- **Decision**: Implemented a custom Vanilla CSS design system using CSS custom properties (`--bg-primary`, `--accent-gradient`, `--border-subtle`), glassmorphism, responsive CSS Grid, and custom `@media print` rules for clean PDF exports.

---

## 3. What Was Intentionally Deprioritized & Why

1. **Full Operational Transformation / CRDTs (Yjs / Live WebSockets)**:
   - *Rationale*: True character-by-character live sync is a multi-week infrastructure problem. Within the assessment timebox, attempting a partial CRDT integration creates race conditions and sync bugs. Instead, we prioritized a rock-solid, 600ms debounced auto-save model with robust role-based sharing and version persistence.
2. **External OAuth / Auth0 Provider**:
   - *Rationale*: Third-party authentication adds signup barriers for reviewers. A simulated persona switcher backed by cookie/header persistence allows reviewers to test multi-user sharing across Alice, Bob, and Charlie in one click.

---

## 4. What Would Be Built Next (With 2–4 Additional Hours)

1. **Document Version History & Rollback**:
   - Save timestamped content snapshots upon major revisions with a visual diff slider to restore earlier drafts.
2. **Inline Comments & Suggestion Mode**:
   - Highlight text ranges to create threaded discussions and track proposed edits for the owner to accept or reject.
3. **Live Presence Indicators**:
   - Lightweight Server-Sent Events (SSE) or WebSocket channel to show active collaborator avatars currently viewing a document.
