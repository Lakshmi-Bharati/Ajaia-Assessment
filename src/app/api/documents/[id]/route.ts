import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateDocSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  contentHtml: z.string().optional(),
  contentJson: z.string().optional(),
});

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

    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true, roleTitle: true } },
        shares: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true, roleTitle: true } },
          },
        },
        attachments: {
          select: {
            id: true,
            documentId: true,
            filename: true,
            fileSize: true,
            mimeType: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Determine user role for this document
    let userRole: "OWNER" | "EDITOR" | "VIEWER" | null = null;
    if (doc.ownerId === user.id) {
      userRole = "OWNER";
    } else {
      const share = doc.shares.find((s) => s.userId === user.id);
      if (share) {
        userRole = share.role as "EDITOR" | "VIEWER";
      }
    }

    if (!userRole) {
      return NextResponse.json({ error: "Access denied. You do not have permission to view this document." }, { status: 403 });
    }

    return NextResponse.json({
      document: doc,
      userRole,
      currentUser: user,
    });
  } catch (error) {
    console.error("Failed to fetch document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
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

    // Check write permissions
    const isOwner = doc.ownerId === user.id;
    const share = doc.shares.find((s) => s.userId === user.id);
    const isEditor = share?.role === "EDITOR";

    if (!isOwner && !isEditor) {
      return NextResponse.json(
        { error: "Forbidden: You have view-only access to this document." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = updateDocSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid payload", details: parseResult.error.issues }, { status: 400 });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        ...(parseResult.data.title !== undefined && { title: parseResult.data.title }),
        ...(parseResult.data.contentHtml !== undefined && { contentHtml: parseResult.data.contentHtml }),
        ...(parseResult.data.contentJson !== undefined && { contentJson: parseResult.data.contentJson }),
      },
    });

    return NextResponse.json({ document: updated });
  } catch (error) {
    console.error("Failed to update document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: Only the document owner can delete this document." },
        { status: 403 }
      );
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
