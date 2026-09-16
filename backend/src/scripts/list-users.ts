import 'dotenv/config';
import { prisma } from '../db';

async function main() {
  const usuarios = await prisma.appUsuario.findMany({
    select: { id: true, nome: true, email: true },
  });
  console.log(usuarios);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
