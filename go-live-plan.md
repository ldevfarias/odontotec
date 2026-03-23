# 🚀 OdontoTec — Go-Live Plan

> Última atualização: 23/03/2026
> Repositório: GitHub · Stack: Next.js + NestJS + PostgreSQL

---

## Arquitetura de Produção

```
GitHub → GitHub Actions (CI/CD)
              ├── Vercel (projeto: landing)   → seudominio.com.br        (apps/landing)
              ├── Vercel (projeto: saas)      → app.seudominio.com.br    (apps/odonto-front)
              └── Fly.io  (app: odontotec)    → api.seudominio.com.br    (apps/odonto-api)
                       │
          Cloudflare   ├── DNS + CDN + DDoS protection
                       └── R2 Storage (documentos/uploads)

Serviços externos:
  Resend  → Emails transacionais
  Stripe  → Pagamentos e assinaturas
  Neon / Supabase / Fly Postgres → PostgreSQL
```

### Mapa de Domínios

| Subdomínio | App | Hospedagem |
| --- | --- | --- |
| `seudominio.com.br` + `www.` | Landing page (`apps/landing`) | Vercel — projeto `odontotec-landing` |
| `app.seudominio.com.br` | Dashboard SaaS (`apps/odonto-front`) | Vercel — projeto `odontotec-app` |
| `api.seudominio.com.br` | API NestJS (`apps/odonto-api`) | Fly.io — app `odontotec` |

> **Como funciona no Vercel:** você cria dois projetos separados no mesmo monorepo, cada um apontando para o seu `Root Directory` (`apps/landing` e `apps/odonto-front`). Cada projeto recebe seu próprio domínio.

---

## Custo Estimado

| Serviço | Plano | Custo/mês |
|---------|-------|-----------|
| Vercel | Hobby | **Grátis** |
| Fly.io | Pay-as-you-go (shared-cpu-1x) | ~R$ 30–60 |
| Cloudflare R2 | Free tier (10GB) | **Grátis** |
| Cloudflare DNS / CDN | Free | **Grátis** |
| Resend | Free (3.000 emails/mês) | **Grátis** |
| Domínio | ~R$ 50/ano | ~R$ 5/mês |
| **Total** | | **~R$ 35–65/mês** |

---

## Checklist de Go-Live

### Fase 1 — Infraestrutura

