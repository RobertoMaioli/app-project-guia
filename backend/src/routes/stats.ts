import type { FastifyInstance } from 'fastify';
import { prisma } from '../db';

export async function statsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const [totalLugares, totalCategorias] = await Promise.all([
      prisma.lugar.count({ where: { ativo: true } }),
      prisma.categoria.count({ where: { ativo: true } }),
    ]);
    return { totalLugares, totalCategorias };
  });
}
