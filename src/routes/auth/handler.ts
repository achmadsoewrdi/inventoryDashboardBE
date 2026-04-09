import { FastifyReply, FastifyRequest } from "fastify";
import {
  findUserByEmail,
  createUser,
  verifyPassword,
} from "../../services/auth.service";

interface SignupBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export async function signupHandler(
  request: FastifyRequest<{ Body: SignupBody }>,
  reply: FastifyReply,
) {
  const { name, email, password } = request.body;

  const existing = await findUserByEmail(request.server.prisma, email);
  if (existing) {
    return reply.conflict("Email already in use");
  }

  const user = await createUser(request.server.prisma, name, email, password);

  const token = await reply.jwtSign(
    { id: user.id, email: user.email, role: user.role },
    { expiresIn: "7d" },
  );

  return reply.code(201).send({ user, token });
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply,
) {
  const { email, password } = request.body;

  const user = await findUserByEmail(request.server.prisma, email);
  if (!user) {
    return reply.unauthorized("Invalid email or password");
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return reply.unauthorized("Invalid email or password");
  }

  const token = await reply.jwtSign(
    { id: user.id, email: user.email, role: user.role },
    { expiresIn: "7d" },
  );

  const { password: _, ...safeUser } = user;
  return reply.send({ user: safeUser, token });
}
