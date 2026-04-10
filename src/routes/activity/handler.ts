import type { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getRecentActivities = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const activities = await prisma.activityLog.findMany({
      take: 5, // Ambil 5 saja sesuai desain dashboard
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true } },
      },
    });

    return activities;
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: "Gagal mengambil log aktivitas" });
  }
};
