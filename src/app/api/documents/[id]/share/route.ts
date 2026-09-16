import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const shareSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["VIEWER", "EDITOR"]),
});

const removeShareSchema = z.object({
  userId: z.string().min(1),
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
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({
      owner: doc.owner,
      shares: doc.shares,
      isOwner: doc.ownerId === user.id,
    });
  } catch (error) {
    console.error("Failed to fetch shares:", error);
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
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Only owner can grant/update permissions
    if (doc.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: Only the document owner can manage sharing permissions." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = shareSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid payload", details: parseResult.error.issues }, { status: 400 });
    }

    const { userId, role } = parseResult.data;

    // Cannot share with the owner themselves
    if (userId === doc.ownerId) {
      return NextResponse.json({ error: "User is already the document owner" }, { status: 400 });
    }

    // Upsert share
    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: id,
          userId,
        },
      },
      update: { role },
      create: {
        documentId: id,
        userId,
        role,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, roleTitle: true } },
      },
    });

    return NextResponse.json({ share });
  } catch (error) {
    console.error("Failed to share document:", error);
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
        { error: "Forbidden: Only the document owner can manage sharing permissions." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = removeShareSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid payload", details: parseResult.error.issues }, { status: 400 });
    }

    await prisma.documentShare.deleteMany({
      where: {
        documentId: id,
        userId: parseResult.data.userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to revoke share:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
