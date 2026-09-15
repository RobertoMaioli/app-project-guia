# Guia Campo Belo & Região

App de curadoria de lugares — restaurantes, serviços e experiências verificados em Campo Belo, Brooklin, Moema e arredores. Android e iOS a partir de um único código-fonte, com painel para donos de negócio anunciarem seus estabelecimentos.

> Documentação de decisões de arquitetura e roadmap: veja [CLAUDE.md](CLAUDE.md).

## Stack

### App (`/app`)

| Ferramenta | Versão | Função |
|---|---|---|
| [Expo](https://expo.dev) | SDK 57 | framework/toolchain do React Native |
| React Native | 0.86 (via Expo SDK 57) | base do app |
| React | 19.2 | UI |
| TypeScript | 5.x | linguagem |
| EAS Build / EAS Submit | — | build e publicação nas lojas (Android + iOS, sem Mac) |
| React Navigation | 7.x | navegação (abas, pilhas de tela) |
| TanStack Query | 5.x | cache/sincronização com a API |
| Zustand | 5.x | estado local (filtros, favoritos, tema) |
| NativeWind | 4.x | estilo (Tailwind CSS para React Native) |
| react-native-maps | — | mapa interativo com pins |
| expo-notifications | — | push notifications |
| expo-secure-store | — | armazenamento seguro do token de autenticação |

### Backend (`/backend`)

API customizada — **não** é mais Strapi. Motivo: já existe um site (PHP puro) em produção com painel admin próprio gerenciando estabelecimentos/categorias num banco **MySQL** existente. Em vez de duplicar essa gestão num CMS novo, construímos uma API leve que lê/escreve nesse mesmo banco, mantendo site e app sincronizados numa única fonte de dados. Ver [CLAUDE.md](CLAUDE.md) para o racional completo.

| Ferramenta | Versão | Função |
|---|---|---|
| Node.js | 24.x (LTS) | runtime |
| Fastify | 5.x | framework HTTP da API |
| TypeScript | 5.x | linguagem |
| Prisma ORM | 6.x (não 7 — o driver adapter de MySQL do Prisma 7 depende de um pacote com vulnerabilidade sem correção; não 8, ainda sem suporte a MySQL) | acesso tipado ao MySQL existente, sem alterar o schema do site |
| MySQL | (o mesmo banco que o site atual já usa) | banco de dados |
| JWT (`@fastify/jwt`) | — | autenticação das contas de usuário do app |
| AWS SDK (`@aws-sdk/client-s3`) | — | upload de fotos direto pro S3 |
| Docker / Docker Compose | — | empacotamento da API |

### Infraestrutura

| Ferramenta | Função |
|---|---|
| AWS Lightsail (Ubuntu 22.04 LTS) | servidor da API |
| Nginx + Certbot (Let's Encrypt) | reverse proxy e SSL grátis, subdomínio `api.SEUDOMINIO` |
| AWS S3 | armazenamento das fotos dos estabelecimentos |
| AWS CloudFront (opcional) | CDN das fotos |
| Lightsail Automatic Snapshots + `mysqldump` → S3 | backup |
| GitHub Actions | deploy automático no push pra `main` |

## Estrutura do repositório

```
app-project-guia/
├── app/                    # Expo / React Native (TypeScript)
├── backend/                # API Node/Fastify + Prisma + Dockerfile + docker-compose.yml
├── .github/workflows/      # CI/CD
├── CLAUDE.md
└── README.md
```

## Status

Fundação concluída: app + backend + banco local + autenticação + navegação testados de ponta a ponta num dispositivo real. Próximo bloco: construir as telas reais do app seguindo o design de referência. Etapas detalhadas em [CLAUDE.md](CLAUDE.md#roadmap-etapas).