- [ ] Registrar domínio no [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)
- [ ] Instalar o CLI do Fly: `curl -L https://fly.io/install.sh | sh`
- [ ] Criar conta no [Fly.io](https://fly.io) e fazer login: `flyctl auth login`
- [ ] Confirmar que `fly.toml` está na raiz do repositório (app `odontotec`, region `gru`)
- [ ] Provisionar banco de dados PostgreSQL (Fly Postgres, Neon ou Supabase) e copiar a connection string
- [ ] Criar conta no [Vercel](https://vercel.com) e conectar o GitHub repo
- [ ] Criar **dois projetos** no Vercel no mesmo repo:
  - `odontotec-landing` → Root Directory: `apps/landing` → domínio `seudominio.com.br` + `www.seudominio.com.br`
  - `odontotec-app` → Root Directory: `apps/odonto-front` → domínio `app.seudominio.com.br`
- [ ] Apontar subdomínio `api.` (CNAME) para o hostname do app no Fly.io e adicionar o domínio customizado: `flyctl certs add api.seudominio.com.br`

### Fase 2 — Configuração de Serviços

- [ ] Verificar domínio no **Resend** e adicionar registros DNS (SPF + DKIM) no Cloudflare
- [ ] Atualizar `RESEND_FROM_EMAIL` para `noreply@seudominio.com.br`
- [ ] Criar bucket `odontotec-docs` no **Cloudflare R2**
- [ ] Ativar chaves **LIVE** no **Stripe** (trocar `sk_test_` → `sk_live_`)
- [ ] Criar novo **Webhook Stripe** apontando para `https://api.seudominio.com.br/subscription/webhook`
- [ ] Recriar os **Price IDs LIVE** no Stripe e atualizar nas secrets do Fly.io
- [ ] Confirmar que o `fly.toml` usa o `release_command` para rodar migrations:

  ```toml
  [deploy]
    release_command = "node dist/src/run-migrations.js"
  ```

### Fase 3 — Variáveis de Ambiente (Fly.io)

Setar via `flyctl secrets set CHAVE=valor` ou pelo dashboard do Fly.io:

- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` → connection string completa do PostgreSQL
- [ ] `JWT_SECRET` → gerar novo (`openssl rand -hex 64`)
- [ ] `JWT_REFRESH_SECRET` → gerar novo (`openssl rand -hex 64`)
- [ ] `FRONTEND_URL=https://app.seudominio.com.br` → deve bater exatamente com o domínio do SaaS (CORS quebra se errar)
- [ ] `COOKIE_DOMAIN=.seudominio.com.br` → necessário para cookies funcionarem entre `api.` e `app.` (subdomínios diferentes)
- [ ] `RESEND_API_KEY` → chave de produção do Resend
- [ ] `RESEND_FROM_EMAIL=noreply@seudominio.com.br`
- [ ] `STRIPE_SECRET_KEY` → chave live
- [ ] `STRIPE_WEBHOOK_SECRET` → secret do webhook live
- [ ] `STRIPE_PRICE_ID_EARLY_ADOPTER` → price ID live
- [ ] `STRIPE_PRICE_ID_PROFESSIONAL` → price ID live
- [ ] `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

> **Atenção:** `COOKIE_DOMAIN=.seudominio.com.br` (com o ponto inicial) é obrigatório em produção. Sem ele, os cookies setados pela API em `api.` não chegam ao Next.js em `app.`, quebrando o fluxo de autenticação/onboarding.

### Fase 4 — Variáveis de Ambiente (Vercel)

**Projeto `odontotec-app` (SaaS dashboard):**

- [ ] `NEXT_PUBLIC_API_URL=https://api.seudominio.com.br`
- [ ] `JWT_SECRET` → mesmo valor usado no Fly.io (necessário para o middleware Next.js verificar o token)
- [ ] `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` → token de produção do PostHog
- [ ] `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`

**Projeto `odontotec-landing` (Landing page):**

- [ ] Sem variáveis obrigatórias (verificar se o app usa alguma)

### Fase 5 — GitHub Actions (CI/CD)

- [ ] Adicionar secret `FLY_API_TOKEN` no GitHub (Settings → Secrets) — obtido via `flyctl auth token`
- [ ] Adicionar secret `NEXT_PUBLIC_API_URL` no GitHub (Settings → Secrets)
- [ ] Confirmar que `.github/workflows/deploy.yml` está na branch `main`
- [ ] Testar pipeline com um PR de teste antes do go-live

### Fase 6 — Banco de Dados

- [ ] Confirmar que as migrations rodam via `release_command` no `fly.toml` antes de cada deploy
- [ ] Verificar `synchronize: false` em produção (já configurado no `app.module.ts`)

### Fase 7 — Validação Final

- [ ] Testar fluxo completo: cadastro → verificação de email → onboarding (4 etapas) → assinatura Stripe
- [ ] Testar envio de email (convite de profissional, reset de senha)
- [ ] Testar upload de documento (R2)
- [ ] Verificar logs da API por 30 min após deploy: `flyctl logs`
- [ ] Criar primeiro usuário administrador de produção

---

## Rollback

Se algo der errado após o go-live:

| Problema | Ação |
|----------|------|
| API down | `flyctl releases list` → `flyctl deploy --image <image-id>` para versão anterior |
| Frontend quebrado | Vercel → Deployments → Promote anterior |
| Bug crítico no código | `git revert` + push na `main` → pipeline re-deploya |
| Banco corrompido | Restaurar backup do provedor PostgreSQL |

---

## Pós Go-Live (Roadmap)

Ver [`producao-roadmap.md`](./producao-roadmap.md) para os itens de melhoria contínua identificados durante o audit.
