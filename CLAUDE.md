# Guia Campo Belo & Região — App

App de curadoria de lugares (restaurantes, serviços, experiências) para Campo Belo, Brooklin, Moema e arredores. Mobile app (Android + iOS) com backend headless e painel para donos de negócio anunciarem seus estabelecimentos.

Referência de design: telas em alta-fidelidade já aprovadas (onboarding, cadastro/login, home com busca e categorias, mapa interativo, ficha do estabelecimento, avaliações, salvos, perfil, área da empresa com métricas). Paleta: verde escuro, dourado, creme. Tipografia arredondada/geométrica.

## Status atual

- Repositório GitHub conectado: `git@github.com:RobertoMaioli/app-project-guia.git`, branch `main`
- Domínio já registrado pelo usuário (definir qual e configurar DNS quando formos provisionar o Lightsail)
- **Já existe um site do Guia Campo Belo em produção**: PHP puro (sem framework), banco **MySQL** próprio, com painel admin já funcional onde o usuário gerencia estabelecimentos, categorias etc. Esse painel **continua sendo o sistema de gestão do catálogo** — não estamos recriando isso.
- **Fundação (ambiente) concluída**: app Expo + backend Node/Fastify/Prisma + MySQL local via Docker + autenticação (JWT) + navegação em abas + cliente de API — tudo testado de ponta a ponta no iPhone via Expo Go, dados reais na tela.
- Prisma na versão **6.x** (não 7 — o driver adapter de MySQL do Prisma 7 depende de um pacote com CVE alta sem correção).
- **Próximo bloco**: telas reais do app seguindo o design de referência (hoje só existem containers vazios de navegação — Início é a única que consome API de verdade, com uma lista crua).

## Decisões de arquitetura (e por quê)

### App mobile
- **React Native + Expo (TypeScript)** — escolhido principalmente porque o usuário desenvolve em **Windows** e o **EAS Build** compila Android e iOS na nuvem, sem precisar de Mac/Xcode local. Build de iOS exige apenas conta paga no Apple Developer Program (US$99/ano), gerenciada 100% pelo site da Apple.
- **EAS Submit** — publica direto na App Store Connect e Google Play Console via terminal.
- **Expo Go / dev client** — teste em iPhone/Android físico via QR code (`npx expo start`), sem simulador, sem Mac.
- **React Navigation** — navegação em abas (Início/Mapa/Salvos/Perfil) e pilhas de tela.
- **TanStack Query** — cache/sincronização dos dados vindos da API.
- **Zustand** — estado local leve (filtros, favoritos, tema).
- **NativeWind** (Tailwind para RN) — design system centralizado (cores, tipografia) pra manter consistência com as telas de referência.
- **react-native-maps** — tela de mapa com pins e "buscar nesta área".
- **expo-notifications** — push notifications (preferência "Notificações: Semanal" do perfil).
- **expo-secure-store** — armazenamento seguro do token de autenticação.

### Backend
**Decisão revista** (era Strapi + Postgres; trocado depois de descobrir que já existe site em produção): **API customizada em Node.js/TypeScript (Fastify + Prisma), conectada diretamente ao MySQL que o site já usa.**

Por quê:
- Já existe um painel admin no site atual gerenciando estabelecimentos/categorias — um CMS headless novo (Strapi) duplicaria essa gestão e arriscaria dessincronizar os dados entre site e app.
- Apontar o Strapi pra tentar "adotar" um schema MySQL feito à mão em PHP puro é frágil: Strapi espera controlar migrations e convenções de coluna/tabela que esse schema não segue.
- Prisma consegue introspectar (`prisma db pull`) o schema existente sem alterá-lo — a API lê/escreve nas tabelas que já existem sem exigir nenhuma mudança no site atual.
- Site e app passam a compartilhar o mesmo banco = mesma fonte da verdade, sem sincronização manual.

Como fica:
- **Leitura**: a API lê as tabelas existentes de estabelecimentos, categorias etc. (as mesmas que o painel admin do site edita).
- **Escrita nova**: tabelas adicionais só para o que não existe hoje — contas de usuário do app, favoritos, avaliações feitas pelo app, tokens de push. Não tocam no schema existente.
- **"Área da empresa" do app** (métricas, editar perfil pelo dono do negócio): passa pela API nova, que aplica suas próprias regras antes de gravar nas tabelas compartilhadas — mantém uma única porta de entrada controlada para escrita nos dados do site, mesmo compartilhando o banco.
- **Fluxo sempre em camadas**, igual seria com Strapi: `App → HTTPS → API Node/Fastify → MySQL`. O app nunca acessa o banco diretamente.
- **Autenticação**: JWT próprio na API, para contas de usuário do app (login de quem usa o guia) — não é o mesmo login do painel admin do site. Google OAuth cobre os botões "Continuar/Entrar com Google" das telas.
- **Docker + Docker Compose**: container da API Node na mesma instância Lightsail. O MySQL pode continuar onde já está hospedado hoje, ou migrar pra um container/RDS depois — a definir quando virmos onde o site está hospedado atualmente.

