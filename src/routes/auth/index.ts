import { FastifyInstance } from "fastify";
import { signupHandler, loginHandler } from "./handler";
import { signupSchema, loginSchema } from "./schema";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/signup", {
    schema: signupSchema,
    handler: signupHandler,
  });

  app.post("/login", {
    schema: loginSchema,
    handler: loginHandler,
  });
}
