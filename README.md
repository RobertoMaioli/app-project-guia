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

| Ferramenta | Versão | Função |
|---|---|---|
| [Strapi](https://strapi.io) | 5.x | CMS headless / API REST + painel admin |
| Node.js | 24.x (LTS) | runtime |
| PostgreSQL | 16.x | banco de dados |
| Docker / Docker Compose | — | empacotamento do Strapi + Postgres |
| `@strapi/provider-upload-aws-s3` | — | upload de fotos direto pro S3 |

### Infraestrutura

| Ferramenta | Função |
|---|---|
| AWS Lightsail (Ubuntu 22.04 LTS) | servidor da API |
| Nginx + Certbot (Let's Encrypt) | reverse proxy e SSL grátis, subdomínio `api.SEUDOMINIO` |
| AWS S3 | armazenamento das fotos dos estabelecimentos |
| AWS CloudFront (opcional) | CDN das fotos |
| Lightsail Automatic Snapshots + `pg_dump` → S3 | backup |
| GitHub Actions | deploy automático no push pra `main` |

## Estrutura do repositório

```
app-project-guia/
├── app/                    # Expo / React Native (TypeScript)
├── backend/                # Strapi + Dockerfile + docker-compose.yml
├── .github/workflows/      # CI/CD
├── CLAUDE.md
└── README.md
```

## Status

Projeto em fase de definição de arquitetura — scaffold do app e do backend ainda não iniciado. Etapas detalhadas em [CLAUDE.md](CLAUDE.md#roadmap-etapas).
