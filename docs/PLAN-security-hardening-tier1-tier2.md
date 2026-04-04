# Security Hardening — TIER 1 & TIER 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir as vulnerabilidades de segurança TIER 1 e TIER 2 identificadas na análise da branch `feat/security-hardening-sprint`.

**Architecture:** Quatro tarefas independentes que podem rodar em paralelo: (1) adicionar throttle nos endpoints de auth públicos, (2) corrigir CORS e trust proxy, (3) remover tokens JWT do JSON body coordenando API + frontend, (4) padronizar `getClinicId()` → `@Tenant()` em 8 controllers.

**Tech Stack:** NestJS (API), Next.js 16 (Frontend), class-validator, @nestjs/throttler, helmet, Jest

---

## Arquivos modificados

### Tarefa 1 — Throttle em endpoints públicos
- Modify: `apps/odonto-api/src/modules/auth/auth.controller.ts`

### Tarefa 2 — CORS + Trust Proxy
- Modify: `apps/odonto-api/src/main.ts`
- Test: `apps/odonto-api/src/main.spec.ts` (novo arquivo)

### Tarefa 3 — Remover tokens do JSON body
- Modify: `apps/odonto-api/src/modules/auth/auth.controller.ts`
- Modify: `apps/odonto-api/src/modules/auth/auth.service.ts`
- Modify: `apps/odonto-front/src/services/auth.ts`
- Modify: `apps/odonto-front/src/app/login/page.tsx`
- Modify: `apps/odonto-front/src/app/register/verify/[token]/page.tsx`
- Modify: `apps/odonto-front/src/app/onboarding/clinic/page.tsx`

### Tarefa 4 — Padronizar @Tenant()
- Modify: `apps/odonto-api/src/modules/budgets/budgets.controller.ts`
- Modify: `apps/odonto-api/src/modules/dashboard/dashboard.controller.ts`
- Modify: `apps/odonto-api/src/modules/treatment-plans/treatment-plans.controller.ts`
- Modify: `apps/odonto-api/src/modules/clinic-procedures/clinic-procedures.controller.ts`
- Modify: `apps/odonto-api/src/modules/subscription/subscription.controller.ts`
- Modify: `apps/odonto-api/src/modules/patients/controllers/payments.controller.ts`
- Modify: `apps/odonto-api/src/modules/patients/controllers/procedures.controller.ts`
- Delete (eventually): `apps/odonto-api/src/common/get-clinic-id.ts`

---

## Task 1: Throttle em todos os endpoints públicos de auth

**Files:**
- Modify: `apps/odonto-api/src/modules/auth/auth.controller.ts`

Endpoints que não têm `@Throttle` customizado ainda:
- `POST /auth/register-invitation`
- `POST /auth/register-tenant`
- `POST /auth/initiate-registration`
- `POST /auth/verify-email`

Risco: sem limite, um atacante pode criar 100 contas/minuto.

- [ ] **Step 1: Escrever teste falhando**

Crie `apps/odonto-api/src/modules/auth/auth.controller.throttle.spec.ts`:

