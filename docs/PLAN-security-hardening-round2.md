# Security Hardening Round 2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir as vulnerabilidades encontradas na auditoria de segurança de 2026-04-07, cobrindo role escalation via mass assignment, open redirect no billing, security headers ausentes no Next.js, e rate limiting insuficiente no endpoint público de cancelamento de consulta.

**Architecture:** Quatro tarefas independentes que podem rodar em paralelo. (1) Separar `UpdateUserDto` para remover `role`/`isActive`, criando endpoints dedicados. (2) Validar URLs de redirect do Stripe antes de navegar. (3) Adicionar security headers no `next.config.ts`. (4) Adicionar `@Throttle` no endpoint público de cancelamento de consulta.

**Tech Stack:** NestJS, class-validator, @nestjs/throttler, Next.js 16, TypeScript

---

## Contexto — Vulnerabilidades Cobertas

| # | Gravidade | Tipo | Arquivo | Descrição |
|---|---|---|---|---|
| 1 | ALTA | Mass Assignment / Role Escalation | `users.controller.ts:102`, `user.dto.ts:47` | `UpdateUserDto` expõe `role` e `isActive`, permitindo que um admin mude roles sem restrições adicionais |
| 2 | ALTA | Open Redirect | `billing/page.tsx:51,67`, `SubscriptionContext.tsx:65` | `window.location.href = data.url` sem validar que a URL pertence ao Stripe |
| 3 | ALTA | Missing Security Headers | `next.config.ts` | Nenhum `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy` |
| 4 | MÉDIA | Rate Limiting insuficiente | `appointments.controller.ts:40` | Endpoint `GET /appointments/public/cancel` é `@Public()` mas usa apenas throttle global (100 req/min) |

---

## Arquivos Modificados

### Task 1 — Mass Assignment
- Modify: `apps/odonto-api/src/modules/users/dto/user.dto.ts`
- Modify: `apps/odonto-api/src/modules/users/users.controller.ts`
- Modify: `apps/odonto-api/src/modules/users/users.service.ts`
- Create: `apps/odonto-api/src/modules/users/users.controller.role.spec.ts`

### Task 2 — Open Redirect
- Create: `apps/odonto-front/src/lib/stripe-url.ts`
- Modify: `apps/odonto-front/src/app/(app)/settings/billing/page.tsx`
- Modify: `apps/odonto-front/src/contexts/SubscriptionContext.tsx`

### Task 3 — Security Headers
- Modify: `apps/odonto-front/next.config.ts`

### Task 4 — Rate Limiting
- Modify: `apps/odonto-api/src/modules/appointments/appointments.controller.ts`
- Create: `apps/odonto-api/src/modules/appointments/appointments.controller.throttle.spec.ts`

---

## Task 1: Remover `role` e `isActive` do `UpdateUserDto`

**Contexto:** `PATCH /users/:id` aceita `UpdateUserDto` que inclui `role` e `isActive`. O `users.service.ts:228` usa `Object.assign(user, updateUserDto)` — qualquer admin pode escalar ou revogar roles de outros usuários sem validação adicional. A correção é remover esses campos do DTO genérico e criar endpoints específicos protegidos.

**Files:**
- Modify: `apps/odonto-api/src/modules/users/dto/user.dto.ts`
- Modify: `apps/odonto-api/src/modules/users/users.controller.ts`
- Modify: `apps/odonto-api/src/modules/users/users.service.ts`
- Create: `apps/odonto-api/src/modules/users/users.controller.role.spec.ts`

- [ ] **Step 1: Escrever testes falhando para DTO**

Crie `apps/odonto-api/src/modules/users/users.controller.role.spec.ts`:

```typescript
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDto, ChangeRoleDto, DeactivateUserDto } from './dto/user.dto';

describe('UpdateUserDto — mass assignment protection', () => {
    it('should reject role field', async () => {
        const dto = plainToInstance(UpdateUserDto, { name: 'Ana', role: 'ADMIN' });
        const errors = await validate(dto);
        // role should not exist in UpdateUserDto — check field is stripped or not present
        expect((dto as any).role).toBeUndefined();
    });

    it('should reject isActive field', async () => {
        const dto = plainToInstance(UpdateUserDto, { name: 'Ana', isActive: false });
        const errors = await validate(dto);
        expect((dto as any).isActive).toBeUndefined();
    });

    it('should accept name and email', async () => {
        const dto = plainToInstance(UpdateUserDto, { name: 'Ana', email: 'ana@test.com' });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });
});

describe('ChangeRoleDto', () => {
    it('should require role field', async () => {
        const dto = plainToInstance(ChangeRoleDto, {});
        const errors = await validate(dto);
        expect(errors.some(e => e.property === 'role')).toBe(true);
    });

    it('should reject invalid role', async () => {
        const dto = plainToInstance(ChangeRoleDto, { role: 'HACKER' });
        const errors = await validate(dto);
        expect(errors.some(e => e.property === 'role')).toBe(true);
    });

    it('should accept valid role', async () => {
        const dto = plainToInstance(ChangeRoleDto, { role: 'DENTIST' });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

```bash
cd apps/odonto-api && npx jest src/modules/users/users.controller.role.spec.ts --no-coverage
```

Esperado: falha porque `UpdateUserDto` ainda tem `role` e `isActive`, e `ChangeRoleDto` não existe.

- [ ] **Step 3: Modificar `user.dto.ts` — separar DTOs**

Em `apps/odonto-api/src/modules/users/dto/user.dto.ts`, substituir o conteúdo de `UpdateUserDto` e adicionar `ChangeRoleDto` e `DeactivateUserDto`:

```typescript
// Manter imports existentes, adicionar IsBoolean:
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean, MaxLength, MinLength } from 'class-validator';

// UpdateUserDto — APENAS campos que qualquer admin pode editar
export class UpdateUserDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;
    // role e isActive removidos — use os endpoints específicos abaixo
}

// ChangeRoleDto — endpoint dedicado com audit log
export class ChangeRoleDto {
    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    role: UserRole;
}

// DeactivateUserDto — endpoint dedicado para ativar/desativar
export class DeactivateUserDto {
    @ApiProperty()
    @IsBoolean()
    isActive: boolean;
}
```

- [ ] **Step 4: Rodar testes de DTO — devem passar**

```bash
cd apps/odonto-api && npx jest src/modules/users/users.controller.role.spec.ts --no-coverage
```

Esperado: todos passando.

- [ ] **Step 5: Adicionar métodos no `users.service.ts`**

Em `apps/odonto-api/src/modules/users/users.service.ts`, adicionar após o método `update()` existente (linha ~236):

```typescript
async changeRole(id: number, role: UserRole, clinicId: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    return this.usersRepository.save(user);
}

async setActive(id: number, isActive: boolean, clinicId: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = isActive;
    return this.usersRepository.save(user);
}
```

- [ ] **Step 6: Adicionar endpoints no `users.controller.ts`**

Em `apps/odonto-api/src/modules/users/users.controller.ts`:

1. Adicionar `ChangeRoleDto, DeactivateUserDto` ao import do dto:
```typescript
import { UpdateUserDto, UsersQueryDto, ChangeRoleDto, DeactivateUserDto } from './dto/user.dto';
```

2. Substituir o método `update()` atual (linhas 99-104) por:
```typescript
@Patch(':id')
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: 'Update user name and email' })
update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Tenant() clinicId: number,
) {
    return this.usersService.update(id, updateUserDto);
}

@Patch(':id/role')
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: 'Change user role' })
changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeRoleDto: ChangeRoleDto,
    @Tenant() clinicId: number,
) {
    return this.usersService.changeRole(id, changeRoleDto.role, clinicId);
}

