import fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";
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
import activityRoutes from "./routes/activity";
import supplierRoutes from "./routes/suppliers";
// import dashboardRoutes from "./routes/dashboard"; // Pastikan file index.ts dashboard sudah ada

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify();

  // 1. Core Plugins & Auth
  app.register(prismaPlugin);

  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? "changeme",
  });

  // [PENTING] Daftarkan Decorator authenticate SEBELUM registrasi rute
  // Ini untuk memperbaiki error "preHandler got [object Undefined]"
  app.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    },
  );

  // 2. Utility Plugins
  app.register(sensible);
  app.register(multipart);

  // Konfigurasi Upload Directory
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app.register(staticFiles, {
    root: uploadsDir,
    prefix: "/uploads/",
    decorateReply: false,
  });

  app.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  // 3. Register All Routes
  // Semua rute yang menggunakan preHandler: [fastify.authenticate] harus di bawah decorate
  app.register(authRoutes, { prefix: "/auth" });
  app.register(productRoutes, { prefix: "/products" });
  app.register(categoryRoutes, { prefix: "/categories" });
  app.register(activityRoutes, { prefix: "/activity" });
  app.register(supplierRoutes, { prefix: "/suppliers" });
  // app.register(dashboardRoutes, { prefix: "/dashboard" }); // Daftarkan dashboard di sini

  return app;
}
