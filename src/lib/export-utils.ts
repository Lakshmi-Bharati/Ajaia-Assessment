/**
 * Utilities for exporting document content to Markdown, HTML, TXT, and PDF.
 */

export function htmlToMarkdown(html: string): string {
  // Convert HTML tags to standard Markdown
  let md = html;

  // Replace blockquotes
  md = md.replace(/<blockquote><p>([\s\S]*?)<\/p><\/blockquote>/gi, "> $1\n\n");
  md = md.replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, "> $1\n\n");

  // Replace pre/code
  md = md.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, "```\n$1\n```\n\n");
  md = md.replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`");

  // Replace headings
  md = md.replace(/<h1>([\s\S]*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2>([\s\S]*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3>([\s\S]*?)<\/h3>/gi, "### $1\n\n");

  // Replace bold, italic, underline
  md = md.replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b>([\s\S]*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em>([\s\S]*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i>([\s\S]*?)<\/i>/gi, "*$1*");
  md = md.replace(/<u>([\s\S]*?)<\/u>/gi, "__$1__");

  // Replace lists
  md = md.replace(/<ul>([\s\S]*?)<\/ul>/gi, (_, content) => {
    return content.replace(/<li><p>([\s\S]*?)<\/p><\/li>/gi, "- $1\n")
      .replace(/<li>([\s\S]*?)<\/li>/gi, "- $1\n") + "\n";
  });

  md = md.replace(/<ol>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let index = 1;
    return content
      .replace(/<li><p>([\s\S]*?)<\/p><\/li>/gi, () => `${index++}. $1\n`)
      .replace(/<li>([\s\S]*?)<\/li>/gi, () => `${index++}. $1\n`) + "\n";
  });

  // Replace paragraphs and line breaks
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<p>([\s\S]*?)<\/p>/gi, "$1\n\n");

  // Strip any remaining HTML tags
  md = md.replace(/<[^>]+>/g, "");

  // Decode common HTML entities
  md = md
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");

  return md.trim();
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportDocumentToMarkdown(title: string, htmlContent: string) {
  const markdown = `# ${title}\n\n${htmlToMarkdown(htmlContent)}`;
  const safeFilename = `${title.replace(/[^a-zA-Z0-9_-]/g, "_")}.md`;
  downloadFile(markdown, safeFilename, "text/markdown;charset=utf-8");
}

export function exportDocumentToPlainText(title: string, htmlContent: string) {
  const text = `${title}\n\n${htmlToMarkdown(htmlContent).replace(/[#*_`]/g, "")}`;
  const safeFilename = `${title.replace(/[^a-zA-Z0-9_-]/g, "_")}.txt`;
  downloadFile(text, safeFilename, "text/plain;charset=utf-8");
}

export function exportDocumentToHtml(title: string, htmlContent: string) {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 24px;
      color: #1a202c;
    }
    h1 { font-size: 28px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 24px; }
    h2 { font-size: 22px; margin-top: 24px; margin-bottom: 12px; }
    h3 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
    p { margin-bottom: 14px; }
    blockquote { border-left: 3px solid #6366f1; padding-left: 14px; color: #4a5568; margin: 16px 0; }
    code { background: #edf2f7; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
    pre { background: #2d3748; color: #edf2f7; padding: 16px; border-radius: 6px; overflow-x: auto; }
    pre code { background: transparent; color: inherit; padding: 0; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${htmlContent}
</body>
</html>`;

  const safeFilename = `${title.replace(/[^a-zA-Z0-9_-]/g, "_")}.html`;
  downloadFile(fullHtml, safeFilename, "text/html;charset=utf-8");
}

export function exportDocumentToPdf() {
  window.print();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
