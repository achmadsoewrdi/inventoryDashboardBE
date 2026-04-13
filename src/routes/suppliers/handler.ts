import { FastifyReply, FastifyRequest } from "fastify";
import * as supplierService from "../../services/supplier.service";

export const getAllSuppliersHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const suppliers = await supplierService.getSuppliers();
    return reply.send(suppliers);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: "Error fetching suppliers" });
  }
};
