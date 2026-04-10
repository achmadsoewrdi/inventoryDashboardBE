export const getActivitiesSchema = {
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number" },
          action: { type: "string" },
          description: { type: "string" },
          delta: { type: "number", nullable: true },
          status: { type: "string", nullable: true },
          createdAt: { type: "string" },
          user: {
            type: "object",
            properties: { name: { type: "string" } },
          },
          product: {
            type: "object",
            nullable: true,
            properties: { name: { type: "string" } },
          },
        },
      },
    },
  },
};
