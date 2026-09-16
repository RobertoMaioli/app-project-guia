import 'dotenv/config';
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { categoriasRoutes } from './routes/categorias';
import { lugaresRoutes } from './routes/lugares';
import { authRoutes } from './routes/auth';
import { statsRoutes } from './routes/stats';

const app = Fastify({ logger: true });

app.register(cors, {
  // Em produção, restringir à origem real do app / domínio do site.
  origin: true,
});

app.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'dev-only-troque-em-producao',
});

app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Não autenticado' });
  }
});

app.get('/health', async () => {
  return { status: 'ok' };
});

app.register(categoriasRoutes, { prefix: '/categorias' });
app.register(lugaresRoutes, { prefix: '/lugares' });
app.register(authRoutes, { prefix: '/auth' });
app.register(statsRoutes, { prefix: '/stats' });

const port = Number(process.env.PORT ?? 3333);

app
  .listen({ port, host: '0.0.0.0' })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
