import type { FastifyInstance } from 'fastify';
import { prisma } from '../db';

interface LugaresQuery {
  categoria?: string;
  busca?: string;
  destaque?: string;
}

export async function lugaresRoutes(app: FastifyInstance) {
  app.get<{ Querystring: LugaresQuery }>('/', async (request) => {
    const { categoria, busca, destaque } = request.query;

    return prisma.lugar.findMany({
      where: {
        ativo: true,
        ...(categoria ? { categoria: { slug: categoria } } : {}),
        ...(busca ? { nome: { contains: busca } } : {}),
        ...(destaque === 'true' ? { destaque: true } : {}),
      },
      orderBy: [{ destaque: 'desc' }, { rating: 'desc' }],
      include: {
        categoria: true,
        fotos: { where: { principal: true }, take: 1 },
      },
    });
  });

  app.get<{ Params: { slug: string } }>('/:slug', async (request, reply) => {
    const lugar = await prisma.lugar.findFirst({
      where: { slug: request.params.slug, ativo: true },
      include: {
        categoria: true,
        fotos: { orderBy: { ordem: 'asc' } },
        horarios: { orderBy: { diaSemana: 'asc' } },
        servicos: { include: { servico: true } },
        tags: { include: { tag: true } },
        avaliacoes: {
          where: { aprovado: true },
          orderBy: { dataAvaliacao: 'desc' },
        },
      },
    });

    if (!lugar) {
      return reply.code(404).send({ error: 'Lugar não encontrado' });
    }

    const { servicos, tags, ...resto } = lugar;
    return {
      ...resto,
      servicos: servicos.map((s) => s.servico),
      tags: tags.map((t) => t.tag),
    };
  });
}
