import { FastifyInstance } from "fastify";
import { getCategoriesHandler } from "./handler";
import { getCategoriesSchema } from "./schema";
import { authenticate } from "../../middleware/authenticate";

export async function categoryRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);
  app.get("/", {
    schema: getCategoriesSchema,
    handler: getCategoriesHandler,
  });
}