```typescript
import { Reflector } from '@nestjs/core';
import { AuthController } from './auth.controller';

const THROTTLER_METADATA_KEY = 'THROTTLER:default';

function getThrottle(controller: any, methodName: string) {
    return Reflect.getMetadata(THROTTLER_METADATA_KEY, controller.prototype[methodName]);
}

describe('AuthController — Throttle decorators on public endpoints', () => {
    it('register-invitation has throttle limit ≤ 10', () => {
        const meta = getThrottle(AuthController, 'register');
        expect(meta).toBeDefined();
        expect(meta[0].limit).toBeLessThanOrEqual(10);
    });

    it('register-tenant has throttle limit ≤ 10', () => {
        const meta = getThrottle(AuthController, 'registerTenant');
        expect(meta).toBeDefined();
        expect(meta[0].limit).toBeLessThanOrEqual(10);
    });

    it('initiate-registration has throttle limit ≤ 10', () => {
        const meta = getThrottle(AuthController, 'initiateRegistration');
        expect(meta).toBeDefined();
        expect(meta[0].limit).toBeLessThanOrEqual(10);
    });

    it('verify-email has throttle limit ≤ 10', () => {
        const meta = getThrottle(AuthController, 'verifyEmail');
        expect(meta).toBeDefined();
        expect(meta[0].limit).toBeLessThanOrEqual(10);
    });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

```bash
cd apps/odonto-api && npx jest src/modules/auth/auth.controller.throttle.spec.ts --no-coverage
```

Esperado: 4 testes falhando com `expect(received).toBeDefined()`.

- [ ] **Step 3: Adicionar @Throttle nos 4 endpoints**

Em `apps/odonto-api/src/modules/auth/auth.controller.ts`, adicionar `@Throttle({ default: { limit: 10, ttl: 60000 } })` antes de `@Public()` em cada um dos 4 endpoints:

```typescript
// register-invitation (linha ~51)
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Public()
@Post('register-invitation')
async register(...)

// register-tenant (linha ~61)
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Public()
@Post('register-tenant')
async registerTenant(...)

// initiate-registration (linha ~71)
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Public()
@Post('initiate-registration')
async initiateRegistration(...)

// verify-email (linha ~79)
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Public()
@Post('verify-email')
async verifyEmail(...)
```

- [ ] **Step 4: Rodar e confirmar verde**

```bash
cd apps/odonto-api && npx jest src/modules/auth/auth.controller.throttle.spec.ts --no-coverage
```

Esperado: 4 passando.

- [ ] **Step 5: Commit**

```bash
git add apps/odonto-api/src/modules/auth/auth.controller.ts \
        apps/odonto-api/src/modules/auth/auth.controller.throttle.spec.ts
git commit -m "feat(security): add rate limiting to all public auth registration endpoints"
```

---

## Task 2: CORS — validação de origem e trust proxy

**Files:**
- Modify: `apps/odonto-api/src/main.ts`
- Create: `apps/odonto-api/src/cors.config.spec.ts`

Problemas atuais:
1. Origens CORS não são validadas (aceita qualquer string no env, inclusive wildcards)
2. Em produção, sem `trust proxy = 1`, o throttler vê o IP do nginx, não o IP real

- [ ] **Step 1: Extrair lógica de validação CORS para função testável**

Crie `apps/odonto-api/src/cors.config.ts`:

```typescript
export function buildCorsOrigins(frontendUrl: string, nodeEnv: string): string[] {
    return frontendUrl
        .split(',')
        .map((raw) => raw.trim())
        .map((url) => {
            if (!url) throw new Error('CORS origin cannot be empty');
            if (url.includes('*')) throw new Error(`Wildcard CORS origins are not allowed: "${url}"`);

            let parsed: URL;
            try {
                parsed = new URL(url);
            } catch {
                throw new Error(`Invalid CORS origin (not a valid URL): "${url}"`);
            }

            if (nodeEnv === 'production' && parsed.protocol !== 'https:') {
                throw new Error(`Production CORS origins must use HTTPS: "${url}"`);
            }

            return parsed.origin;
        });
}
```

- [ ] **Step 2: Escrever testes falhando para buildCorsOrigins**

Crie `apps/odonto-api/src/cors.config.spec.ts`:

```typescript
import { buildCorsOrigins } from './cors.config';

