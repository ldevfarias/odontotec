# Refatoração do Fluxo de Criação de Conta — Onboarding com Verificação por Email

## Contexto e Motivação

O fluxo atual de registro (`/register`) coleta todos os dados em um único formulário de 2 passos (nome/email/senha + dados da clínica), sem qualquer verificação de email. Isso tem problemas sérios:

- **Segurança**: senha criada antes da verificação da identidade (email pode estar errado)
- **Abandono**: formulário longo desencoraja novos usuários
- **UX**: sem feedback de "e-mail enviado" — o usuário não sabe o que espera

A nova abordagem segue o padrão adotado por **Linear**, **Notion**, **Vercel** e **Stripe**: coleta mínima → verificação → completar perfil.

---

## 🆕 Novo Fluxo de 3 Etapas

```
[STEP 1] Preenche Nome + Email → clica "Criar Conta"
           ↓
[EMAIL]  Recebe link de verificação (expira em 24h)
           ↓
[STEP 2] Clica no link → Define sua senha
           ↓ (autenticado)
[STEP 3] Preenche dados base da clínica → Entra no app
```

---

## User Review Required

> [!IMPORTANT]
> **Decisão de design: Clínica no Step 3 — OBRIGATÓRIO (Definido)**
> O usuário confirmou (Opção A): o middleware de onboarding será bloqueante.
> Ninguém acessará o `/dashboard` sem dados válidos de clínica.
>
> Redirecionamento de segurança para `/onboarding/clinic` caso `User.isActive === false`.

> [!WARNING]
> **Migrations de banco de dados necessárias.** A nova abordagem requer novos campos na tabela `users` ou uma nova tabela de staging. Avise antes de aplicar em produção.

---

## Proposed Changes

### Backend — odonto-api

---

#### [NEW] Tabela/Entidade: `PendingRegistration`

Uma tabela temporária para armazenar registros pendentes antes da verificação do email.

**Campos:**

- `id` — PK
- `name` — string
- `email` — string (unique, pending)
- `verificationToken` — UUID (gerado no servidor)
- `expiresAt` — timestamp (now + 24h)
- `createdAt`, `updatedAt`

> Alternativa: adicionar os campos diretamente em `User` com `isEmailVerified: boolean`. A tabela separada é mais limpa e evita registros "sujos" na tabela principal.

---

#### [MODIFY] `auth.service.ts`

| Método atual          | Método novo                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| `registerTenant(dto)` | Continua existindo para compatibilidade — pode ser removido futuramente                        |
| —                     | `initiateRegistration(name, email)` → cria `PendingRegistration` + manda email                 |
| —                     | `verifyEmailAndSetPassword(token, password)` → valida token + cria Clinic + User + retorna JWT |

**`initiateRegistration`:**

1. Verifica se email já existe em `users` → lança `ConflictException`
2. Gera UUID token, salva em `PendingRegistration` com expiress in 24h
3. Envia email de verificação via `EmailService.sendRegistrationVerificationEmail`
4. Retorna `{ message: 'Email sent' }` (sem expor token)

**`verifyEmailAndSetPassword`:**

1. Busca `PendingRegistration` pelo token → valida existência e expiração
2. Cria `Clinic` com nome provisório (pode ser o nome do usuário + "Clinic") ou apenas clinicId vazio e deixa para Step 3
3. Cria `User` com role `ADMIN`, `isEmailVerified: true`, `isActive: false` (aguardando Step 3)
4. Marca `PendingRegistration` como usada (ou deleta)
5. Retorna JWT — usuário está autenticado mas precisa completar o onboarding

**`completeClinicSetup`:**

1. Requer JWT válido (middleware)
2. Atualiza `Clinic` com nome, telefone, endereço
3. Atualiza `User.isActive = true`
4. Retorna dados atualizados → frontend redireciona para dashboard

---

#### [NEW] DTOs

- **`InitiateRegistrationDto`**: `name: string`, `email: string (email)`
- **`VerifyEmailDto`**: `token: string`, `password: string (min 8)`, `confirmPassword: string`
- **`CompleteClinicDto`**: `clinicName: string (min 3)`, `clinicPhone?: string`, `clinicAddress?: string`

---

#### [MODIFY] `auth.controller.ts` — Novos endpoints

```
POST /auth/initiate-registration       → initiateRegistration()
POST /auth/verify-email               → verifyEmailAndSetPassword()
POST /auth/complete-clinic            → completeClinicSetup() [🔒 JWT required]
```

---

#### [NEW] Email Template: `registration-verification.template.ts`

