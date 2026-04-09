import { PrismaClient } from "@prisma/client";

export async function getAllCategories(prisma: PrismaClient) {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}
