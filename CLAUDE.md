# Guia Campo Belo & Região — App

App de curadoria de lugares (restaurantes, serviços, experiências) para Campo Belo, Brooklin, Moema e arredores. Mobile app (Android + iOS) com backend headless e painel para donos de negócio anunciarem seus estabelecimentos.

Referência de design: telas em alta-fidelidade já aprovadas (onboarding, cadastro/login, home com busca e categorias, mapa interativo, ficha do estabelecimento, avaliações, salvos, perfil, área da empresa com métricas). Paleta: verde escuro, dourado, creme. Tipografia arredondada/geométrica.

## Status atual

- Repositório GitHub conectado: `git@github.com:RobertoMaioli/app-project-guia.git`, branch `main`
- Domínio já registrado pelo usuário (definir qual e configurar DNS quando formos provisionar o Lightsail)
- Nenhum código de app ou backend criado ainda — próximo passo é o scaffold (ver Roadmap)

## Decisões de arquitetura (e por quê)

### App mobile
- **React Native + Expo (TypeScript)** — escolhido principalmente porque o usuário desenvolve em **Windows** e o **EAS Build** compila Android e iOS na nuvem, sem precisar de Mac/Xcode local. Build de iOS exige apenas conta paga no Apple Developer Program (US$99/ano), gerenciada 100% pelo site da Apple.
- **EAS Submit** — publica direto na App Store Connect e Google Play Console via terminal.
- **Expo Go / dev client** — teste em iPhone/Android físico via QR code (`npx expo start`), sem simulador, sem Mac.
- **React Navigation** — navegação em abas (Início/Mapa/Salvos/Perfil) e pilhas de tela.
- **TanStack Query** — cache/sincronização dos dados vindos da API do Strapi.
- **Zustand** — estado local leve (filtros, favoritos, tema).
- **NativeWind** (Tailwind para RN) — design system centralizado (cores, tipografia) pra manter consistência com as telas de referência.
- **react-native-maps** — tela de mapa com pins e "buscar nesta área".
- **expo-notifications** — push notifications (preferência "Notificações: Semanal" do perfil).
- **expo-secure-store** — armazenamento seguro do token de autenticação.

### Backend
- **Strapi (headless CMS) + PostgreSQL** — dá painel admin pronto pra cadastrar/editar estabelecimentos, categorias, avaliações sem construir CRUD do zero; API REST/GraphQL gerada automaticamente; sistema de permissões por papel (usuário comum / dono de empresa / admin) já embutido, mapeando direto pra tela "Área da empresa".
- **Autenticação**: Strapi Users & Permissions + Google OAuth (cobre os botões "Continuar/Entrar com Google" das telas).
- **Docker + Docker Compose**: containers de Strapi + Postgres na mesma instância Lightsail.

### Infraestrutura
- **AWS Lightsail** (Ubuntu 22.04, blueprint "OS Only") — escolhido em vez de Railway/Render pelo **controle de custo previsível** (o usuário priorizou isso conscientemente sobre a menor manutenção de um PaaS). Plano inicial $10/mês (2GB RAM), com upgrade via snapshot quando necessário.
- **Nginx + Certbot (Let's Encrypt)** — reverse proxy e SSL grátis. O Strapi roda internamente na porta 1337 (nunca exposta); o Nginx escuta 80/443 e expõe a API em subdomínio (ex: `api.SEUDOMINIO.com.br`), **sem porta na URL**.
- **AWS S3** — armazenamento das fotos dos estabelecimentos via `@strapi/provider-upload-aws-s3` (evita encher o disco da instância).
- **AWS CloudFront** (opcional) — CDN na frente do S3 pra acelerar carregamento de fotos no app.
- **Backup**: Lightsail Automatic Snapshots (diário, instância inteira) + cron com `pg_dump` subindo pro S3 (banco isolado).
- **Firewall Lightsail**: só portas 80, 443, 22 (SSH por chave, sem senha).
- **Deploy**: GitHub Actions via SSH → `git pull && docker compose up -d --build` no push pra `main`.

### Estrutura do repositório
Monorepo (não dois repos separados) — decisão: manter mudanças de app e API rastreáveis no mesmo histórico, já que é equipe pequena/solo.

```
app-project-guia/
├── app/                    # Expo / React Native (TypeScript)
├── backend/                # Strapi + Dockerfile + docker-compose.yml
├── .github/workflows/      # CI/CD (path filters: só builda o que mudou)
├── CLAUDE.md                # este arquivo
└── README.md
```

## Roadmap (etapas)

1. **Scaffold do app** — criar projeto Expo (TypeScript) em `/app`, instalar React Navigation, NativeWind, TanStack Query, Zustand; estruturar pastas (screens, components, theme com paleta do design).
2. **Scaffold do backend** — criar projeto Strapi em `/backend`, Dockerfile + docker-compose.yml (Strapi + Postgres), modelar content types: Estabelecimento, Categoria, Avaliação, Usuário/Empresa, Foto.
3. **Provisionar Lightsail** — criar instância Ubuntu 22.04, configurar firewall, instalar Docker, subir containers, configurar Nginx + Certbot no subdomínio `api.SEUDOMINIO`, apontar DNS.
4. **Autenticação** — Users & Permissions + Google OAuth no Strapi; telas de login/cadastro no app; armazenamento do token via expo-secure-store.
5. **Telas core do app** — onboarding, home (busca + categorias + seleções da semana), mapa, ficha do estabelecimento, avaliações, salvos, perfil — seguindo o design de referência.
6. **Área da empresa** — painel de métricas (visualizações, cliques WhatsApp, pedidos de rota), edição de perfil/fotos/horários pelo dono do negócio.
7. **Mídia** — integrar upload provider S3 no Strapi; opcional CloudFront.
8. **CI/CD** — GitHub Actions pro deploy do backend (path filter `/backend`); configurar EAS Build/Submit pro app.
9. **Testes em dispositivo real** — Expo Go via QR code, iOS e Android.
10. **Preparação pras lojas** — conta Apple Developer Program, conta Google Play Console, ícones, screenshots, política de privacidade.
11. **Lançamento**.

## Convenções e preferências do usuário

- Comunicação em português.
- Prioriza controle de custo de infraestrutura sobre menor esforço de manutenção (por isso Lightsail em vez de Railway/Render).
- Ambiente de desenvolvimento é Windows — qualquer sugestão que dependa de macOS precisa de alternativa (daí EAS Build/Submit em vez de Xcode local).
