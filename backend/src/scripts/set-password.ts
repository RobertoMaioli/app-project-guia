import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';

// Utilitário de dev: contorna a validação de 8+ caracteres da rota /auth/cadastro
// pra permitir senha curta em teste local rápido. Nunca usar isso perto de produção.
const [, , email, novaSenha] = process.argv;

async function main() {
  if (!email || !novaSenha) {
    console.error('uso: npx tsx src/scripts/set-password.ts <email> <novaSenha>');
    process.exit(1);
  }
  const senhaHash = await bcrypt.hash(novaSenha, 10);
  const usuario = await prisma.appUsuario.update({
    where: { email },
    data: { senhaHash },
  });
  console.log(`senha atualizada para ${usuario.email}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
