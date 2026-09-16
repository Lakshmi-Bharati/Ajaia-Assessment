const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
let schema = fs.readFileSync(schemaPath, "utf-8");

const postgresUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.PRISMA_DATABASE_URL;

const isPostgres =
  postgresUrl &&
  (postgresUrl.startsWith("postgres") ||
    postgresUrl.startsWith("prisma+postgres") ||
    postgresUrl.startsWith("postgresql"));

if (isPostgres) {
  console.log("Setting up Prisma for PostgreSQL (Vercel / Cloud)...");
  process.env.DATABASE_URL = postgresUrl;

  // Append to .env.production so Prisma CLI can read it during build
  const envProdPath = path.join(__dirname, "..", ".env.production");
  try {
    fs.writeFileSync(envProdPath, `DATABASE_URL="${postgresUrl}"\n`, "utf-8");
  } catch (e) {
    console.warn("Could not write .env.production", e);
  }

  schema = schema.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
  );
} else {
  console.log("Setting up Prisma for SQLite (Local / Offline)...");
  schema = schema.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}`
  );
}

fs.writeFileSync(schemaPath, schema, "utf-8");
console.log("schema.prisma successfully updated.");
