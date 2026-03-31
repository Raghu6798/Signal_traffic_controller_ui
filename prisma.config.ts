import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Force load .env.local so Prisma 7 can find your DB URL
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL") ?? process.env.DATABASE_URL,
  },
});