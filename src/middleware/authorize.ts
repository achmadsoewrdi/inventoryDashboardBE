import { FastifyRequest, FastifyReply } from "fastify";

// Kita buat interface untuk memberitahu TypeScript isi dari token JWT kamu
interface JwtPayload {
  id: number;
  email: string;
  role: string; // <--- Ini yang paling penting
}

export async function authorizeAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Ambil data user hasil dari request.jwtVerify() sebelumnya
  const user = request.user as JwtPayload;

  // Cek apakah user ada dan rolenya ADMIN
  if (!user || user.role !== "ADMIN") {
    return reply.status(403).send({
      error: "Forbidden",
      message: "Akses ditolak: Hanya Super Admin yang dapat menghapus data.",
    });
  }
}
