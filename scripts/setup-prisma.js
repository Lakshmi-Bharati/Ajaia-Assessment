const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
let schema = fs.readFileSync(schemaPath, "utf-8");

const isPostgres =
  process.env.POSTGRES_PRISMA_URL ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("postgres"));

if (isPostgres) {
  console.log("Setting up Prisma for PostgreSQL (Vercel / Cloud)...");
  schema = schema.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
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
