import { NextRequest } from "next/server";
import { prisma } from "./db";

export const DEFAULT_USER_ID = "user_alice";

export async function getCurrentUser(req?: NextRequest) {
  let userId = DEFAULT_USER_ID;

  if (req) {
    const headerUserId = req.headers.get("x-user-id");
    const cookieUserId = req.cookies.get("ajaia_user_id")?.value;
    userId = headerUserId || cookieUserId || DEFAULT_USER_ID;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    // If not found, return the first user or create default
    const fallbackUser = await prisma.user.findFirst();
    return fallbackUser;
  }

  return user;
}
