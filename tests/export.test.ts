import { describe, it, expect } from "vitest";
import { htmlToMarkdown } from "../src/lib/export-utils";

describe("Document Export Utilities", () => {
  it("converts HTML headings, paragraphs, and styling to clean Markdown", () => {
    const html = `<h1>Roadmap 2026</h1>
<p>This is a <strong>strategic</strong> priority for the <em>engineering</em> team.</p>
<h2>Key Goals</h2>
<ul>
  <li>Deliver MVP</li>
  <li>Enable AI Copilot</li>
</ul>
<blockquote><p>Speed with craft.</p></blockquote>`;

    const md = htmlToMarkdown(html);

    expect(md).toContain("# Roadmap 2026");
    expect(md).toContain("**strategic** priority for the *engineering* team.");
    expect(md).toContain("## Key Goals");
    expect(md).toContain("- Deliver MVP");
    expect(md).toContain("- Enable AI Copilot");
    expect(md).toContain("> Speed with craft.");
  });

  it("handles empty and plain paragraph conversions gracefully", () => {
    const html = "<p>Simple single line.</p>";
    const md = htmlToMarkdown(html);
    expect(md).toBe("Simple single line.");
  });
});
