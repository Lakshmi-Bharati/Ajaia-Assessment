import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const createDocSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  contentHtml: z.string().optional(),
  contentJson: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch owned documents
    const ownedDocuments = await prisma.document.findMany({
      where: { ownerId: user.id },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        shares: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        _count: { select: { attachments: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Fetch documents shared with this user
    const sharedRecords = await prisma.documentShare.findMany({
      where: { userId: user.id },
      include: {
        document: {
          include: {
            owner: { select: { id: true, name: true, email: true, avatar: true } },
            shares: {
              include: {
                user: { select: { id: true, name: true, email: true, avatar: true } },
              },
            },
            _count: { select: { attachments: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const sharedDocuments = sharedRecords.map((record) => ({
      ...record.document,
      sharedRole: record.role,
    }));

    return NextResponse.json({
      currentUser: user,
      ownedDocuments,
      sharedDocuments,
    });
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = createDocSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parseResult.error.issues }, { status: 400 });
    }

    const title = parseResult.data.title || "Untitled Document";
    const contentHtml = parseResult.data.contentHtml || "<p></p>";
    const contentJson = parseResult.data.contentJson || JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });

    const newDoc = await prisma.document.create({
      data: {
        title,
        contentHtml,
        contentJson,
        ownerId: user.id,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    return NextResponse.json({ document: newDoc }, { status: 201 });
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
