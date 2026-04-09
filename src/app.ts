import fastify, { FastifyInstance } from "fastify";
import prismaPlugin from "./plugin/prisma";
import sensible from "@fastify/sensible";
import productRoutes from "./routes/products/index";
import multipart from "@fastify/multipart";
import staticFiles from "@fastify/static";
import path from "path";
import fs from "fs";
import fastifyCors from "@fastify/cors";
import { categoryRoutes } from "./routes/categories";
import fastifyJwt from "@fastify/jwt";
import authRoutes from "./routes/auth/index";

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify();

  app.register(prismaPlugin);

  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? "changeme",
  });

  app.register(sensible);
  app.register(multipart);

  // Gunakan process.cwd() agar path selalu relatif ke root project
  // (lebih reliable daripada __dirname saat pakai tsx)
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  // Pastikan folder ada
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  console.log("Static files dir:", uploadsDir);
  console.log("Files:", fs.readdirSync(uploadsDir));

  app.register(staticFiles, {
    root: uploadsDir,
    prefix: "/uploads/", // <- trailing slash penting!
    decorateReply: false,
  });

  app.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  app.register(productRoutes, { prefix: "/products" });
  app.register(categoryRoutes, { prefix: "/categories" });
  app.register(authRoutes, { prefix: "/auth" });
  return app;
}
