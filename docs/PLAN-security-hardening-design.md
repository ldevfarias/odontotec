# Security Hardening Sprint — Design Spec

**Data:** 2026-03-31
**Duração:** 2 semanas (10 dias úteis)
**Branch:** `feat/security-hardening-sprint`
**Abordagem:** Por camada (correções imediatas → validação → transações)
**Princípio:** Não quebrar a aplicação. TDD reverso nos fluxos críticos.

---

## Fase 1 — Testes + Correções Imediatas (3 dias)

### 1.1 Testes de cobertura (TDD reverso)

Escrever testes unitários **antes** de modificar código para capturar o comportamento atual:

| Arquivo de teste                    | Fluxos cobertos                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `auth.service.spec.ts`              | login, refreshTokens, verifyEmailAndSetPassword, resetPassword, validação de usuário inativo                        |
| `appointments.service.spec.ts`      | criação com conflito, criação sem conflito, update com verificação de conflito                                      |
| `stripe.webhook.controller.spec.ts` | handleCheckoutSessionCompleted, handleInvoicePaymentSucceeded, handleSubscriptionUpdated, handleSubscriptionDeleted |

### 1.2 Correções críticas

| #   | Vulnerabilidade                                   | Arquivo                      | Correção                                                                                   |
| --- | ------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | JWT secret com fallback `'secretKey'`             | `auth.module.ts`             | Lançar erro se `JWT_SECRET` não estiver configurado                                        |
| 2   | ClinicMembershipGuard retorna `true` sem clinicId | `clinic-membership.guard.ts` | Retornar `false` / lançar `ForbiddenException` quando clinicId ausente em rotas protegidas |
| 3   | Upload de exames sem limite de tamanho            | `exams.controller.ts`        | Adicionar `limits: { fileSize: 10 * 1024 * 1024 }` (10MB)                                  |
| 4   | Usuário inativo mantém acesso via token           | `auth.service.ts`            | Consultar banco no `refreshTokens()`, rejeitar se `isActive: false`                        |
| 5   | Refresh token aceito via Bearer header            | `refresh-token.strategy.ts`  | Remover `ExtractJwt.fromAuthHeaderAsBearerToken()`, aceitar apenas cookie                  |
| 6   | RolesGuard permite acesso sem `@Roles()`          | `roles.guard.ts`             | Retornar `false` se nenhum role definido no endpoint                                       |

---

## Fase 2 — Validação & Limites (3 dias)

### 2.1 `@MaxLength()` em todos os DTOs

| Tipo de campo                           | MaxLength |
| --------------------------------------- | --------- |
| name, title                             | 255       |
| email                                   | 255       |
| phone, document (CPF/RG)                | 20        |
| address                                 | 500       |
| description, notes, complaint           | 2000      |
| content (documentos)                    | 50000     |
| category, type, toothNumber, toothFaces | 100       |
| token, questionId                       | 500       |
| selectionMode                           | 50        |
| password, confirmPassword               | 128       |
| cancellationReason                      | 1000      |

**DTOs afetados (~15):** CreatePatientDto, UpdatePatientDto, CreateClinicDto, UpdateClinicDto, CreateUserDto, UpdateUserDto, RegisterTenantDto, InitiateRegistrationDto, RegisterInvitationDto, CompleteClinicDto, CreateClinicProcedureDto, CreatePatientDocumentDto, UpdatePatientDocumentDto, CreateTreatmentPlanDto, TreatmentPlanItemDto, CreateBudgetDto, CreateProcedureDto, CreateAnamnesisDto, AnamnesisAnswerDto, InviteUserDto, AppointmentDto (cancellationReason), ResetPasswordDto.

### 2.2 `@ArrayMaxSize()` em arrays

| DTO                      | Campo   | MaxSize |
| ------------------------ | ------- | ------- |
| `CreateBudgetDto`        | items   | 50      |
| `CreateTreatmentPlanDto` | items   | 50      |
| `CreateAnamnesisDto`     | answers | 100     |

### 2.3 Paginação em endpoints de listagem

Criar `PaginationDto` reutilizável:

- `page: number` — default 1, `@Min(1)`
- `limit: number` — default 50, `@Min(1)`, `@Max(100)`
- Retorno: `{ data: T[], total: number, page: number, limit: number }`

Endpoints afetados:

- `GET /patients`
- `GET /users`
- `GET /appointments`
- `GET /notifications`
- `GET /documents`
- `GET /treatment-plans`
- `GET /budgets`

### 2.4 Configurações globais

- Body parser limit explícito: `{ json: { limit: '1mb' }, urlencoded: { limit: '1mb' } }` no `NestFactory.create()`
- Helmet: `crossOriginResourcePolicy` de `'cross-origin'` para `'same-origin'`

---

## Fase 3 — Transações & Race Conditions (4 dias)

### 3.1 Transações com `queryRunner`

| Fluxo               | Arquivo                   | Operações na transação                                    |
| ------------------- | ------------------------- | --------------------------------------------------------- |
| Criação de consulta | `appointments.service.ts` | `checkConflict()` com `SELECT FOR UPDATE` + `save()`      |
| Update de consulta  | `appointments.service.ts` | `checkConflict()` com lock + `update()`                   |
| Registro completo   | `auth.service.ts`         | criar user + criar clínica + deletar pending registration |
| Registro tenant     | `auth.service.ts`         | criar user + criar clínica                                |
| Refresh de tokens   | `auth.service.ts`         | validar hash + gerar novos tokens + salvar novo hash      |
| Reset de senha      | `auth.service.ts`         | validar token + atualizar senha + limpar token            |
| Aceitar convite     | `users.service.ts`        | verificar convite + criar user + marcar aceito            |
| Upload de avatar    | `users.service.ts`        | deletar antigo + upload novo + atualizar registro         |

### 3.2 Migration — Unique constraints

Criar 1 migration com:

| Tabela               | Constraint                                        | Propósito                                                                                             |
| -------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `appointments`       | `UNIQUE(clinic_id, dentist_id, start_time)`       | Impedir double-booking no banco (colunas exatas serão validadas contra a lógica do `checkConflict()`) |
| `clinic_memberships` | Verificar se `UNIQUE(userId, clinicId)` já existe | Impedir membros duplicados                                                                            |

### 3.3 Idempotência nos webhooks do Stripe

- Envolver todos os handlers em transações com `SELECT FOR UPDATE` na entidade Clinic
- Guardar `stripeEventId` para evitar reprocessamento (tabela `processed_stripe_events` ou coluna na clínica)

### 3.4 Correções menores

- Aumentar `@MinLength(6)` para `@MinLength(8)` nos DTOs de senha

---

## Fora de escopo (sprint futura)

- Trocar mecanismo de autenticação por serviço externo (Auth0, Clerk, etc.)
- Reduzir throttle global de 100 para 50 req/min (requer load testing)
- Adicionar rate limiting específico por endpoint (clinics, budgets, etc.)
- Adicionar `openapi.json` ao `.gitignore`
- Refatorar raw SQL em `patients.service.ts` para QueryBuilder

---

## Critérios de sucesso

1. Todos os testes existentes continuam passando
2. Novos testes cobrem os fluxos críticos modificados
3. Nenhuma vulnerabilidade CRÍTICA ou ALTA remanescente
4. Migration aplicada com sucesso no banco de dev
5. Deploy não quebra nenhum fluxo do frontend
