import { PrismaClient, StockStatus, Prisma } from "@prisma/client";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export type ProductQuery = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  warehouseId?: number;
  status?: StockStatus;
  tab?: "all" | "low_stock" | "out";
};

export type CreateProductInput = {
  name: string;
  sku: string;
  description?: string;
  basePrice: number;
  salePrice?: number;
  currentStock?: number;
  stockThreshold?: number;
  categoryId: number;
  supplierId: number;
  location?: {
    warehouseId: number;
    aisle: string;
    shelf: string;
  };
};

export type UpdateProductInput = Partial<CreateProductInput>;

// ─────────────────────────────────────────
// INCLUDE — relasi yang selalu di-load
// ─────────────────────────────────────────

const productInclude = {
  category: true,
  supplier: true,
  images: true,
  location: {
    include: { warehouse: true },
  },
} satisfies Prisma.ProductInclude;

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function resolveStatus(stock: number, threshold: number): StockStatus {
  if (stock === 0) return StockStatus.OUT_OF_STOCK;
  if (stock <= threshold) return StockStatus.LOW_STOCK;
  return StockStatus.IN_STOCK;
}

// ─────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────

export function getAll(prisma: PrismaClient, query: ProductQuery = {}) {
  const {
    page = 1,
    limit = 25,
    search,
    categoryId,
    warehouseId,
    status,
    tab,
  } = query;

  const skip = (page - 1) * limit;

  const statusFilter: StockStatus | undefined =
    tab === "low_stock" ? StockStatus.LOW_STOCK : status;

  const where: Prisma.ProductWhereInput = {
    ...(search && {
      OR: [{ name: { contains: search } }, { sku: { contains: search } }],
    }),
    ...(categoryId && { categoryId }),
    ...(tab === "out" ? { currentStock: 0 } : statusFilter ? { status: statusFilter } : {}),
    ...(warehouseId && {
      location: {
        warehouseId: Number(warehouseId),
      },
    }),
  };

  return Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: productInclude,
    }),
    prisma.product.count({ where }),
  ]);
}

export function getById(prisma: PrismaClient, id: number) {
  return prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
}

export async function create(prisma: PrismaClient, data: CreateProductInput) {
  const {
    location,
    currentStock = 0,
    stockThreshold = 10,
    salePrice,
    ...rest
  } = data;

  const status = resolveStatus(currentStock, stockThreshold);

  return prisma.product.create({
    data: {
      ...rest,
      currentStock,
      stockThreshold,
      salePrice: salePrice ?? rest.basePrice,
      status,
      ...(location && {
        location: {
          create: location,
        },
      }),
    },
    include: productInclude,
  });
}

export async function update(
  prisma: PrismaClient,
  id: number,
  data: UpdateProductInput,
) {
  const { location, ...rest } = data;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");

  const newStock = rest.currentStock ?? existing.currentStock;
  const newThreshold = rest.stockThreshold ?? existing.stockThreshold;
  const status = resolveStatus(newStock, newThreshold);

  return prisma.product.update({
    where: { id },
    data: {
      ...rest,
      status,
      ...(location && {
        location: {
          upsert: {
            create: location,
            update: location,
          },
        },
      }),
    },
    include: productInclude,
  });
}

export function remove(prisma: PrismaClient, id: number) {
  return prisma.product.delete({ where: { id } });
}

// ─────────────────────────────────────────
// IMAGE
// ─────────────────────────────────────────

export function addImage(
  prisma: PrismaClient,
  productId: number,
  url: string,
  isPrimary = false,
) {
  return prisma.productImage.create({
    data: { productId, url, isPrimary },
  });
}

export function removeImage(prisma: PrismaClient, imageId: number) {
  return prisma.productImage.delete({ where: { id: imageId } });
}

// ─────────────────────────────────────────
// ADMIN OVERVIEW STATS
// ─────────────────────────────────────────

export async function getOverviewStats(prisma: PrismaClient) {
  const [products, lowStockCount, activityLogs, warehouseZones] =
    await Promise.all([
      prisma.product.findMany({
        select: { basePrice: true, currentStock: true },
      }),
      prisma.product.count({ where: { status: StockStatus.LOW_STOCK } }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: true, product: true },
      }),
      prisma.warehouseZone.findMany({ include: { warehouse: true } }),
    ]);

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.basePrice * p.currentStock,
    0,
  );

  return {
    totalInventoryValue,
    lowStockItems: lowStockCount,
    recentActivity: activityLogs,
    warehouseZones,
  };
}
