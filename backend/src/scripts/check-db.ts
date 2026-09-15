import 'dotenv/config';
import { prisma } from '../db';

async function main() {
  const categorias = await prisma.categoria.findMany();
  console.log('categorias:', categorias.length);

  const lugares = await prisma.lugar.findMany({
    where: { ativo: true },
    include: { categoria: true },
  });
  console.log('lugares ativos:', lugares.length);
  for (const l of lugares) {
    console.log(`  - ${l.nome} (${l.categoria.label}) destaque=${l.destaque}`);
  }

  const usuariosApp = await prisma.appUsuario.count();
  console.log('app_usuarios (tabela nova):', usuariosApp);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
