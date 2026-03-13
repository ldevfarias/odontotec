# 🚀 OdontoTec — Go-Live Plan

> Última atualização: 12/03/2026
> Repositório: GitHub · Stack: Next.js + NestJS + PostgreSQL

---

## Arquitetura de Produção

```
GitHub → GitHub Actions (CI/CD)
              ├── Vercel          → Frontend (Next.js)
              └── Railway         → API (NestJS) + PostgreSQL
                       │
          Cloudflare   ├── DNS + CDN + DDoS protection
                       └── R2 Storage (documentos/uploads)
                       
Serviços externos:
  Resend  → Emails transacionais
  Stripe  → Pagamentos e assinaturas
```

---

## Custo Estimado

| Serviço | Plano | Custo/mês |
|---------|-------|-----------|
| Vercel | Hobby | **Grátis** |
| Railway | Pay-as-you-go | ~R$ 50–80 |
| Cloudflare R2 | Free tier (10GB) | **Grátis** |
| Cloudflare DNS / CDN | Free | **Grátis** |
| Resend | Free (3.000 emails/mês) | **Grátis** |
| Domínio | ~R$ 50/ano | ~R$ 5/mês |
| **Total** | | **~R$ 55–85/mês** |

---

## Checklist de Go-Live

### Fase 1 — Infraestrutura

- [ ] Registrar domínio no [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)
- [ ] Criar conta no [Railway](https://railway.app) e conectar o GitHub repo
- [ ] Criar serviço `odonto-api` (Node.js) e plugin PostgreSQL no Railway
- [ ] Criar conta no [Vercel](https://vercel.com) e conectar o GitHub repo
- [ ] Apontar domínio principal (`www`) para o Vercel
- [ ] Apontar subdomínio `api.` para o Railway

### Fase 2 — Configuração de Serviços

- [ ] Verificar domínio no **Resend** e adicionar registros DNS (SPF + DKIM) no Cloudflare
- [ ] Atualizar `RESEND_FROM_EMAIL` para `noreply@seudominio.com.br`
- [ ] Criar bucket `odontotec-docs` no **Cloudflare R2**
- [ ] Ativar chaves **LIVE** no **Stripe** (trocar `sk_test_` → `sk_live_`)
- [ ] Criar novo **Webhook Stripe** apontando para `https://api.seudominio.com.br/subscription/webhook`
- [ ] Recriar os **Price IDs LIVE** no Stripe e atualizar no `.env` de produção

### Fase 3 — Variáveis de Ambiente (Railway)

- [ ] `NODE_ENV=production`
- [ ] `POSTGRES_*` → preencher com os dados gerados pelo plugin do Railway
- [ ] `JWT_SECRET` → gerar novo (`openssl rand -hex 64`)
- [ ] `JWT_REFRESH_SECRET` → gerar novo (`openssl rand -hex 64`)
- [ ] `FRONTEND_URL=https://seudominio.com.br`
- [ ] `RESEND_API_KEY` → chave de produção do Resend
- [ ] `RESEND_FROM_EMAIL=noreply@seudominio.com.br`
- [ ] `STRIPE_SECRET_KEY` → chave live
- [ ] `STRIPE_WEBHOOK_SECRET` → secret do webhook live
- [ ] `STRIPE_PRICE_ID_EARLY_ADOPTER` → price ID live
- [ ] `STRIPE_PRICE_ID_PROFESSIONAL` → price ID live
- [ ] `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

### Fase 4 — Variáveis de Ambiente (Vercel)

- [ ] `NEXT_PUBLIC_API_URL=https://api.seudominio.com.br`

### Fase 5 — GitHub Actions (CI/CD)

- [ ] Adicionar secret `RAILWAY_TOKEN` no GitHub (Settings → Secrets)
- [ ] Adicionar secret `NEXT_PUBLIC_API_URL` no GitHub
- [ ] Confirmar que `.github/workflows/deploy.yml` está na branch `main`
- [ ] Testar pipeline com um PR de teste antes do go-live

### Fase 6 — Banco de Dados

- [ ] Confirmar que as migrations rodam ao subir a API (ou rodar manualmente)
- [ ] Verificar `synchronize: false` em produção (já configurado no `app.module.ts`)

### Fase 7 — Validação Final

- [ ] Testar fluxo completo: cadastro → verificação de email → onboarding → assinatura Stripe
- [ ] Testar envio de email (convite de profissional, reset de senha)
- [ ] Testar upload de documento (R2)
- [ ] Verificar logs da API por 30 min após deploy
- [ ] Criar primeiro usuário administrador de produção

---

## Rollback

Se algo der errado após o go-live:

| Problema | Ação |
|----------|------|
| API down | Railway → Deployments → Revert to previous |
| Frontend quebrado | Vercel → Deployments → Promote anterior |
| Bug crítico no código | `git revert` + push na `main` → pipeline re-deploya |
| Banco corrompido | Railway → PostgreSQL → Restore Backup |

---

## Pós Go-Live (Roadmap)

Ver [`producao-roadmap.md`](./producao-roadmap.md) para os itens de melhoria contínua identificados durante o audit.
