import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getSuppliers = async () => {
  return await prisma.supplier.findMany({
    orderBy: { name: "asc" },
  });
};