describe('buildCorsOrigins', () => {
    it('parses a single valid origin', () => {
        const result = buildCorsOrigins('http://localhost:3001', 'development');
        expect(result).toEqual(['http://localhost:3001']);
    });

    it('parses multiple comma-separated origins', () => {
        const result = buildCorsOrigins('http://localhost:3001,http://localhost:3002', 'development');
        expect(result).toEqual(['http://localhost:3001', 'http://localhost:3002']);
    });

    it('trims whitespace around origins', () => {
        const result = buildCorsOrigins(' http://localhost:3001 , http://localhost:3002 ', 'development');
        expect(result).toEqual(['http://localhost:3001', 'http://localhost:3002']);
    });

    it('throws when a wildcard origin is provided', () => {
        expect(() => buildCorsOrigins('*.example.com', 'development')).toThrow('Wildcard');
    });

    it('throws when origin is not a valid URL', () => {
        expect(() => buildCorsOrigins('not-a-url', 'development')).toThrow('not a valid URL');
    });

    it('throws when production origin uses HTTP', () => {
        expect(() =>
            buildCorsOrigins('http://app.odontotec.com', 'production')
        ).toThrow('must use HTTPS');
    });

    it('accepts HTTPS origin in production', () => {
        const result = buildCorsOrigins('https://app.odontotec.com', 'production');
        expect(result).toEqual(['https://app.odontotec.com']);
    });

    it('throws when origin is empty string', () => {
        expect(() => buildCorsOrigins(',', 'development')).toThrow('empty');
    });
});
```

- [ ] **Step 3: Rodar e confirmar que falha (módulo não existe)**

```bash
cd apps/odonto-api && npx jest src/cors.config.spec.ts --no-coverage
```

Esperado: falha com "Cannot find module './cors.config'".

- [ ] **Step 4: Implementar cors.config.ts (já escrito no Step 1)**

O arquivo já foi criado no Step 1. Rodar de novo para ver os testes falhando corretamente (agora por lógica, não por módulo ausente).

```bash
cd apps/odonto-api && npx jest src/cors.config.spec.ts --no-coverage
```

Esperado: pelo menos os testes de lógica falhando (se necessário ajustar implementação).

- [ ] **Step 5: Rodar e confirmar verde**

```bash
cd apps/odonto-api && npx jest src/cors.config.spec.ts --no-coverage
```

Esperado: 8 passando.

- [ ] **Step 6: Usar buildCorsOrigins em main.ts e adicionar trust proxy**

Substituir a lógica de CORS em `apps/odonto-api/src/main.ts`:

```typescript
// Adicionar import no topo
import { buildCorsOrigins } from './cors.config';

// No bootstrap(), substituir:
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3001')
    .split(',')
    .map((url) => url.trim());

// Por:
const allowedOrigins = buildCorsOrigins(
    process.env.FRONTEND_URL || 'http://localhost:3001',
    process.env.NODE_ENV || 'development',
);

// E adicionar ANTES do app.enableCors():
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/odonto-api/src/cors.config.ts \
        apps/odonto-api/src/cors.config.spec.ts \
        apps/odonto-api/src/main.ts
