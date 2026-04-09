import { FastifyRequest, FastifyReply } from "fastify";
import * as productService from "../../services/product.service";
import * as uploadService from "../../services/upload.service";
import {
  ProductQuery,
  CreateProductInput,
  UpdateProductInput,
} from "../../services/product.service";

type IdParam = { id: string };
type ImageQuery = { isPrimary?: boolean };
type ImageIdParam = { id: string; imageId: string };

// ─────────────────────────────────────────
// GET ALL
// ─────────────────────────────────────────

export async function getProducts(
  req: FastifyRequest<{ Querystring: ProductQuery }>,
  reply: FastifyReply,
) {
  const [products, total] = await productService.getAll(
    req.server.prisma,
    req.query,
  );
  const { page = 1, limit = 25, warehouseId } = req.query as any;

  return {
    data: products,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─────────────────────────────────────────
// GET BY ID
// ─────────────────────────────────────────

export async function getProductById(
  req: FastifyRequest<{ Params: IdParam }>,
  reply: FastifyReply,
) {
  const product = await productService.getById(
    req.server.prisma,
    Number(req.params.id),
  );
  if (!product) throw req.server.httpErrors.notFound("Product not found");
  return product;
}

// ─────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────

export async function createProduct(
  req: FastifyRequest<{ Body: CreateProductInput }>,
  reply: FastifyReply,
) {
  const product = await productService.create(req.server.prisma, req.body);
  return reply.code(201).send(product);
}

// ─────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────

export async function updateProduct(
  req: FastifyRequest<{ Params: IdParam; Body: UpdateProductInput }>,
  reply: FastifyReply,
) {
  const product = await productService.update(
    req.server.prisma,
    Number(req.params.id),
    req.body,
  );
  return product;
}

// ─────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────

export async function deleteProduct(
  req: FastifyRequest<{ Params: IdParam }>,
  reply: FastifyReply,
) {
  try {
    await productService.remove(req.server.prisma, Number(req.params.id));
    return reply.code(204).send();
  } catch (error: any) {
    if (error.code === "P2025")
      throw req.server.httpErrors.notFound("Product not found");
    throw error;
  }
}

// ─────────────────────────────────────────
// UPLOAD IMAGE
// ─────────────────────────────────────────

export async function uploadImage(
  req: FastifyRequest<{ Params: IdParam; Querystring: ImageQuery }>,
  reply: FastifyReply,
) {
  const product = await productService.getById(
    req.server.prisma,
    Number(req.params.id),
  );
  if (!product) throw req.server.httpErrors.notFound("Product not found");

  const file = await req.file();
  if (!file) throw req.server.httpErrors.badRequest("No file uploaded");

  const imageUrl = await uploadService.saveImage(file);
  const isPrimary = req.query.isPrimary ?? false;

  const image = await productService.addImage(
    req.server.prisma,
    Number(req.params.id),
    imageUrl,
    isPrimary,
  );

  return reply.code(201).send(image);
}

// ─────────────────────────────────────────
// DELETE IMAGE
// ─────────────────────────────────────────

export async function deleteImage(
  req: FastifyRequest<{ Params: ImageIdParam }>,
  reply: FastifyReply,
) {
  try {
    await productService.removeImage(
      req.server.prisma,
      Number(req.params.imageId),
    );
    return reply.code(204).send();
  } catch (error: any) {
    if (error.code === "P2025")
      throw req.server.httpErrors.notFound("Image not found");
    throw error;
  }
}

// ─────────────────────────────────────────
// ADMIN OVERVIEW STATS
// ─────────────────────────────────────────

export async function getOverviewStats(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const stats = await productService.getOverviewStats(req.server.prisma);
  return stats;
}

// ─────────────────────────────────────────
// PRODUCT META (categories + warehouses)
// ─────────────────────────────────────────

export async function getProductsMeta(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const [categories, warehouses] = await Promise.all([
    req.server.prisma.category.findMany({
      select: { id: true, name: true }, // 👈 Hanya ambil ID dan Nama
      orderBy: { name: "asc" },
    }),
    req.server.prisma.warehouse.findMany({
      select: { id: true, name: true }, // 👈 Hindari kolom tanggal yang bermasalah!
      orderBy: { name: "asc" },
    }),
  ]);

  return { categories, warehouses };
}