**Pendência**: levantar o schema real do MySQL (dump `--no-data` ou acesso de leitura) antes de desenhar os endpoints e as tabelas novas.

### Infraestrutura
- **AWS Lightsail** (Ubuntu 22.04, blueprint "OS Only") — escolhido em vez de Railway/Render pelo **controle de custo previsível** (o usuário priorizou isso conscientemente sobre a menor manutenção de um PaaS). Plano inicial $10/mês (2GB RAM), com upgrade via snapshot quando necessário.
- **Nginx + Certbot (Let's Encrypt)** — reverse proxy e SSL grátis. A API Node roda internamente numa porta interna (ex: 3333, nunca exposta); o Nginx escuta 80/443 e expõe a API em subdomínio (ex: `api.SEUDOMINIO.com.br`), **sem porta na URL**.
- **AWS S3** — armazenamento das fotos dos estabelecimentos via SDK da AWS direto na API (evita encher o disco da instância).
- **AWS CloudFront** (opcional) — CDN na frente do S3 pra acelerar carregamento de fotos no app.
- **Backup**: Lightsail Automatic Snapshots (diário, instância inteira) + cron com `mysqldump` subindo pro S3 (banco isolado). Ajustar conforme onde o MySQL do site atual estiver hospedado.
- **Firewall Lightsail**: só portas 80, 443, 22 (SSH por chave, sem senha).
- **Deploy**: GitHub Actions via SSH → `git pull && docker compose up -d --build` no push pra `main`.

### Estrutura do repositório
Monorepo (não dois repos separados) — decisão: manter mudanças de app e API rastreáveis no mesmo histórico, já que é equipe pequena/solo.

```
app-project-guia/
├── app/                    # Expo / React Native (TypeScript)
├── backend/                # API Node/Fastify + Prisma + Dockerfile + docker-compose.yml
├── .github/workflows/      # CI/CD (path filters: só builda o que mudou)
├── CLAUDE.md                # este arquivo
└── README.md
```

## Roadmap (etapas)

1. ✅ **Scaffold do app** — projeto Expo (TypeScript) em `/app`, React Navigation, NativeWind, TanStack Query, Zustand instalados; estrutura de pastas criada; testado em iPhone real via Expo Go.
2. ✅ **Scaffold do backend** — Node/TypeScript (Fastify) em `/backend`, Prisma 6.x mapeando o schema real do site (leitura) + tabelas novas do app (`app_usuarios`, `app_favoritos`, `app_push_tokens`, `app_metricas`); MySQL local via Docker com a estrutura real (sem dados de cliente).
2.1. ✅ **Rotas base** — `GET /categorias`, `GET /lugares` (com filtros), `GET /lugares/:slug` (ficha completa).
2.2. ✅ **Autenticação da API** — CORS, JWT (`@fastify/jwt`), `POST /auth/cadastro`, `POST /auth/login`, `GET /auth/me` protegida. Testado de ponta a ponta.
2.3. ✅ **Casca do app** — navegação em abas (Início/Mapa/Salvos/Perfil, ainda placeholders exceto Início), cliente de API (`apiFetch` + hooks TanStack Query), tela Início já consumindo `/categorias` de verdade.
2.4. ✅ **Teste ponta a ponta local** — app no iPhone via Expo Go + backend + MySQL rodando na máquina, dados reais na tela. **Fundação/ambiente concluída.**
3. **Provisionar Lightsail** — criar instância Ubuntu 22.04, configurar firewall, instalar Docker, subir containers, configurar Nginx + Certbot no subdomínio `api.SEUDOMINIO`, apontar DNS.
4. **Auth no app + Google OAuth** — telas de login/cadastro consumindo `/auth`; armazenamento do token via expo-secure-store.
5. **Telas core do app** (próximo bloco — ainda não iniciado) — onboarding, home (busca + categorias + seleções da semana), mapa, ficha do estabelecimento, avaliações, salvos, perfil — seguindo o design de referência. Hoje só existem containers vazios de navegação, não as telas reais.
6. **Área da empresa** — painel de métricas (visualizações, cliques WhatsApp, pedidos de rota), edição de perfil/fotos/horários pelo dono do negócio, escrevendo nas tabelas compartilhadas via a API (nunca direto).
7. **Mídia** — integrar upload direto pro S3 na API (SDK da AWS); opcional CloudFront.
8. **CI/CD** — GitHub Actions pro deploy do backend (path filter `/backend`); configurar EAS Build/Submit pro app.
9. **Testes em dispositivo real** — Expo Go via QR code, iOS e Android.
10. **Preparação pras lojas** — conta Apple Developer Program, conta Google Play Console, ícones, screenshots, política de privacidade.
11. **Lançamento**.

## Convenções e preferências do usuário

- Comunicação em português.
- Prioriza controle de custo de infraestrutura sobre menor esforço de manutenção (por isso Lightsail em vez de Railway/Render).
- Ambiente de desenvolvimento é Windows — qualquer sugestão que dependa de macOS precisa de alternativa (daí EAS Build/Submit em vez de Xcode local).
