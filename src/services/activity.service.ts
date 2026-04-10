import { PrismaClient, ActivityAction } from "@prisma/client";

const prisma = new PrismaClient();

export async function createLog(data: {
  userId: number;
  productId?: number | null; // Tambahkan null di sini
  action: ActivityAction;
  description: string;
  delta?: number | null; // Tambahkan null di sini
}) {
  return await prisma.activityLog.create({
    data: {
      userId: data.userId,
      productId: data.productId ?? null,
      action: data.action,
      description: data.description,
      delta: data.delta ?? null,
      status: "SUCCESS",
    },
  });
}
