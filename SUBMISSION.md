# Ajaia Assessment Submission Package

**Candidate**: Full Stack Developer (AI-Native)  
**Project**: Ajaia Docs — Lightweight Collaborative Document Studio  
**Date**: September 2026  

---

## 📦 What is Included in this Submission

| File / Artifact | Description |
| :--- | :--- |
| **`/src` & Source Code** | Complete full-stack Next.js 15 TypeScript application with Prisma, SQLite, Tiptap, and custom Vanilla CSS. |
| **`README.md`** | Detailed setup instructions, feature overview, and testing guide. |
| **`ARCHITECTURE_NOTE.md`** | Technical architecture breakdown, system diagrams, and design trade-offs. |
| **`AI_WORKFLOW_NOTE.md`** | Explanation of AI tools used, acceleration points, rejected AI outputs, and verification. |
| **`SUBMISSION.md`** | (This document) Submission checklist, credentials, and feature status. |
| **`walkthrough_video_url.txt`** | Direct link to the 3–5 minute recorded video walkthrough. |
| **`/samples`** | Ready-to-use sample markdown and plain-text files for testing file import. |
| **`/tests`** | Automated Vitest test suite with 100% pass rate. |

---

## 🌐 Live Deployment & Repository Links

- **GitHub Repository URL**: [https://github.com/Lakshmi-Bharati/Ajaia-Assessment](https://github.com/Lakshmi-Bharati/Ajaia-Assessment)
- **Live Product URL**: [https://ajaia-assessment-iblu.vercel.app/](https://ajaia-assessment-iblu.vercel.app/)
- **Walkthrough Video**: [https://drive.google.com/file/d/1F7vcRSxkFmLqXeZn-A9ry3halq-VzL_M/view?usp=sharing](https://drive.google.com/file/d/1F7vcRSxkFmLqXeZn-A9ry3halq-VzL_M/view?usp=sharing)

---

## 👥 Seeded Users & Test Credentials

The application includes an **Instant Persona Switcher** located in the top-right header. You do not need to register or remember passwords. Simply click the user avatar to switch roles instantly:

1. **Alice Chen** (`alice@ajaia.ai`) — **Product Lead**
   - *Permissions*: Document Owner on *"Ajaia AI Product Roadmap & Vision 2026"*. Full edit, delete, and sharing control.
2. **Bob Martinez** (`bob@ajaia.ai`) — **Senior AI Engineer**
   - *Permissions*: Shared **Editor** on the Roadmap document; Owner of the *"Architecture Specs"* document. Can edit content and rename.
3. **Charlie Davis** (`charlie@ajaia.ai`) — **Client Partner**
   - *Permissions*: Shared **Viewer** on the Roadmap document. View-only access (canvas locked, write operations return `HTTP 403 Forbidden`).

---

## 💻 Quick Local Run Instructions

```bash
# 1. Install dependencies
npm install

# 2. Synchronize database and seed test accounts
npx prisma db push
npm run db:seed

# 3. Start development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:3000

# 5. Run automated test suite
npm run test
```

---

## 🔍 Feature Status & Quality Matrix

### ✅ What is Working End-to-End
1. **Document Creation & Editing**:
   - Create new blank documents from dashboard or hero banner.
   - Rich-text editor powered by Tiptap (ProseMirror): Bold, Italic, Underline, Headings (H1/H2/H3), Bullet Lists, Numbered Lists, Blockquotes, Code.
   - Inline title editing with debounced reactive persistence.
   - Auto-save engine with visual status indicator (*"Saving to cloud..."* / *"All changes saved"*).
   - Live word count, character count, and reading time calculation.
2. **File Upload & Ingestion**:
   - Import `.md`, `.docx`, or `.txt` directly from the dashboard; parses markdown AST into structured rich text and creates a new editable doc.
   - Dedicated in-document **Attachments drawer** to upload and download reference assets (PDFs, images, sheets).
3. **Sharing & Access Control (RBAC)**:
   - Separate dashboard views: *All Documents*, *My Documents* (owned), and *Shared with Me*.
   - Dynamic Sharing Modal: Grant team members `Editor` or `Viewer` access, change roles, or revoke access.
   - Strict dual-layer enforcement: Viewers see an amber banner and locked editor; direct API calls are blocked with `HTTP 403`.
4. **Multi-Format Export Enhancement**:
   - One-click export to **Markdown (.md)**, **Print-Ready PDF (.pdf)** with `@media print` layout, standalone **HTML (.html)**, and **Plain Text (.txt)**.
5. **Ajaia AI Writing Copilot**:
   - Integrated drawer providing instant Executive Summaries, Action Items, Tone Polishing, and Scope Expansion with 1-click insert into the active document.
6. **Automated Testing**:
   - 8 automated unit/integration tests in Vitest covering RBAC permissions, file ingestion, and markdown sanitization.

---

### ⏳ What Was Intentionally Deprioritized
- **Full Operational Transformation / CRDTs (WebSockets / Yjs)**: Live multi-cursor presence was deprioritized within the timebox to avoid race-condition sync bugs; replaced with a clean debounced auto-save model.
- **Third-Party OAuth (Google/GitHub/Auth0)**: Omitted to prevent reviewer signup friction; implemented cookie-backed persona switching instead.

---

### 🔮 What I Would Build Next (With 2–4 Additional Hours)
1. **Document Version History & Rollback**:
   - Timeline slider showing snapshots of changes with one-click restoration of prior revisions.
2. **Inline Commenting & Suggestion Mode**:
   - Ability to highlight text, leave threaded discussion comments, and toggle a Google Docs-style "Suggesting" mode.
3. **Live Presence Avatars**:
   - Server-Sent Events (SSE) to display who is currently viewing or actively editing the document.
