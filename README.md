# Ajaia Docs — AI-Native Collaborative Document Studio

> A lightweight, responsive, and robust collaborative document editor inspired by Google Docs and Notion. Engineered for high-velocity teams to author, collaborate, import documents, and leverage intelligent agentic workflows.

Built for the **Ajaia AI-Native Full Stack Developer** technical assessment.

---

## 🌟 Highlights & Core Features

### 1. Document Creation & Rich-Text Editing
- **Interactive Formatting Engine**: Built on the headless ProseMirror / Tiptap core.
  - **Styles**: Bold (`Ctrl+B`), Italic (`Ctrl+I`), Underline (`Ctrl+U`), Code, Blockquotes.
  - **Structure**: Headings (H1, H2, H3), Bulleted Lists, Numbered Lists.
  - **History**: Full Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`) with keyboard shortcuts.
- **Inline Title Renaming**: Click the document title in the header to rename with debounced live persistence.
- **Auto-save & Status**: Visual indicator (`Saving to cloud...` / `All changes saved`) with 600ms debounce.
- **Live Stats**: Word count, character count, and estimated reading time.
- **Multi-Format Export**: One-click export to **Markdown (.md)**, **Print-Ready PDF (.pdf)**, standalone **HTML (.html)**, and **Plain Text (.txt)** with `@media print` layout formatting.

### 2. File Upload & Ingestion (.md, .docx, .txt)
- **Document Conversion**: Upload `.md`, `.docx`, or `.txt` via the dashboard modal to instantly generate a formatted editable document.
- **In-Document Attachments**: Dedicated side-drawer on each document allowing users to attach supplementary reference files (PDFs, mockups, spreadsheets) with download links.

### 3. Collaboration & Role-Based Access Control (RBAC)
- **Simulated Persona Switcher**: Seamlessly switch between three seeded team members right from the UI:
  - **Alice Chen** — Product Lead (Owner of Strategy Roadmap)
  - **Bob Martinez** — Senior AI Engineer (Editor on Roadmap, Owner of Tech Specs)
  - **Charlie Davis** — Client Partner (Viewer on Roadmap)
- **Permission Enforcement**:
  - **Owner**: Full edit, delete, and sharing management rights.
  - **Editor**: Can modify document content and title; cannot delete or change access.
  - **Viewer**: Read-only access; editor is locked with an amber banner, and API rejects write attempts with `403 Forbidden`.
- **Sharing Dialog**: Document owners can grant collaborator access, toggle permissions between `Editor` and `Viewer`, or revoke access.
- **Categorized Dashboard**: Separate tabs for *All Documents*, *My Documents* (owned), and *Shared with Me*.

### 4. Persistence
- **Relational SQLite Store**: Modeled via Prisma ORM for zero-config, portable data persistence.
- **Schema**:
  - `User`: Identity, avatars, roles.
  - `Document`: Titles, HTML content, ProseMirror JSON state, timestamps.
  - `DocumentShare`: Document-to-user role assignments (`EDITOR` / `VIEWER`).
  - `Attachment`: Associated file metadata and download paths.
- Preserves formatting across server restarts and browser reloads.

### 5. Ajaia AI Writing Copilot (Ajaia Differentiator)
- Tailored directly to Ajaia's mission as an AI product studio.
- Features:
  - **Executive Summary**: Synthesizes document into core objectives and strategic impact.
  - **Action Items & Next Steps**: Extracts checklists and milestones.
  - **Tone Polish**: Elevates sentence flow and professional clarity.
  - **Strategic Expansion**: Outlines technical and architectural considerations.
- One-click **"Insert into Doc"** or **"Copy to Clipboard"**.

---

## 🏗️ Architecture & Engineering Decisions

### What Was Prioritized & Why:
1. **Full-Stack Next.js 15 (App Router)**: Single cohesive TypeScript repository unifying backend API handlers, server-side data fetching, and interactive React client components.
2. **Headless Tiptap over Basic ContentEditable**: Avoids browser-inconsistent `document.execCommand` flaws, ensuring clean HTML/JSON serialization and flawless Markdown import.
3. **Vanilla CSS Design System**: Crafted custom CSS variables, glassmorphic cards, and sleek dark mode without relying on bloated generic component libraries.
4. **Strict Server-Side Authorization**: Permissions are checked both in the UI (disabling buttons and canvas) and strictly at the API layer (`/api/documents/[id]` returns HTTP 403 if a viewer sends a PUT request).
5. **Instant Persona Switcher**: In a 30-minute review, setting up real OAuth accounts creates unnecessary friction. A single-click persona switcher cookie allows reviewers to test multi-user sharing in seconds.

---

## 🚀 Quick Setup & Run Instructions

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Installation
```bash
git clone <repo-url>
cd "Ajaia assessment"
npm install
```

### 2. Database Setup & Seeding
```bash
# Push schema to SQLite and generate client
npx prisma db push

# Seed initial personas and sample documents
npm run db:seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Tests
```bash
npm run test
```
Executes the Vitest test suite covering:
- Markdown and text parsing utilities.
- Role-based permission logic (Owner vs Editor vs Viewer vs Unauthorized).

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🌐 Deployment Guide

### Vercel (Recommended)
1. Push this repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. For cloud persistence on Vercel, switch `provider = "sqlite"` to Postgres (such as **Vercel Postgres**, **Supabase**, or **Neon**) in `prisma/schema.prisma` and set `DATABASE_URL`.
4. Deploy with 1-click.

### Docker
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
COPY . .
RUN npm ci && npx prisma db push && npm run db:seed && npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## 🧪 Testing the User Flows (Reviewer Guide)

1. **Test Editing & Auto-Save**:
   - Open the default document *"Ajaia AI Product Roadmap & Vision 2026"*.
   - Edit text, test formatting shortcuts (Bold, Italic, Underline, Headings).
   - Observe the `"Saving to cloud..."` indicator turning into `"All changes saved"`.
   - Refresh the browser — content is fully preserved.

2. **Test File Ingestion**:
   - On the dashboard, click **"Import File"**.
   - Select `samples/quarterly_strategy.md` or `samples/ai_workflow_spec.txt`.
   - The file is parsed into a new document and opens in the editor with intact headings and lists.

3. **Test Role-Based Sharing**:
   - As **Alice** (Owner), open the Roadmap document and click **Share**.
   - Notice Bob has `Editor` access, and Charlie has `Viewer` access.
   - Use the persona switcher in the top right to switch to **Charlie Davis**.
   - Notice the amber banner: *"You have view-only permissions for this document. Editing is disabled."*
   - Attempting an API update as Charlie returns `403 Forbidden`.

4. **Test AI Copilot**:
   - Open any document and click **AI Copilot**.
   - Click **"Generate Executive Summary"**.
   - Click **"Insert in Doc"** to inject the AI analysis into the document.

5. **Test Document Export**:
   - Click the **"Export"** dropdown button in the header.
   - Click **"Markdown (.md)"** to download the document as a clean formatted `.md` file.
   - Click **"PDF Document (.pdf)"** to preview or save a print-optimized PDF with clean margins.
