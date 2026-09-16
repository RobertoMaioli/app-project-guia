import 'dotenv/config';
import { prisma } from '../db';

const [, , email] = process.argv;

async function main() {
  const deleted = await prisma.appUsuario.deleteMany({ where: { email } });
  console.log(`Removidos: ${deleted.count}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
