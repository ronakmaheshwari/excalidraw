import dotenv from "dotenv"
import { defineConfig, env } from "prisma/config";

dotenv.config()
console.log("DB_URL=",process.env.DATABASE_URL)

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
