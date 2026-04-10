import type { FastifyInstance } from "fastify";
import { getRecentActivities } from "./handler";
import { getActivitiesSchema } from "./schema";


export default async function activityRoutes(fastify: FastifyInstance) {
  // Hanya user yang sudah login yang bisa melihat log
  fastify.get(
    "/",
    {
      schema: getActivitiesSchema,
      preHandler: [fastify.authenticate],
    },
    getRecentActivities,
  );
}
