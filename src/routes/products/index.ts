import { FastifyPluginAsync } from "fastify";
import * as handler from "./handler";
import * as schema from "./schema";
import { authenticate } from "../../middleware/authenticate";
import { authorizeAdmin } from "../../middleware/authorize"; // <--- 1. Tambahkan import ini

const productRoutes: FastifyPluginAsync = async (fastify) => {
  // wajib login (berlaku untuk semua rute)
  fastify.addHook("preHandler", authenticate);

  // ─── Products CRUD ───
  fastify.get("/", { schema: schema.getProductsSchema }, handler.getProducts);
  fastify.get("/meta", handler.getProductsMeta);
  fastify.get("/overview/stats", handler.getOverviewStats);

  // export route
  fastify.get("/export", handler.exportProducts);

  fastify.get(
    "/:id",
    { schema: schema.getProductByIdSchema },
    handler.getProductById,
  );
  fastify.post(
    "/",
    { schema: schema.createProductSchema },
    handler.createProduct,
  );
  fastify.put(
    "/:id",
    { schema: schema.updateProductSchema },
    handler.updateProduct,
  );

  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [authorizeAdmin] },
    handler.deleteProduct,
  );

  // ─── Images ───
  fastify.post(
    "/:id/images",
    { schema: schema.uploadImageSchema },
    handler.uploadImage,
  );

  fastify.delete<{ Params: { id: string; imageId: string } }>(
    "/:id/images/:imageId",
    { preHandler: [authorizeAdmin] },
    handler.deleteImage,
  );
};

export default productRoutes;