Template HTML com:

- Saudação com nome do usuário
- CTA principal: `Verificar e-mail e criar senha`
- Link: `${FRONTEND_URL}/register/verify/${token}`
- Aviso de expiração (24h)
- Visual consistente com os outros templates (Resend)

---

#### [MODIFY] `email.service.ts`

Adicionar método:

```ts
sendRegistrationVerificationEmail(toEmail: string, userName: string, token: string): Promise<boolean>
```

---

### Frontend — odonto-front

---

#### [MODIFY] `/register/page.tsx` — Step 1 (simplificado)

- **Remove**: campos senha, confirmPassword, clinicName, clinicPhone, clinicAddress
- **Mantém**: `userName` + `email` + botão "Criar Conta"
- **Adiciona**: tela de sucesso pós-submit com mensagem "Verifique seu email"
- **Design**: premium, animado, com progress indicator mostrando Step 1 de 3

```tsx
// Novo schema
const step1Schema = z.object({
  userName: z.string().min(3),
  email: z.string().email(),
});
```

---

#### [NEW] `/register/verify/[token]/page.tsx` — Step 2 (Criar Senha)

- Valida token no servidor ao carregar (se inválido → mostra erro amigável)
- Formulário: `password` + `confirmPassword`
- Após submit → autentica e redireciona para `/onboarding/clinic`
- Exibe progress indicator mostrando Step 2 de 3

---

#### [NEW] `/onboarding/clinic/page.tsx` — Step 3 (Dados da Clínica)

- Rota protegida (requer JWT)
- Middleware verifica se onboarding foi completado; se não → redireciona para esta tela
- Formulário: `clinicName` (obrigatório), `clinicPhone` (opcional), `clinicAddress` (opcional)
- Após submit → redireciona para `/dashboard`
- Exibe progress indicator mostrando Step 3 de 3

---

#### [MODIFY] `middleware.ts` — Proteção de rotas

Adicionar lógica:

- Se `isActive === false` (onboarding incompleto) → redirecionar para `/onboarding/clinic`
- Exceto se já está em `/onboarding/*` ou `/register/*`

---

#### Design System do Onboarding

**Referências:** Linear, Vercel, Clerk Auth  
**Estrutura visual:**

- Layout: split — lado esquerdo com branding/ilustração, lado direito com formulário
- Progress indicator: numbered circles (1 → 2 → 3) no topo
- Sem card genérico — design clean com fundo off-white suave
- Animações: fade + slide entre steps
- Cores: manter a paleta já usada no app (sem roxo!)

---

## Verification Plan

### Testes Manuais (E2E do Fluxo Completo)

**Pré-requisito:** `npm run dev` em execução (já rodando), backend disponível em `localhost:3000`, frontend em `localhost:3001`

**Step 1 — Iniciar Registro:**

1. Acesse `http://localhost:3001/register`
2. Preencha Nome e Email
3. Clique em "Criar Conta"
4. Esperado: tela de sucesso "Verifique seu e-mail"
5. Verifique no console/log do backend que o email foi chamado

**Step 2 — Verificar Email e Criar Senha:**

1. Inspecione o banco de dados: `SELECT * FROM pending_registrations ORDER BY created_at DESC LIMIT 1;`
2. Copie o `verification_token`
3. Acesse `http://localhost:3001/register/verify/{token}`
4. Preencha senha e confirmação de senha
5. Clique em "Criar conta"
6. Esperado: redirecionamento para `/onboarding/clinic`

**Step 3 — Dados da Clínica:**

1. Em `/onboarding/clinic`, preencha Nome da Clínica
2. Clique em "Entrar no sistema"
3. Esperado: redirecionamento para `/dashboard` com dados da clínica visíveis

**Testes de Edge Cases:**

- Token expirado: altere `expires_at` no banco para data passada → acesse a URL → deve mostrar erro
- Token já usado: depois de completar Step 2, tente acessar a mesma URL de verificação novamente → deve mostrar erro
- Email duplicado: tente registrar o mesmo email duas vezes → deve mostrar mensagem de "Email já cadastrado"
- Acesso ao dashboard sem completar onboarding: log no app após Step 2 → deve redirecionar para `/onboarding/clinic`

### Verificação de Build

```bash
# Na raiz do monorepo
npm run build
```

Verificar se não há erros de TypeScript nem de lint.

### Verificação de Tipos e Lint

```bash
# Backend
cd apps/odonto-api && npx tsc --noEmit && npm run lint

# Frontend
cd apps/odonto-front && npx tsc --noEmit && npm run lint
```
