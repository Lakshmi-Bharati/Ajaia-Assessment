import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseUploadedFile } from "@/lib/file-parsers";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    const allowedExtensions = [".txt", ".md", ".markdown", ".docx"];
    const isValid = allowedExtensions.some((ext) => filename.endsWith(ext));

    if (!isValid) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload .txt, .md, or .docx files." },
        { status: 400 }
      );
    }

    // Parse the file into title, html, text
    const parsed = await parseUploadedFile(file);

    // Create the document
    const newDoc = await prisma.document.create({
      data: {
        title: parsed.title || "Imported Document",
        contentHtml: parsed.html,
        contentJson: JSON.stringify({ type: "doc", content: [] }),
        ownerId: user.id,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    return NextResponse.json(
      {
        message: "File successfully imported as a document",
        document: newDoc,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to process file import:", error);
    return NextResponse.json({ error: "Failed to parse and import document" }, { status: 500 });
  }
}