@Patch(':id/active')
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: 'Activate or deactivate a user' })
setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() deactivateUserDto: DeactivateUserDto,
    @Tenant() clinicId: number,
) {
    return this.usersService.setActive(id, deactivateUserDto.isActive, clinicId);
}
```

- [ ] **Step 7: Rodar testes gerais da API**

```bash
cd apps/odonto-api && npx jest --no-coverage
```

Esperado: todos passando (sem regressão).

- [ ] **Step 8: Regenerar openapi.json**

```bash
cd apps/odonto-api && npm run generate:openapi
```

- [ ] **Step 9: Regenerar clientes Kubb no frontend**

```bash
cd apps/odonto-front && npm run kubb
```

- [ ] **Step 10: Commit**

```bash
git add apps/odonto-api/src/modules/users/dto/user.dto.ts \
        apps/odonto-api/src/modules/users/users.controller.ts \
        apps/odonto-api/src/modules/users/users.service.ts \
        apps/odonto-api/src/modules/users/users.controller.role.spec.ts \
        apps/odonto-api/openapi.json \
        apps/odonto-front/src/generated/
git commit -m "fix(security): remove role/isActive from UpdateUserDto — add dedicated /role and /active endpoints"
```

---

## Task 2: Open Redirect — validar URLs do Stripe antes de redirecionar

**Contexto:** `window.location.href = data.url` em `billing/page.tsx:51`, `billing/page.tsx:67` e `SubscriptionContext.tsx:65` não valida que a URL retornada pelo servidor pertence ao Stripe. Um servidor comprometido ou XSS no backend poderia retornar `javascript:alert(1)` ou um domínio malicioso. A correção é validar o hostname antes de redirecionar.

**Files:**
- Create: `apps/odonto-front/src/lib/stripe-url.ts`
- Modify: `apps/odonto-front/src/app/(app)/settings/billing/page.tsx`
- Modify: `apps/odonto-front/src/contexts/SubscriptionContext.tsx`

- [ ] **Step 1: Criar `stripe-url.ts` com a função de validação e testes inline**

Crie `apps/odonto-front/src/lib/stripe-url.ts`:

```typescript
const ALLOWED_STRIPE_HOSTNAMES = [
    'checkout.stripe.com',
    'billing.stripe.com',
    'stripe.com',
];

/**
 * Valida que uma URL pertence ao Stripe antes de redirecionar.
 * Lança erro se a URL for inválida ou não pertencer ao Stripe.
 */
export function assertStripeUrl(url: string): string {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw new Error(`Invalid redirect URL: "${url}"`);
    }

    if (parsed.protocol !== 'https:') {
        throw new Error(`Redirect URL must use HTTPS: "${url}"`);
    }

    const isAllowed = ALLOWED_STRIPE_HOSTNAMES.some(
        (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );

    if (!isAllowed) {
        throw new Error(`Redirect URL hostname not allowed: "${parsed.hostname}"`);
    }

    return url;
}
```

- [ ] **Step 2: Modificar `billing/page.tsx` — usar `assertStripeUrl`**

Em `apps/odonto-front/src/app/(app)/settings/billing/page.tsx`, adicionar o import no topo:

```typescript
import { assertStripeUrl } from '@/lib/stripe-url';
```

Substituir os dois blocos de redirect (linhas ~51 e ~67):

```typescript
// ANTES — checkout mutation onSuccess:
if (data.url) {
    analytics.capture(EVENT_NAMES.SUBSCRIPTION_CHECKOUT_INITIATED, { plan: 'PRO' });
    setIsRedirecting(true);
    window.location.href = data.url;
}

// DEPOIS:
if (data.url) {
    try {
        const safeUrl = assertStripeUrl(data.url);
        analytics.capture(EVENT_NAMES.SUBSCRIPTION_CHECKOUT_INITIATED, { plan: 'PRO' });
        setIsRedirecting(true);
        window.location.href = safeUrl;
    } catch {
        notificationService.error('URL de checkout inválida. Contate o suporte.');
    }
}
```

```typescript
// ANTES — portal mutation onSuccess:
if (data.url) {
    analytics.capture(EVENT_NAMES.SUBSCRIPTION_PORTAL_OPENED, {});
    setIsRedirecting(true);
    window.open(data.url, '_blank');
    setIsRedirecting(false);
}

