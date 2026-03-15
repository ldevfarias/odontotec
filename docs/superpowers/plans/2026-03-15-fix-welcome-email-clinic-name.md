# Fix Welcome Email Clinic Name Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the welcome email dispatch from step 2 (provisional clinic creation) to step 3 (clinic setup completion) so the email shows the real clinic name chosen by the user.

**Architecture:** Single-file change in `auth.service.ts` — remove `sendWelcomeEmail` call from `verifyEmailAndSetPassword` and add it to `completeClinicSetup` after the clinic name update. No schema, no migration, no new files needed.

**Tech Stack:** NestJS, TypeScript, Jest (unit tests already present for auth service)

---

## Root Cause Analysis

The 4-step onboarding flow:

| Step | Method | What happens |
|------|--------|--------------|
| 1 | `initiateRegistration` | Creates pending registration, sends verification email |
| 2 | `verifyEmailAndSetPassword` | Creates user + provisional clinic named `${pending.name} Clinic` → **sends welcome email here** ← BUG |
| 3 | `completeClinicSetup` | Updates clinic with real name (e.g. "sorridente"), activates user — no email sent |
| 4 | (login / redirect) | — |

The email is sent at step 2 when the clinic name is still provisional (`"luuuucas farias Clinic"`). The real name only exists after step 3.

The fix is to move `sendWelcomeEmail` to `completeClinicSetup`, after `clinicsService.update()` is called.

---

## Files

| Action | File | What changes |
|--------|------|--------------|
| Modify | `apps/odonto-api/src/modules/auth/auth.service.ts` | Remove email call from `verifyEmailAndSetPassword`; add it to `completeClinicSetup` |
| Modify (tests) | `apps/odonto-api/src/modules/auth/auth.service.spec.ts` (if it exists) | Update/add test expectations |

---

## Chunk 1: Fix the email dispatch timing

### Task 1: Remove the welcome email call from `verifyEmailAndSetPassword`

**Files:**
- Modify: `apps/odonto-api/src/modules/auth/auth.service.ts:108-112`

- [ ] **Step 1: Open the file and locate the call**

  File: [apps/odonto-api/src/modules/auth/auth.service.ts](apps/odonto-api/src/modules/auth/auth.service.ts)

  Current code at ~line 108 inside `verifyEmailAndSetPassword`:
  ```typescript
  try {
      await this.emailService.sendWelcomeEmail(user.email, user.name, clinic.name);
  } catch (e) {
      console.error('Failed to send welcome email', e);
  }
  ```
  At this point `clinic.name` is `"${pending.name} Clinic"` (provisional) — that is the bug.

- [ ] **Step 2: Delete the email block from `verifyEmailAndSetPassword`**

  Remove the entire try/catch block that calls `sendWelcomeEmail` from `verifyEmailAndSetPassword` (lines ~108-112). The method should go directly from token generation to the `return` statement.

  After the edit the end of `verifyEmailAndSetPassword` should look like:
  ```typescript
  // Generate tokens so user can proceed to step 3 authenticated
  const tokens = await this.getTokens(user.id, user.email, user.role, user.isActive);
  await this.updateRefreshToken(user.id, tokens.refresh_token);

  return {
      user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          clinicName: clinic.name,
      },
      ...tokens,
  };
  ```

---

### Task 2: Add the welcome email call to `completeClinicSetup`

**Files:**
- Modify: `apps/odonto-api/src/modules/auth/auth.service.ts:148-167`

- [ ] **Step 1: Locate `completeClinicSetup`**

  Current code at ~line 148 (clinic update block):
  ```typescript
  // Update clinic
  await this.clinicsService.update(ownerClinic.clinic.id, {
      name: dto.clinicName,
      phone: dto.clinicPhone,
      address: dto.clinicAddress,
  } as any);

  // Mark user as active, unblocking their access
  await this.usersService.update(user.id, { isActive: true } as any);

  // Generate new tokens with isActive = true
  const tokens = await this.getTokens(user.id, user.email, user.role, true);
  await this.updateRefreshToken(user.id, tokens.refresh_token);

  const clinics = await this.clinicsService.findAllByUser(userId);

  return {
      message: 'Clinic setup completed successfully',
      ...tokens,
      clinics: clinics.map(c => ({ id: c.clinic.id, name: c.clinic.name, role: c.role })),
  };
  ```

- [ ] **Step 2: Add `sendWelcomeEmail` after the clinic update, before the return**

  After `await this.usersService.update(...)` and after token generation, add:
  ```typescript
  try {
      await this.emailService.sendWelcomeEmail(user.email, user.name, dto.clinicName);
  } catch (e) {
      this.logger.error('Failed to send welcome email', e);
  }
  ```

  Use `dto.clinicName` directly (it was just persisted) rather than re-querying. Use `this.logger.error` consistent with the rest of the service.

  Final shape of `completeClinicSetup` return section:
  ```typescript
  // Update clinic
  await this.clinicsService.update(ownerClinic.clinic.id, {
      name: dto.clinicName,
      phone: dto.clinicPhone,
      address: dto.clinicAddress,
  } as any);

  // Mark user as active, unblocking their access
  await this.usersService.update(user.id, { isActive: true } as any);

  // Generate new tokens with isActive = true
  const tokens = await this.getTokens(user.id, user.email, user.role, true);
  await this.updateRefreshToken(user.id, tokens.refresh_token);

  try {
      await this.emailService.sendWelcomeEmail(user.email, user.name, dto.clinicName);
  } catch (e) {
      this.logger.error('Failed to send welcome email', e);
  }

  const clinics = await this.clinicsService.findAllByUser(userId);

  return {
      message: 'Clinic setup completed successfully',
      ...tokens,
      clinics: clinics.map(c => ({ id: c.clinic.id, name: c.clinic.name, role: c.role })),
  };
  ```

- [ ] **Step 3: Build to verify no TS errors**

  Run from `apps/odonto-api/`:
  ```bash
  npm run build
  ```
  Expected: exits 0, no TypeScript errors.

- [ ] **Step 4: Commit**

  ```bash
  git add apps/odonto-api/src/modules/auth/auth.service.ts
  git commit -m "fix: send welcome email after clinic setup with real clinic name

  The welcome email was sent in verifyEmailAndSetPassword with the
  provisional clinic name (e.g. 'luuuucas farias Clinic') before the
  user had a chance to set their real clinic name in completeClinicSetup.

  Move sendWelcomeEmail to completeClinicSetup so it fires with the
  actual clinic name chosen by the user."
  ```

---

## Verification (manual)

1. Start a fresh registration flow with a new email.
2. Complete all 4 steps, entering a distinct clinic name (e.g. "Sorridente").
3. Check the received email — it should read:
   > "Parabéns! A sua clínica **Sorridente** foi cadastrada com sucesso."
4. Confirm `registerTenant` (single-step flow) is unaffected — it was already correct and was not modified.
