import { FastifyRequest, FastifyReply } from "fastify";
import { getAllCategories } from "../../services/category.service";

export async function getCategoriesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const categories = await getAllCategories(request.server.prisma);
  return reply.send(categories);
}
