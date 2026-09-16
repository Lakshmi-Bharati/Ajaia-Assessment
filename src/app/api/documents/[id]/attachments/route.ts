import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attachments = await prisma.attachment.findMany({
      where: { documentId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ attachments });
  } catch (error) {
    console.error("Failed to fetch attachments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { shares: true },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Must be owner or editor
    const isOwner = doc.ownerId === user.id;
    const isEditor = doc.shares.some((s) => s.userId === user.id && s.role === "EDITOR");
    if (!isOwner && !isEditor) {
      return NextResponse.json({ error: "Forbidden: Cannot upload attachments with view-only role" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(uploadDir, safeFilename);
    await fs.writeFile(filePath, buffer);

    const attachment = await prisma.attachment.create({
      data: {
        documentId: id,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        filePath: `/uploads/${safeFilename}`,
      },
    });

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    console.error("Failed to upload attachment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
