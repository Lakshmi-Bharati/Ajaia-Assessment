import { describe, it, expect } from "vitest";
import { parseUploadedFile } from "../src/lib/file-parsers";

describe("File Upload & Parser Utilities", () => {
  it("correctly converts markdown content into formatted HTML with headings and lists", async () => {
    const mdContent = `# Project Phoenix
This is an introductory paragraph.

## Deliverables
- Milestone 1: Core Engine
- Milestone 2: Multi-user Sharing

> High-velocity AI development`;

    const blob = new Blob([mdContent], { type: "text/markdown" });
    const file = new File([blob], "phoenix_strategy.md", { type: "text/markdown" });

    const result = await parseUploadedFile(file);

    expect(result.title).toBe("phoenix_strategy");
    expect(result.html).toContain("<h1>Project Phoenix</h1>");
    expect(result.html).toContain("<h2>Deliverables</h2>");
    expect(result.html).toContain("<ul>");
    expect(result.html).toContain("<li>Milestone 1: Core Engine</li>");
    expect(result.html).toContain("<blockquote><p>High-velocity AI development</p></blockquote>");
  });

  it("correctly handles plain text files and breaks paragraphs", async () => {
    const txtContent = `First paragraph of notes.

Second paragraph with details.`;

    const blob = new Blob([txtContent], { type: "text/plain" });
    const file = new File([blob], "notes.txt", { type: "text/plain" });

    const result = await parseUploadedFile(file);

    expect(result.title).toBe("notes");
    expect(result.html).toContain("<p>First paragraph of notes.</p>");
    expect(result.html).toContain("<p>Second paragraph with details.</p>");
  });
});
