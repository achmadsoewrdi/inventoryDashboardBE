import { FastifyInstance } from "fastify";
import * as handler from "./handler";
import { getAllSuppliersSchema } from "./schema"; // Import schemanya

export default async function supplierRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    { schema: getAllSuppliersSchema },
    handler.getAllSuppliersHandler,
  );
}
