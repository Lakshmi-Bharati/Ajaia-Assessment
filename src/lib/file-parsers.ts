import mammoth from "mammoth";

export interface ParsedDocument {
  title: string;
  html: string;
  text: string;
}

export async function parseUploadedFile(
  file: File
): Promise<ParsedDocument> {
  const filename = file.name;
  const extension = filename.split(".").pop()?.toLowerCase();
  const title = filename.replace(/\.[^/.]+$/, "");
  const buffer = Buffer.from(await file.arrayBuffer());

  if (extension === "docx") {
    const result = await mammoth.convertToHtml({ buffer });
    const html = result.value;
    const textResult = await mammoth.extractRawText({ buffer });
    return {
      title,
      html: html || `<p>Imported from ${filename}</p>`,
      text: textResult.value || "",
    };
  }

  if (extension === "md" || extension === "markdown") {
    const text = buffer.toString("utf-8");
    // Simple robust markdown to html conversion for headings, lists, bold, italics
    const html = markdownToHtml(text);
    return {
      title,
      html,
      text,
    };
  }

  // Fallback to text file (.txt, etc.)
  const text = buffer.toString("utf-8");
  const paragraphs = text
    .split(/\r?\n\r?\n/)
    .filter((p) => p.trim().length > 0)
    .map((p) => `<p>${escapeHtml(p).replace(/\r?\n/g, "<br/>")}</p>`)
    .join("");

  return {
    title,
    html: paragraphs || `<p>${escapeHtml(text)}</p>`,
    text,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const htmlParts: string[] = [];
  let inList = false;
  let listType: "ul" | "ol" | null = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (!line) {
      if (inList) {
        htmlParts.push(listType === "ul" ? "</ul>" : "</ol>");
        inList = false;
        listType = null;
      }
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      if (inList) { htmlParts.push(listType === "ul" ? "</ul>" : "</ol>"); inList = false; }
      htmlParts.push(`<h1>${formatInline(line.substring(2))}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) { htmlParts.push(listType === "ul" ? "</ul>" : "</ol>"); inList = false; }
      htmlParts.push(`<h2>${formatInline(line.substring(3))}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      if (inList) { htmlParts.push(listType === "ul" ? "</ul>" : "</ol>"); inList = false; }
      htmlParts.push(`<h3>${formatInline(line.substring(4))}</h3>`);
      continue;
    }

    // Bullet lists
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList || listType !== "ul") {
        if (inList) htmlParts.push(listType === "ul" ? "</ul>" : "</ol>");
        htmlParts.push("<ul>");
        inList = true;
        listType = "ul";
      }
      htmlParts.push(`<li>${formatInline(line.substring(2))}</li>`);
      continue;
    }

    // Numbered lists
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      if (!inList || listType !== "ol") {
        if (inList) htmlParts.push(listType === "ul" ? "</ul>" : "</ol>");
        htmlParts.push("<ol>");
        inList = true;
        listType = "ol";
      }
      htmlParts.push(`<li>${formatInline(orderedMatch[2])}</li>`);
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      if (inList) { htmlParts.push(listType === "ul" ? "</ul>" : "</ol>"); inList = false; }
      htmlParts.push(`<blockquote><p>${formatInline(line.substring(2))}</p></blockquote>`);
      continue;
    }

    // Normal paragraph
    if (inList) {
      htmlParts.push(listType === "ul" ? "</ul>" : "</ol>");
      inList = false;
      listType = null;
    }
    htmlParts.push(`<p>${formatInline(line)}</p>`);
  }

  if (inList) {
    htmlParts.push(listType === "ul" ? "</ul>" : "</ol>");
  }

  return htmlParts.join("");
}

function formatInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/__(.*?)__/g, "<u>$1</u>")
    .replace(/`(.*?)`/g, "<code>$1</code>");
}
