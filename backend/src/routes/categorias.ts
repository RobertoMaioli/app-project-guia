import type { FastifyInstance } from 'fastify';
import { prisma } from '../db';

export async function categoriasRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return prisma.categoria.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
    });
  });
}