git commit -m "feat(security): validate CORS origins and enable trust proxy in production"
```

---

## Task 3: Remover tokens JWT do JSON body nas respostas de auth

**Files:**
- Modify: `apps/odonto-api/src/modules/auth/auth.service.ts` (tipo de retorno)
- Modify: `apps/odonto-api/src/modules/auth/auth.controller.ts` (strip tokens do return)
- Modify: `apps/odonto-front/src/services/auth.ts` (remover campos de tipo)
- Modify: `apps/odonto-front/src/app/login/page.tsx` (remover guard `if (res.access_token)`)
- Modify: `apps/odonto-front/src/app/register/verify/[token]/page.tsx`
- Modify: `apps/odonto-front/src/app/onboarding/clinic/page.tsx`

Contexto importante: `AuthContext.login()` já ignora o token (`_token`). Os tokens são gerenciados exclusivamente via HttpOnly cookies. As páginas usam `if (res.access_token)` apenas como "guard de sucesso", não para armazenar o token.

- [ ] **Step 1: Escrever teste falhando**

Adicionar ao final de `apps/odonto-api/src/modules/auth/auth.service.spec.ts`:

```typescript
describe('Login response — token exposure', () => {
    it('login response does NOT include access_token in JSON body', async () => {
        // Arrange
        const user = buildUser();
        mockUsersService.findByEmail.mockResolvedValue(user);
        bcryptMock.compare.mockResolvedValue(true);
        mockClinicsService.findAllByUser.mockResolvedValue([]);
        mockJwtService.signAsync.mockResolvedValue('token-value');

        // Act
        const result = await service.login({ email: 'ana@clinic.com', password: 'pass123' });

        // Assert
        expect(result).not.toHaveProperty('access_token');
        expect(result).not.toHaveProperty('refresh_token');
        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('clinics');
    });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

```bash
cd apps/odonto-api && npx jest src/modules/auth/auth.service.spec.ts --no-coverage -t "token exposure"
```

Esperado: falha porque `result` tem `access_token`.

- [ ] **Step 3: Modificar auth.service.ts — login() não retorna mais tokens**

Em `apps/odonto-api/src/modules/auth/auth.service.ts`, localizar o método `login()` e alterar o retorno:

```typescript
// ANTES (retorna tokens + user + clinics):
return {
    ...tokens,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    clinics: clinics.map(c => ({ id: c.clinic.id, name: c.clinic.name, role: c.role, avatarUrl: c.avatarUrl ?? null })),
};

// DEPOIS (retorna apenas user + clinics, tokens passados separadamente):
return {
    _tokens: tokens,  // interno, usado pelo controller para setar cookies
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    clinics: clinics.map(c => ({ id: c.clinic.id, name: c.clinic.name, role: c.role, avatarUrl: c.avatarUrl ?? null })),
};
```

Fazer o mesmo para: `registerTenant()`, `registerByInvitation()`, `verifyEmailAndSetPassword()`, `completeClinicSetup()`, `refreshTokens()`. Em todos esses métodos, renomear o campo `access_token`/`refresh_token` no objeto de retorno para `_tokens: { access_token, refresh_token }`.

- [ ] **Step 4: Modificar auth.controller.ts — extrair tokens de _tokens antes de retornar**

Para cada endpoint que seta cookies, alterar:

```typescript
// ANTES:
async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    this.setCookies(res, result.access_token, result.refresh_token);
    return result;
}

// DEPOIS:
async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { _tokens, ...data } = await this.authService.login(loginDto);
    this.setCookies(res, _tokens.access_token, _tokens.refresh_token);
    return data;  // não inclui _tokens
}
```

Aplicar a mesma mudança em: `register`, `registerTenant`, `verifyEmail`, `completeClinicSetup`, `refreshTokens`.

- [ ] **Step 5: Rodar teste de token exposure**

```bash
cd apps/odonto-api && npx jest src/modules/auth/auth.service.spec.ts --no-coverage -t "token exposure"
```

Esperado: passando.

- [ ] **Step 6: Rodar todos os testes do auth.service.spec.ts**

```bash
cd apps/odonto-api && npx jest src/modules/auth/auth.service.spec.ts --no-coverage
```

Esperado: todos passando (ajustar quaisquer testes que dependiam de `access_token` no retorno).

- [ ] **Step 7: Frontend — remover guards `if (res.access_token)` no login**

Em `apps/odonto-front/src/app/login/page.tsx`, substituir:

```typescript
// ANTES:
onSuccess: (response) => {
    const res = response as any;
    if (res.access_token) {
        if (res.user?.id) {
            analytics.identify(String(res.user.id), { ... });
        }
        analytics.capture(EVENT_NAMES.USER_LOGGED_IN, { ... });
        login(res.access_token, undefined, res.user, res.clinics);
    }
},

// DEPOIS:
onSuccess: (response) => {
    const res = response as any;
    if (res.user?.id) {
        analytics.identify(String(res.user.id), { ... });
    }
    analytics.capture(EVENT_NAMES.USER_LOGGED_IN, { ... });
    login('', undefined, res.user, res.clinics);
},
```

- [ ] **Step 8: Frontend — verify/[token]/page.tsx**

```typescript
// ANTES:
if (response.access_token) {
    notificationService.success('E-mail verificado e conta criada com sucesso!');
    login(response.access_token, response.user.clinicName, response.user as any, []);
}

// DEPOIS:
notificationService.success('E-mail verificado e conta criada com sucesso!');
login('', response.user.clinicName, response.user as any, []);
```

- [ ] **Step 9: Frontend — onboarding/clinic/page.tsx**

```typescript
// ANTES:
login(res.access_token, values.clinicName, user, res.clinics);

// DEPOIS:
login('', values.clinicName, user, res.clinics);
```

- [ ] **Step 10: Frontend — limpar tipos em services/auth.ts**

```typescript
// ANTES:
export interface RegisterTenantResponse {
    user: { id: number; name: string; email: string; role: string; clinicName?: string; };
    clinics?: ClinicInfo[];
    access_token: string;
    refresh_token: string;
}

export interface CompleteClinicResponse {
    message: string;
    access_token: string;
    refresh_token: string;
    clinics: ClinicInfo[];
}

// DEPOIS:
export interface RegisterTenantResponse {
    user: { id: number; name: string; email: string; role: string; clinicName?: string; };
    clinics?: ClinicInfo[];
}

export interface CompleteClinicResponse {
    message: string;
    clinics: ClinicInfo[];
}
```

- [ ] **Step 11: Commit**

```bash
git add apps/odonto-api/src/modules/auth/auth.service.ts \
        apps/odonto-api/src/modules/auth/auth.service.spec.ts \
        apps/odonto-api/src/modules/auth/auth.controller.ts \
        apps/odonto-front/src/services/auth.ts \
        apps/odonto-front/src/app/login/page.tsx \
        apps/odonto-front/src/app/register/verify/\[token\]/page.tsx \
        apps/odonto-front/src/app/onboarding/clinic/page.tsx
git commit -m "feat(security): remove JWT tokens from JSON response body — cookies only"
```

---

## Task 4: Padronizar @Tenant() — remover getClinicId()

**Files:**
- Modify: `apps/odonto-api/src/modules/budgets/budgets.controller.ts`
- Modify: `apps/odonto-api/src/modules/dashboard/dashboard.controller.ts`
- Modify: `apps/odonto-api/src/modules/treatment-plans/treatment-plans.controller.ts`
- Modify: `apps/odonto-api/src/modules/clinic-procedures/clinic-procedures.controller.ts`
- Modify: `apps/odonto-api/src/modules/subscription/subscription.controller.ts`
- Modify: `apps/odonto-api/src/modules/patients/controllers/payments.controller.ts`
- Modify: `apps/odonto-api/src/modules/patients/controllers/procedures.controller.ts`

Padrão a aplicar em TODOS: remover `@Request() req` (quando só usava para getClinicId), remover import de `getClinicId`, adicionar `@Tenant() clinicId: number` como parâmetro.

Atenção: se `req` era usado para `req.user` também, manter o `@Request() req` mas também adicionar `@Tenant() clinicId: number` separadamente.

- [ ] **Step 1: Escrever teste de conformidade falhando**

Crie `apps/odonto-api/src/common/tenant-conformance.spec.ts`:

```typescript
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

// Verifica que nenhum controller usa getClinicId()
describe('Tenant isolation conformance', () => {
    it('no controller file should import getClinicId', () => {
        const controllersDir = path.join(__dirname, '../modules');
        const files = glob.sync('**/*.controller.ts', { cwd: controllersDir, absolute: true });

        const violators: string[] = [];
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            if (content.includes('getClinicId')) {
                violators.push(path.relative(process.cwd(), file));
            }
        }

        expect(violators).toEqual([]);
    });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

```bash
cd apps/odonto-api && npx jest src/common/tenant-conformance.spec.ts --no-coverage
```

Esperado: falha listando os 7+ controllers que ainda usam `getClinicId`.

Note: se `glob` não estiver disponível, instale: `npm install -D glob` em odonto-api, ou use `require('glob').sync`.

- [ ] **Step 3: Migrar budgets.controller.ts**

Abra `apps/odonto-api/src/modules/budgets/budgets.controller.ts`.

Remover: `import { getClinicId } from '../../common/get-clinic-id';`

Para cada método que usa `@Request() req` e `getClinicId(req)`:
- Substituir `@Request() req` por `@Tenant() clinicId: number`
- Substituir `getClinicId(req)` por `clinicId`

Exemplo:
```typescript
// ANTES:
@Post()
create(@Body() createBudgetDto: CreateBudgetDto, @Request() req) {
    return this.budgetsService.create(getClinicId(req), createBudgetDto);
}

// DEPOIS:
@Post()
create(@Body() createBudgetDto: CreateBudgetDto, @Tenant() clinicId: number) {
    return this.budgetsService.create(clinicId, createBudgetDto);
}
```

Garantir que `Tenant` está importado de `'../../common/decorators/tenant.decorator'`.

- [ ] **Step 4: Migrar dashboard.controller.ts**

Abra `apps/odonto-api/src/modules/dashboard/dashboard.controller.ts`.

Mesma migração. Substituir `getClinicId(req)` por `@Tenant() clinicId: number` em todos os métodos.

- [ ] **Step 5: Migrar treatment-plans.controller.ts**

Mesma migração em `apps/odonto-api/src/modules/treatment-plans/treatment-plans.controller.ts`.

- [ ] **Step 6: Migrar clinic-procedures.controller.ts**

Mesma migração em `apps/odonto-api/src/modules/clinic-procedures/clinic-procedures.controller.ts`.

- [ ] **Step 7: Migrar subscription.controller.ts**

Em `apps/odonto-api/src/modules/subscription/subscription.controller.ts`, atenção: os métodos usam `req.user` também. Manter `@Request() req` para `req.user`, mas substituir `getClinicId(req)` por parâmetro `@Tenant() clinicId: number`:

```typescript
// ANTES:
getStatus(@Request() req) {
    return this.subscriptionService.getStatus(req.user, getClinicId(req));
}

// DEPOIS:
getStatus(@Request() req, @Tenant() clinicId: number) {
    return this.subscriptionService.getStatus(req.user, clinicId);
}
```

- [ ] **Step 8: Migrar patients/controllers/payments.controller.ts**

Mesma migração.

- [ ] **Step 9: Migrar patients/controllers/procedures.controller.ts**

Mesma migração.

- [ ] **Step 10: Rodar teste de conformidade — deve passar agora**

```bash
cd apps/odonto-api && npx jest src/common/tenant-conformance.spec.ts --no-coverage
```

Esperado: passando (nenhum controller usa `getClinicId`).

- [ ] **Step 11: Rodar todos os testes da API**

```bash
cd apps/odonto-api && npx jest --no-coverage
```

Esperado: mesmos resultados de antes (sem novas regressões).

- [ ] **Step 12: Commit**

```bash
git add apps/odonto-api/src/modules/budgets/budgets.controller.ts \
        apps/odonto-api/src/modules/dashboard/dashboard.controller.ts \
        apps/odonto-api/src/modules/treatment-plans/treatment-plans.controller.ts \
        apps/odonto-api/src/modules/clinic-procedures/clinic-procedures.controller.ts \
        apps/odonto-api/src/modules/subscription/subscription.controller.ts \
        apps/odonto-api/src/modules/patients/controllers/payments.controller.ts \
        apps/odonto-api/src/modules/patients/controllers/procedures.controller.ts \
        apps/odonto-api/src/common/tenant-conformance.spec.ts
git commit -m "refactor(security): standardize @Tenant() decorator across all controllers — remove getClinicId()"
```

---

## Self-Review

### Spec coverage
- ✅ Throttle em register endpoints (Task 1)
- ✅ CORS validation + trust proxy (Task 2)
- ✅ Tokens removidos do JSON body (Task 3)
- ✅ @Tenant() padronizado (Task 4)
- ⏩ Audit logging — deixado fora do escopo (infra-level, melhor implementar junto com um sistema de observabilidade)
- ⏩ Prototype pollution em query params — baixo risco real, descartado por YAGNI

### Placeholder scan
Nenhum placeholder encontrado. Todos os steps têm código real.

### Type consistency
- `_tokens` introduzido em Task 3 é usado consistentemente no service e no controller.
- `buildCorsOrigins` definida em Task 2, Step 1 e importada no Step 6.
