import { FastifyRequest, FastifyReply } from "fastify";
import * as productService from "../../services/product.service";
import * as uploadService from "../../services/upload.service";
import {
  ProductQuery,
  CreateProductInput,
  UpdateProductInput,
} from "../../services/product.service";
import ExcelJs from "exceljs";

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
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    req.server.prisma.warehouse.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { categories, warehouses };
}

export async function exportProducts(
  req: FastifyRequest<{
    Querystring: ProductQuery & { ids?: string | string[] };
  }>,
  reply: FastifyReply,
) {
  const { ids, ...filters } = req.query;

  // konversi Ids ke array
  let productId: number[] | undefined;
  if (ids) {
    productId = Array.isArray(ids) ? ids.map(Number) : [Number(ids)];
  }

  // mengambil data dari service
  const products = await productService.getForExport(
    req.server.prisma,
    filters,
    productId,
  );

  // setup workbook & worksheet
  const workbook = new ExcelJs.Workbook();
  const worksheet = workbook.addWorksheet("Inventory");

  // define columns
  worksheet.columns = [
    { header: "SKU", key: "sku", width: 15 },
    { header: "Product Name", key: "name", width: 30 },
    { header: "Category", key: "category", width: 20 },
    { header: "Warehouse", key: "warehouse", width: 20 },
    { header: "Stock", key: "currentStock", width: 10 },
    { header: "Price", key: "salePrice", width: 15 },
    { header: "Last Updated", key: "updatedAt", width: 20 },
  ];

  // mapping data
  products.forEach((p: any) => {
    worksheet.addRow({
      sku: p.sku,
      name: p.name,
      category: p.category?.name || "-",
      warehouse: p.location?.warehouse?.name || "-",
      currentStock: p.currentStock,
      salePrice: p.salePrice,
      // Format: Oct 9, 2026
      updatedAt: new Date(p.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    });
  });

  // styling header
  worksheet.getRow(1).font = { bold: true };

  // ─── START STYLING ───

  // 1. Styling Header (Baris 1)
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "F2F2F2" }, // Warna abu-abu muda
  };

  // 2. Tambahkan Border ke Semua Cell yang Terisi
  worksheet.eachRow((row) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      // Membuat teks di tengah secara vertikal
      cell.alignment = { vertical: "middle" };
    });
  });

  // ─── END STYLING ───

  // generate and send buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return reply
    .header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    .header(
      "Content-Disposition",
      `attachment; filename=inventory_export_${new Date().getTime()}.xlsx`,
    )
    .send(buffer);
}