// DEPOIS:
if (data.url) {
    try {
        const safeUrl = assertStripeUrl(data.url);
        analytics.capture(EVENT_NAMES.SUBSCRIPTION_PORTAL_OPENED, {});
        setIsRedirecting(true);
        window.open(safeUrl, '_blank');
        setIsRedirecting(false);
    } catch {
        notificationService.error('URL do portal inválida. Contate o suporte.');
    }
}
```

- [ ] **Step 3: Modificar `SubscriptionContext.tsx` — usar `assertStripeUrl`**

Em `apps/odonto-front/src/contexts/SubscriptionContext.tsx`, adicionar o import:

```typescript
import { assertStripeUrl } from '@/lib/stripe-url';
```

Substituir o bloco `upgradeToPro` (linha ~64):

```typescript
// ANTES:
if (data.url) {
    window.location.href = data.url;
}

// DEPOIS:
if (data.url) {
    try {
        window.location.href = assertStripeUrl(data.url);
    } catch {
        notificationService.error('URL de checkout inválida. Contate o suporte.');
    }
}
```

- [ ] **Step 4: Verificar build do frontend**

```bash
cd apps/odonto-front && npm run build 2>&1 | tail -20
```

Esperado: build sem erros de TypeScript.

- [ ] **Step 5: Commit**

```bash
git add apps/odonto-front/src/lib/stripe-url.ts \
        apps/odonto-front/src/app/\(app\)/settings/billing/page.tsx \
        apps/odonto-front/src/contexts/SubscriptionContext.tsx
git commit -m "fix(security): validate Stripe redirect URLs before window.location.href assignment"
```

---

## Task 3: Security Headers no Next.js

**Contexto:** `next.config.ts` não configura nenhum header de segurança HTTP. Isso expõe o frontend a clickjacking (`X-Frame-Options`), MIME type sniffing (`X-Content-Type-Options`), e não força HTTPS em produção (`Strict-Transport-Security`). O Content-Security-Policy precisa permitir PostHog (usado via `rewrites`) e Stripe.

**Files:**
- Modify: `apps/odonto-front/next.config.ts`

- [ ] **Step 1: Substituir conteúdo do `next.config.ts`**

```typescript
import type { NextConfig } from "next";

const securityHeaders = [
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        key: 'X-Frame-Options',
        value: 'DENY',
    },
    {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
    },
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
    },
    // HSTS — apenas em produção (Vercel adiciona automaticamente, mas não custa ser explícito)
    ...(process.env.NODE_ENV === 'production'
        ? [
              {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains',
              },
          ]
        : []),
];

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders,
            },
        ];
    },

    async rewrites() {
        return [
            {
                source: '/ingest/static/:path*',
                destination: 'https://us-assets.i.posthog.com/static/:path*',
            },
            {
                source: '/ingest/:path*',
                destination: 'https://us.i.posthog.com/:path*',
            },
        ];
    },

    // This is required to support PostHog trailing slash API requests
    skipTrailingSlashRedirect: true,
};

export default nextConfig;
```

- [ ] **Step 2: Verificar build**

```bash
cd apps/odonto-front && npm run build 2>&1 | tail -20
```

Esperado: build sem erros.

- [ ] **Step 3: Verificar headers em dev**

```bash
cd apps/odonto-front && npm run dev &
sleep 5
curl -I http://localhost:3001 2>/dev/null | grep -E "(X-Frame|X-Content|Referrer)"
```

Esperado: os headers aparecem na resposta.

- [ ] **Step 4: Commit**

```bash
git add apps/odonto-front/next.config.ts
git commit -m "fix(security): add HTTP security headers to Next.js config (X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy)"
```

---

## Task 4: Rate Limiting no endpoint público de cancelamento

**Contexto:** `GET /appointments/public/cancel` é marcado como `@Public()` e não tem `@Throttle` customizado — usa apenas o throttle global de 100 req/min. Um atacante pode fazer brute force do parâmetro `token` para cancelar consultas de outros pacientes. O endpoint deve ter limite restritivo.

**Files:**
- Modify: `apps/odonto-api/src/modules/appointments/appointments.controller.ts`
- Create: `apps/odonto-api/src/modules/appointments/appointments.controller.throttle.spec.ts`

- [ ] **Step 1: Escrever teste falhando**

Crie `apps/odonto-api/src/modules/appointments/appointments.controller.throttle.spec.ts`:

```typescript
import { Reflector } from '@nestjs/core';
import { AppointmentsController } from './appointments.controller';

