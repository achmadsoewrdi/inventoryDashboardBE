import { FastifyPluginAsync } from "fastify";
import * as handler from "./handler";
import * as schema from "./schema";
import { authenticate } from "../../middleware/authenticate";

const productRoutes: FastifyPluginAsync = async (fastify) => {
  // wajib login
  fastify.addHook("preHandler", authenticate);
  // ─── Products CRUD ───
  fastify.get("/", { schema: schema.getProductsSchema }, handler.getProducts);
  fastify.get("/meta", handler.getProductsMeta); // ← harus sebelum /:id
  fastify.get("/overview/stats", handler.getOverviewStats); // ← juga sebelum /:id
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
  fastify.delete("/:id", handler.deleteProduct);

  // ─── Images ───
  fastify.post(
    "/:id/images",
    { schema: schema.uploadImageSchema },
    handler.uploadImage,
  );
  fastify.delete("/:id/images/:imageId", handler.deleteImage);
};

export default productRoutes;
