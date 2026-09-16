import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../db';

interface CadastroBody {
  nome: string;
  email: string;
  senha: string;
}

interface LoginBody {
  email: string;
  senha: string;
}

interface GoogleBody {
  idToken: string;
}

const GOOGLE_CLIENT_IDS = [
  process.env.GOOGLE_WEB_CLIENT_ID,
  process.env.GOOGLE_IOS_CLIENT_ID,
  process.env.GOOGLE_ANDROID_CLIENT_ID,
].filter((id): id is string => Boolean(id));

const googleClient = new OAuth2Client();

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: CadastroBody }>('/cadastro', async (request, reply) => {
    const { nome, email, senha } = request.body;

    if (!nome || !email || !senha || senha.length < 8) {
      return reply.code(400).send({ error: 'Nome, e-mail e senha (mínimo 8 caracteres) são obrigatórios' });
    }

    const existente = await prisma.appUsuario.findUnique({ where: { email } });
    if (existente) {
      return reply.code(409).send({ error: 'Já existe uma conta com esse e-mail' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.appUsuario.create({
      data: { nome, email, senhaHash },
    });

    const token = app.jwt.sign({ sub: usuario.id, email: usuario.email });
    return reply.code(201).send({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  });

  app.post<{ Body: LoginBody }>('/login', async (request, reply) => {
    const { email, senha } = request.body;

    const usuario = await prisma.appUsuario.findUnique({ where: { email } });
    if (!usuario || !usuario.senhaHash) {
      return reply.code(401).send({ error: 'E-mail ou senha inválidos' });
    }

    const senhaOk = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaOk) {
      return reply.code(401).send({ error: 'E-mail ou senha inválidos' });
    }

    const token = app.jwt.sign({ sub: usuario.id, email: usuario.email });
    return { token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } };
  });

  app.post<{ Body: GoogleBody }>('/google', async (request, reply) => {
    const { idToken } = request.body;

    if (!idToken) {
      return reply.code(400).send({ error: 'idToken é obrigatório' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_IDS });
      payload = ticket.getPayload();
    } catch {
      return reply.code(401).send({ error: 'Token do Google inválido' });
    }

    if (!payload || !payload.email || !payload.email_verified) {
      return reply.code(401).send({ error: 'Token do Google inválido' });
    }

    const googleId = payload.sub;
    const email = payload.email;
    const nome = payload.name ?? email;
    const fotoUrl = payload.picture;

    let usuario = await prisma.appUsuario.findUnique({ where: { googleId } });

    if (!usuario) {
      const existentePorEmail = await prisma.appUsuario.findUnique({ where: { email } });
      if (existentePorEmail) {
        return reply.code(409).send({ error: 'Já existe uma conta com esse e-mail' });
      }
      usuario = await prisma.appUsuario.create({
        data: { nome, email, googleId, fotoUrl },
      });
    }

    const token = app.jwt.sign({ sub: usuario.id, email: usuario.email });
    return { token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } };
  });

  app.get('/me', { preHandler: [app.authenticate] }, async (request) => {
    const payload = request.user as { sub: number };
    const usuario = await prisma.appUsuario.findUnique({ where: { id: payload.sub } });
    if (!usuario) {
      return { usuario: null };
    }
    return { usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } };
  });
}
