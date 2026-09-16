import { describe, it, expect } from "vitest";

interface User {
  id: string;
  name: string;
}

interface Share {
  userId: string;
  role: "VIEWER" | "EDITOR";
}

interface Document {
  id: string;
  ownerId: string;
  shares: Share[];
}

function computeUserRole(
  document: Document,
  userId: string
): "OWNER" | "EDITOR" | "VIEWER" | null {
  if (document.ownerId === userId) return "OWNER";
  const share = document.shares.find((s) => s.userId === userId);
  return share ? share.role : null;
}

function canUserEdit(document: Document, userId: string): boolean {
  const role = computeUserRole(document, userId);
  return role === "OWNER" || role === "EDITOR";
}

function canUserDelete(document: Document, userId: string): boolean {
  const role = computeUserRole(document, userId);
  return role === "OWNER";
}

describe("Document Role-Based Access Control", () => {
  const alice: User = { id: "user_alice", name: "Alice Chen" };
  const bob: User = { id: "user_bob", name: "Bob Martinez" };
  const charlie: User = { id: "user_charlie", name: "Charlie Davis" };
  const eve: User = { id: "user_eve", name: "Eve Intruder" };

  const testDoc: Document = {
    id: "doc_1",
    ownerId: alice.id,
    shares: [
      { userId: bob.id, role: "EDITOR" },
      { userId: charlie.id, role: "VIEWER" },
    ],
  };

  it("identifies document owner with full edit and delete permissions", () => {
    expect(computeUserRole(testDoc, alice.id)).toBe("OWNER");
    expect(canUserEdit(testDoc, alice.id)).toBe(true);
    expect(canUserDelete(testDoc, alice.id)).toBe(true);
  });

  it("identifies shared editor with edit permissions but no delete permission", () => {
    expect(computeUserRole(testDoc, bob.id)).toBe("EDITOR");
    expect(canUserEdit(testDoc, bob.id)).toBe(true);
    expect(canUserDelete(testDoc, bob.id)).toBe(false);
  });

  it("identifies shared viewer with read-only access (no edit, no delete)", () => {
    expect(computeUserRole(testDoc, charlie.id)).toBe("VIEWER");
    expect(canUserEdit(testDoc, charlie.id)).toBe(false);
    expect(canUserDelete(testDoc, charlie.id)).toBe(false);
  });

  it("denies access to unauthorized third party", () => {
    expect(computeUserRole(testDoc, eve.id)).toBeNull();
    expect(canUserEdit(testDoc, eve.id)).toBe(false);
    expect(canUserDelete(testDoc, eve.id)).toBe(false);
  });
});
