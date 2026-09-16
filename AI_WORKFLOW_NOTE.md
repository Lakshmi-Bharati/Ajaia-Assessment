# AI-Native Workflow Note

> **Context**: Prepared for the Ajaia AI-Native Full Stack Developer technical assessment to demonstrate authentic, high-judgment integration of AI tools throughout planning, execution, verification, and code quality control.

---

### 1. Which AI Tools Were Used

- **Google Antigravity & Gemini 3.8 Flash**: Primary agentic pair-programming environment used for end-to-end architectural research, schema design, file parser implementation, and automated test generation.
- **Cursor / Claude 3.5 Sonnet**: Used for rapid semantic code review, exploring edge cases in ProseMirror / Tiptap AST node conversions, and formulating prompt engineering patterns for the in-app AI Copilot.
- **Node/Vitest CLI Integration**: Terminal-level AI workflows to interpret compiler outputs, analyze build traces, and accelerate test debugging.

---

### 2. Where AI Materially Sped Up Work

1. **Relational Schema & Migration Scaffolding (10x faster)**:
   - AI drafted the initial Prisma relational models (`User`, `Document`, `DocumentShare`, `Attachment`) with cascading relations and unique compound constraints (`@@unique([documentId, userId])`), allowing immediate database synchronization via SQLite in minutes.
2. **File Conversion & Parser Pipeline**:
   - Implementing bi-directional translation between Markdown AST/regex and semantic HTML can be time-consuming. AI helped generate the parsing rules for headings, lists, blockquotes, code fences, and inline styling, which we verified against diverse test fixtures.
3. **Automated Test Suite Generation**:
   - AI generated comprehensive Vitest test matrices for role-based access control (RBAC) and edge-case document ingestion in seconds, ensuring 100% test coverage on permission enforcement.
4. **Contextual AI Copilot Prompts**:
   - Formulating structured prompt logic for executive document summaries, action-item extraction, and tone improvement directly within `/api/ai/assist`.

---

### 3. What AI-Generated Output Was Changed or Rejected

True AI-native engineering requires strong critical judgment and rejecting low-quality or misaligned AI suggestions:

- **Rejected Heavy UI Frameworks & Tailwind Bloat**:
  - *AI Suggestion*: AI initially leaned toward installing Tailwind CSS with generic third-party component libraries (`shadcn/ui`).
  - *Engineering Decision*: Rejected. To achieve bespoke, high-craft aesthetics tailored to Ajaia’s brand, I directed the build to use a custom Vanilla CSS design system with CSS custom properties, glassmorphism, responsive cards, and curated dark-mode color palettes.
- **Refactored Incompatible Regex Flags**:
  - *AI Suggestion*: AI generated string replacements using the modern `/s` (`dotAll`) regex flag, which triggered TypeScript compiler target mismatches (`ES2017` vs `ES2018+`).
  - *Engineering Decision*: Changed the regex patterns to use cross-compatible `[\s\S]*?` with `gi` flags, and updated `tsconfig.json` target to `ES2022`, ensuring consistent compilation across all Node and browser runtimes.
- **Replaced Fragile Client-Only Authorization**:
  - *AI Suggestion*: AI initially proposed only disabling the UI buttons (read-only mode) for Viewer roles on the frontend.
  - *Engineering Decision*: Flagged as a security vulnerability. Enforced strict, server-side authorization checks on `/api/documents/[id]` and `/api/documents/[id]/share` that return `HTTP 403 Forbidden` if a non-editor or non-owner attempts mutations.
- **Deprioritized Premature WebSockets / CRDT Complexity**:
  - *AI Suggestion*: AI proposed setting up a full Yjs / WebSocket infrastructure for character-by-character live cursors.
  - *Engineering Decision*: Explicitly deprioritized. Within a focused assessment timebox, a complex real-time sync server introduces fragility and deployment hurdles. Prioritized a rock-solid debounced auto-save model with robust persistence and sharing controls instead.

---

### 4. How Correctness, UX Quality & Implementation Reliability Were Verified

- **Automated Testing**:
  - Built and executed Vitest suites (`tests/permissions.test.ts`, `tests/parsers.test.ts`, `tests/export.test.ts`) verifying that owners, editors, viewers, and third parties have exactly the correct permissions and that file parsing maintains structural integrity. All 8 tests pass cleanly.
- **Adversarial API Testing**:
  - Performed direct terminal `curl` requests testing unauthorized document edits as a Viewer (`Charlie Davis`), confirming the backend returns `403 Forbidden` and prevents unauthorized state mutation.
- **Full Production Build Verification**:
  - Ran `npm run build` to validate TypeScript strict mode typing, App Router route static/dynamic analysis, and bundle optimization.
- **UX & Print Verification**:
  - Tested the interface interactively across multiple roles using the persona switcher, verified that auto-save visual indicators respond with low latency, and tested `@media print` styling to guarantee clean PDF document exports.
