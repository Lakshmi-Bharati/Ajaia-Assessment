import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function setupDatabase(): string {
  // Check for PostgreSQL environment variables provided by Vercel / Prisma Postgres / Neon / Supabase
  const cloudUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.PRISMA_DATABASE_URL;

  if (cloudUrl && !cloudUrl.startsWith("file:")) {
    return cloudUrl;
  }

  // On Vercel / AWS Lambda without cloud DB:
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");

    try {
      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(sourceDbPath)) {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        } else {
          console.warn("Source database not found at", sourceDbPath);
        }
      }
    } catch (e) {
      console.error("Error setting up /tmp SQLite database:", e);
    }
    return `file:${tmpDbPath}`;
  }

  // Local development
  const localDbPath = path.join(process.cwd(), "prisma", "dev.db");
  return `file:${localDbPath}`;
}

const dbUrl = setupDatabase();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
