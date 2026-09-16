# Guia Campo Belo & Região — App

App de curadoria de lugares (restaurantes, serviços, experiências) para Campo Belo, Brooklin, Moema e arredores. Mobile app (Android + iOS) com backend próprio, compartilhando o mesmo banco MySQL do site PHP já em produção.

## Status atual (visão rápida)

- **Site PHP já em produção no AWS Lightsail** (instância existente, IP `52.202.118.111`, usuário SSH `ubuntu`, chave em `E:\Workspace\G\Guia Campo Belo\App\LightsailDefaultKey-us-east-1.pem`). MySQL 8.0.35 nessa mesma instância, acessível **só via socket local** (nem localhost TCP) — de fora só dá pra conectar via túnel SSH. Banco real se chama `guiacampobelo`.
- **Essa instância hospeda outros sites PHP também** (não é dedicada ao Guia Campo Belo) — por isso a decisão é **migrar pra uma instância Lightsail nova e dedicada** quando formos fazer o deploy real do backend + app em produção (não reaproveitar essa).
- Design System completo entregue em `Design-System/` (fora do repo do app, em `E:\Workspace\G\Guia Campo Belo\Design-System\`) — tokens, componentes, kits de tela, e handoffs hi-fi por tela em `Design-System/Guia Campo Belo App/design_handoff_<tela>_guia_campo_belo/README.md`. **Essa é a fonte de verdade pro visual de cada tela**, não o NativeWind genérico usado no scaffold inicial.
- **Telas reais construídas até agora**: Splash, Capa (hero), Login — todas seguindo os handoffs hi-fi à risca (cores, tipografia, medidas). Cadastro e as demais ainda são placeholder.
- Schema do Prisma **validado contra o banco de produção real** (via túnel SSH temporário) — bate certinho (33 categorias, 25 lugares reais). Tabela `app_usuarios` já existe em produção também.
- Repositório GitHub: `git@github.com:RobertoMaioli/app-project-guia.git`, branch `main`.

## Decisões de arquitetura (e por quê)

### App mobile
- **React Native + Expo (TypeScript)** — Windows sem Mac; **EAS Build** compila Android e iOS na nuvem. iOS só exige conta Apple Developer Program (US$99/ano).
- **React Navigation** (native-stack + bottom-tabs) — fluxo real: `Splash → Capa → Login/Cadastro → Main (tabs)`.
- **TanStack Query** — cache/sincronização dos dados da API.
- **react-native-svg** — todo gradiente/textura/ícone SVG das telas hi-fi (Splash, Capa, Login) é desenhado com primitivas SVG (`RadialGradient`, `LinearGradient`, `G`/`Line` pra textura diagonal), não CSS. **Cuidado**: `Pattern` + `patternTransform` do react-native-svg tem bug de renderização nesse setup (não desenha nada) — a textura diagonal usa um componente próprio (`src/components/StripeTexture.tsx`) com várias `<Line>` dentro de um `<G>` rotacionado, não `Pattern`.
- **lucide-react-native** — ícones que faltam no set próprio da marca (o Design System já previa isso).
- **expo-font + @expo-google-fonts/bodoni-moda + @expo-google-fonts/jost** — as duas fontes de marca (Bodoni Moda pra títulos, Jost pra interface), carregadas no `App.tsx` segurando a splash nativa (`expo-splash-screen`) até estarem prontas.
- **expo-secure-store** — token de autenticação salvo aqui (`src/api/auth.ts`).
- **expo-haptics** — feedback tátil em erros de formulário (ex: login inválido).
- **Armadilha de RN recorrente**: `lineHeight` menor que o `fontSize` em texto Bodoni Moda (serifada) **corta letras de verdade** no React Native (diferente do CSS do handoff, que usa `line-height: .95/1` sem problema no navegador). Fator seguro padronizado em `src/theme/typography.ts` (`bodoniLineHeight()`, 1.25x) — usar sempre que um título novo usar Bodoni Moda.
- **NativeWind** ainda está instalado e é usado nas telas mais antigas/placeholder (Home, Mapa, Salvos, Perfil), mas as telas novas seguindo os handoffs hi-fi usam `StyleSheet` puro — os valores dos handoffs (letter-spacing, cores exatas, etc.) ficam mais previsíveis assim do que tentando forçar em classes Tailwind.

### Backend
**API customizada em Node.js/TypeScript (Fastify + Prisma 6.x), conectada ao MESMO MySQL que o site PHP já usa** — não é um banco espelhado nem sincronizado, é literalmente o mesmo banco físico, só com tabelas novas isoladas por cima.

- **Leitura**: tabelas existentes do site (`lugares`, `categorias`, `fotos`, `horarios`, `avaliacoes`, `servicos`, `tags`, junctions) — nunca alteradas.
- **Escrita nova, tabelas próprias do app**: `app_usuarios`, `app_favoritos`, `app_push_tokens`, `app_metricas` — deliberadamente **separadas** da tabela `usuarios` que já existe (essa é do login de dono de empresa/`empresa/` portal do site, um sistema de conta diferente, inclusive ligado a pagamento via Asaas — não faz sentido nem é seguro misturar com conta de app consumidor).
- **Fluxo sempre em camadas**: `App → HTTPS → API Node/Fastify → MySQL`. O app nunca acessa o banco diretamente.
- **Autenticação**: JWT próprio (`@fastify/jwt`) pra contas de usuário do app. Rotas `POST /auth/cadastro`, `POST /auth/login`, `GET /auth/me` (protegida) — todas testadas contra produção real.
- Prisma na versão **6.x** (não 7 — o driver adapter de MySQL do Prisma 7 depende de um pacote com CVE alta sem correção; não 8, ainda sem suporte a MySQL).

### Testar contra o banco de produção real (sem deploy)
Processo já validado uma vez, repetir sempre que precisar:
1. Túnel SSH: `ssh -i <caminho-da-chave.pem> -N -L 3307:localhost:3306 ubuntu@52.202.118.111`
2. `backend/.env.production.local` (gitignorado — `.gitignore` cobre `.env.*` exceto `.env.example`) com `DATABASE_URL="mysql://<user>:<senha>@127.0.0.1:3307/guiacampobelo?charset=utf8mb4"`
3. Rodar backend com esse env: `DOTENV_CONFIG_PATH=.env.production.local npx tsx -r dotenv/config src/server.ts`
4. **Sempre fechar o túnel e o backend depois do teste** — não deixar ponte pra produção aberta sem necessidade.
5. Scripts úteis em `backend/src/scripts/`: `check-db.ts` (conta categorias/lugares/app_usuarios), `list-users.ts`, `set-password.ts <email> <senha>` (bypassa a validação de 8+ caracteres da rota, só pra teste local).

### Infraestrutura (deploy real — ainda não feito)
- **Nova instância Lightsail dedicada** (não a atual, que é compartilhada com outros sites) — a decidir tamanho/preço quando chegarmos nessa etapa.
- **Nginx + Certbot** — reverse proxy, API Node numa porta interna exposta em subdomínio (`api.SEUDOMINIO.com.br`), sem porta na URL.
- **Migração do banco**: `mysqldump` do banco atual → restaurar na instância nova. Só troca `DATABASE_URL` e DNS depois — nenhuma mudança de código.
- **AWS S3** — fotos dos estabelecimentos (ainda não implementado).

### Estrutura do repositório
```
app-project-guia/
├── app/                    # Expo / React Native (TypeScript)
├── backend/                # API Node/Fastify + Prisma + Dockerfile + docker-compose.yml
├── CLAUDE.md
└── README.md
```
(Design System fica FORA deste repo, em `E:\Workspace\G\Guia Campo Belo\Design-System\`.)

## Roadmap (etapas)

1. ✅ Scaffold do app (Expo, navegação, TanStack Query).
2. ✅ Scaffold do backend (Fastify + Prisma 6.x, schema mapeando o site real + tabelas novas do app).
3. ✅ Rotas base (`/categorias`, `/lugares`, `/lugares/:slug`, `/stats`).
4. ✅ Autenticação da API (`/auth/cadastro`, `/auth/login`, `/auth/me`) — testada localmente **e contra produção real**.
5. ✅ Splash screen (handoff hi-fi).
6. ✅ Capa/Hero screen (handoff hi-fi, foto real + zoom lento, stats dinâmicos via `/stats`).
7. ✅ Login screen (handoff hi-fi, auth real, toggle de senha, erro com haptics).
8. **Cadastro screen** (próximo passo) — mesmo padrão da Login, compartilha `GoogleButton`.
9. Google OAuth de verdade (Login + Cadastro) — hoje é só botão fantasma. Precisa: credenciais no Google Cloud Console, lib (`expo-auth-session` ou `@react-native-google-signin/google-signin`), rota backend que recebe token do Google e cria/vincula `AppUsuario` via `google_id`.
10. Demais telas core (Home real, Mapa, ficha do estabelecimento, avaliações, salvos, perfil) seguindo os handoffs restantes do Design System.
11. Área da empresa (métricas, edição de perfil/fotos/horários).
12. Migrar pra instância Lightsail dedicada + deploy real (Nginx, Docker, DNS).
13. Mídia (S3 pra fotos).
14. CI/CD (GitHub Actions).
15. Preparação pras lojas (Apple Developer, Google Play, ícones, política de privacidade).
16. Lançamento.

## Convenções e preferências do usuário

- Comunicação em português.
- Trabalha ponto a ponto — confirmar antes de cada passo grande, não emendar várias mudanças sem checar.
- Prioriza controle de custo de infraestrutura sobre menor esforço de manutenção (Lightsail em vez de PaaS).
- Ambiente de desenvolvimento é Windows — qualquer sugestão que dependa de macOS precisa de alternativa.
- Nunca commitar/expor credencial real (produção) em nada versionado — sempre `.env.*` gitignorado, nunca hardcoded.