const THROTTLER_METADATA_KEY = 'THROTTLER:default';

function getThrottle(controller: any, methodName: string) {
    return Reflect.getMetadata(THROTTLER_METADATA_KEY, controller.prototype[methodName]);
}

describe('AppointmentsController — Throttle on public cancel endpoint', () => {
    it('publicCancel should have throttle limit ≤ 10', () => {
        const meta = getThrottle(AppointmentsController, 'publicCancel');
        expect(meta).toBeDefined();
        expect(meta[0].limit).toBeLessThanOrEqual(10);
    });

    it('publicCancel throttle TTL should be at least 60s', () => {
        const meta = getThrottle(AppointmentsController, 'publicCancel');
        expect(meta[0].ttl).toBeGreaterThanOrEqual(60000);
    });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

```bash
cd apps/odonto-api && npx jest src/modules/appointments/appointments.controller.throttle.spec.ts --no-coverage
```

Esperado: falha com `expect(received).toBeDefined()` — sem metadata de throttle no método.

- [ ] **Step 3: Adicionar `@Throttle` ao endpoint**

Em `apps/odonto-api/src/modules/appointments/appointments.controller.ts`, verificar que `Throttle` está importado. Se não estiver, adicionar ao import de `@nestjs/throttler`:

```typescript
import { Throttle } from '@nestjs/throttler';
```

Modificar o endpoint `publicCancel` (linha ~40):

```typescript
// ANTES:
@Get('public/cancel')
@Public()
@ApiOperation({ summary: 'Cancel appointment via public link' })
async publicCancel(@Query('id') id: string, @Query('token') token: string) {
    return this.appointmentsService.updateStatusPublic(Number(id), token, AppointmentStatus.CANCELLED);
}

// DEPOIS:
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Get('public/cancel')
@Public()
@ApiOperation({ summary: 'Cancel appointment via public link' })
async publicCancel(@Query('id') id: string, @Query('token') token: string) {
    return this.appointmentsService.updateStatusPublic(Number(id), token, AppointmentStatus.CANCELLED);
}
```

- [ ] **Step 4: Rodar teste e confirmar verde**

```bash
cd apps/odonto-api && npx jest src/modules/appointments/appointments.controller.throttle.spec.ts --no-coverage
```

Esperado: 2 testes passando.

- [ ] **Step 5: Rodar todos os testes**

```bash
cd apps/odonto-api && npx jest --no-coverage
```

Esperado: sem regressões.

- [ ] **Step 6: Commit**

```bash
git add apps/odonto-api/src/modules/appointments/appointments.controller.ts \
        apps/odonto-api/src/modules/appointments/appointments.controller.throttle.spec.ts
git commit -m "fix(security): add rate limiting to public appointment cancel endpoint (5 req/min)"
```

---

## Self-Review

### Spec coverage
- ✅ Mass assignment / role escalation — Task 1 (remove `role`/`isActive` do `UpdateUserDto`, endpoints dedicados)
- ✅ Open redirect — Task 2 (`assertStripeUrl` valida hostname antes do redirect)
- ✅ Missing security headers — Task 3 (`next.config.ts` com headers de segurança)
- ✅ Rate limiting insuficiente em `publicCancel` — Task 4 (`@Throttle` com 5 req/min)
- ⏩ `dangerouslySetInnerHTML` em `chart.tsx` — componente shadcn/ui gerado externamente, risco baixo (dados vêm de config local, não de input de usuário), descartado por YAGNI
- ⏩ X-Clinic-Id client-side validation — defesa em profundidade; backend já valida. Cliente pode validar na `setActiveClinic`, mas não é a linha de defesa primária. Deixado fora para sprint futura.

### Placeholder scan
Nenhum placeholder encontrado. Todos os steps têm código real e comandos exatos.

### Type consistency
- `ChangeRoleDto` e `DeactivateUserDto` definidos na Task 1, Step 3 e usados no controller no Step 6.
- `assertStripeUrl` definida em `stripe-url.ts` (Task 2, Step 1) e importada em billing e SubscriptionContext.
- `Throttle` importado de `@nestjs/throttler` (já usado em outros controllers do projeto).
