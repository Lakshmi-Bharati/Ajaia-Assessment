import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.attachment.deleteMany();
  await prisma.documentShare.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  // Create seeded users
  const alice = await prisma.user.create({
    data: {
      id: "user_alice",
      name: "Alice Chen",
      email: "alice@ajaia.ai",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      roleTitle: "Product Lead",
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: "user_bob",
      name: "Bob Martinez",
      email: "bob@ajaia.ai",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      roleTitle: "Senior AI Engineer",
    },
  });

  const charlie = await prisma.user.create({
    data: {
      id: "user_charlie",
      name: "Charlie Davis",
      email: "charlie@ajaia.ai",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
      roleTitle: "Client Partner",
    },
  });

  // Seed sample documents
  const sampleDoc1 = await prisma.document.create({
    data: {
      id: "doc_ajaia_roadmap",
      title: "Ajaia AI Product Roadmap & Vision 2026",
      ownerId: alice.id,
      contentHtml: `<h1>Ajaia AI Product Roadmap &amp; Vision</h1><p>Welcome to the collaborative strategy document. At Ajaia, we operate across four core pillars to move from experimentation to tangible business value.</p><h2>Core Initiatives</h2><ul><li><strong>AI Copilots:</strong> Vertical workflows tailored to enterprise document review and decisioning.</li><li><strong>Knowledge Extraction:</strong> Automated structured intelligence from unstructured enterprise assets.</li><li><strong>Real-time Collaboration:</strong> Low-latency document and artifact generation for cross-functional pods.</li></ul><h2>Key Milestones</h2><ol><li>Complete lightweight document editor prototype.</li><li>Implement sharing permissions and access controls.</li><li>Demonstrate file upload, doc conversion, and AI copilot integration.</li></ol><blockquote><em>"Help organizations win the AI moment with speed, adaptability, and high craft."</em></blockquote>`,
      contentJson: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Ajaia AI Product Roadmap & Vision" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Welcome to the collaborative strategy document. At Ajaia, we operate across four core pillars to move from experimentation to tangible business value.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Core Initiatives" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", marks: [{ type: "bold" }], text: "AI Copilots: " },
                      {
                        type: "text",
                        text: "Vertical workflows tailored to enterprise document review and decisioning.",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", marks: [{ type: "bold" }], text: "Knowledge Extraction: " },
                      {
                        type: "text",
                        text: "Automated structured intelligence from unstructured enterprise assets.",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", marks: [{ type: "bold" }], text: "Real-time Collaboration: " },
                      {
                        type: "text",
                        text: "Low-latency document and artifact generation for cross-functional pods.",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
    },
  });

  // Share sampleDoc1 with Bob as EDITOR and Charlie as VIEWER
  await prisma.documentShare.create({
    data: {
      documentId: sampleDoc1.id,
      userId: bob.id,
      role: "EDITOR",
    },
  });

  await prisma.documentShare.create({
    data: {
      documentId: sampleDoc1.id,
      userId: charlie.id,
      role: "VIEWER",
    },
  });

  // Create another document owned by Bob
  const sampleDoc2 = await prisma.document.create({
    data: {
      id: "doc_eng_specs",
      title: "Architecture Specs & API Contracts",
      ownerId: bob.id,
      contentHtml: `<h1>Architecture Specs &amp; API Contracts</h1><p>This technical brief details our SQLite-backed document persistence model and REST endpoints.</p><h2>Endpoint Guidelines</h2><ul><li><code>GET /api/documents</code> - Lists user's owned and shared docs</li><li><code>POST /api/documents</code> - Creates a new document</li><li><code>PUT /api/documents/:id</code> - Updates document content (requires owner or editor role)</li><li><code>POST /api/documents/:id/share</code> - Manages access controls</li></ul>`,
      contentJson: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Architecture Specs & API Contracts" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This technical brief details our SQLite-backed document persistence model and REST endpoints.",
              },
            ],
          },
        ],
      }),
    },
  });

  // Share sampleDoc2 with Alice as VIEWER
  await prisma.documentShare.create({
    data: {
      documentId: sampleDoc2.id,
      userId: alice.id,
      role: "VIEWER",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
