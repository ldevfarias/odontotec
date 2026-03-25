# Professional Avatar — Design Spec

## Overview

Allow clinic professionals to upload a per-clinic profile avatar. The avatar is scoped to the `ClinicMembership` (not global to the user), so the same professional can have different photos in different clinics.

---

## Decisions

| Question | Decision |
|---|---|
| Avatar scope | Per clinic (stored on `ClinicMembership`) |
| Who can upload | Only the professional themselves |
| Upload UX | Select file → preview → confirm ("Salvar") |
| Remove avatar | Yes — "Remover foto" button in the same modal |
| Roles allowed | All roles (ADMIN, DENTIST, SIMPLE) — any membership can have an avatar |

---

## Backend

### Data Model

Add `avatarUrl` (nullable string) to the `ClinicMembership` entity:

```typescript
// apps/odonto-api/src/modules/clinics/entities/clinic-membership.entity.ts
@Column({ name: 'avatar_url', nullable: true, default: null })
avatarUrl: string | null;
```

Generate a TypeORM migration to add the `avatar_url` column.

### R2 Storage Path

```
clinics/{clinicId}/avatars/{uuid}.ext
```

### API Endpoints

**Upload avatar**
```
PUT /users/me/avatar
```
- Auth: `JwtAuthGuard` — all roles (no `@Roles()` restriction)
- Header: `X-Clinic-Id` (identifies which membership to update)
- Body: `multipart/form-data` with `file` field, via `@UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))`
- Constraints: max 5MB, accepted types `image/jpeg`, `image/png`, `image/webp` (same validators as clinic logo)
- Guard chain: `JwtAuthGuard` only — `ClinicMembershipGuard` does NOT apply to `/users/me/*` routes (verified pattern in existing `accept-terms` endpoint)
- Behavior:
  1. Find calling user's `ClinicMembership` by `(userId, clinicId)` — return `404` if not found
  2. If membership already has an `avatarUrl`, delete the old file from R2 first (best-effort — proceed even if R2 delete fails)
  3. Upload new file to `clinics/{clinicId}/avatars/{uuid}.ext`
  4. Update `ClinicMembership.avatarUrl` with the returned URL
  5. Return `{ avatarUrl: string }`

**Remove avatar**
```
DELETE /users/me/avatar
```
- Auth: `JwtAuthGuard` — all roles
- Header: `X-Clinic-Id`
- Guard chain: `JwtAuthGuard` only
- Behavior:
  1. Find calling user's `ClinicMembership` — return `404` if not found
  2. Delete file from R2 if `avatarUrl` is set (best-effort)
  3. Set `ClinicMembership.avatarUrl = null`
  4. Return `{ avatarUrl: null }`

**Get me (existing — extend response)**
```
GET /auth/me
```
- Currently returns `{ user: {...}, clinics: [{ id, name, role }] }`
- `ClinicsService.findAllByUser` currently returns `{ clinic: Clinic, role: ClinicRole }[]`
- Extend `findAllByUser` to also return the full `ClinicMembership` shape: `{ clinic: Clinic, role: ClinicRole, avatarUrl: string | null }[]` — achieved by selecting `membership.avatarUrl` in the query alongside `clinic.*`
- Extend the `getMe` mapping in `auth.service.ts` to include `avatarUrl`:
  ```typescript
  clinics: memberships.map(m => ({
    id: m.clinic.id,
    name: m.clinic.name,
    role: m.role,
    avatarUrl: m.avatarUrl ?? null,
  }))
  ```
- This is the single source of truth for `avatarUrl` in the frontend's `AuthContext`

**List professionals (existing — extend response)**
```
GET /users
```
- `findAllByClinic` currently uses `createQueryBuilder` selecting only `user.*` columns, returns `User[]`
- Extend to return `{ id, name, email, role, isActive, avatarUrl }[]` by also selecting `membership.avatar_url AS "avatarUrl"` in the query
- Return type becomes a plain DTO (not a `User` entity) — update controller return type accordingly so OpenAPI reflects the new shape (required for correct Kubb regeneration)

### Module Dependencies

`UsersModule` must import `TypeOrmModule.forFeature([ClinicMembership])` so the membership repository can be injected into `UsersService`.

`StorageModule` is `@Global()` — no import needed.

### Affected Files

| Action | File |
|---|---|
| Modify | `apps/odonto-api/src/modules/clinics/entities/clinic-membership.entity.ts` |
| Modify | `apps/odonto-api/src/modules/users/users.controller.ts` |
| Modify | `apps/odonto-api/src/modules/users/users.service.ts` |
| Modify | `apps/odonto-api/src/modules/users/users.module.ts` |
| Create | `apps/odonto-api/src/modules/users/dto/clinic-user.dto.ts` (DTO for `GET /users` response with `avatarUrl`, decorated with `@ApiProperty()`) |
| Modify | `apps/odonto-api/src/modules/clinics/clinics.service.ts` (`findAllByUser`) |
| Modify | `apps/odonto-api/src/modules/auth/auth.service.ts` (`getMe` mapping) |
| Generate | `apps/odonto-api/src/migrations/<timestamp>-AddAvatarUrlToClinicMembership.ts` |

---

## Frontend

### Entry Point

In `DashboardHeader.tsx`, the `PopoverContent` (lines 104–123) shows Settings and Logout. Add an **"Alterar foto"** button at the top of `PopoverContent` that opens the `AvatarUploadModal` dialog. The avatar circle (the `div` at line 85 inside the `PopoverTrigger` button) is updated to render `<img>` when `avatarUrl` is present, falling back to initials.

### Avatar Display in Header

```tsx
// Inside PopoverTrigger button, replace initials-only div:
<div className="h-9 w-9 rounded-full bg-primary/10 overflow-hidden ...">
  {activeClinic?.avatarUrl
    ? <img src={activeClinic.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
    : initials
  }
</div>
```

`activeClinic` comes from `AuthContext` — already available in `DashboardHeader`.

### `AuthContext` — Avatar Hydration Fix

`AuthContext` currently restores `activeClinic` from `sessionStorage` (stale snapshot). After refetching `GET /auth/me`, it must merge the fresh server data:

```typescript
// When re-fetching /auth/me, find the active clinic from the FRESH response:
const freshClinic = response.data.clinics.find(c => c.id === parsed.id);
setActiveClinicState(freshClinic ?? parsed); // prefer fresh, fall back to stored
```

This ensures `avatarUrl` updates in the header immediately after upload/remove without a page reload.

### `AvatarUploadModal` Component

**File:** `apps/odonto-front/src/components/profile/AvatarUploadModal.tsx`

- Uses Shadcn `Dialog` component
- **Mobile-first:** `Dialog` is already full-width on mobile
- **Contents:**
  1. Current avatar (photo) or initials fallback
  2. File input — accepts `.jpg, .jpeg, .png, .webp`, max 5MB, validated client-side before upload
  3. Preview of selected image (object URL via `URL.createObjectURL`)
  4. **"Salvar"** button — calls `PUT /users/me/avatar`, disabled until file selected, shows loading state
  5. **"Remover foto"** button — calls `DELETE /users/me/avatar`, visible only when `avatarUrl` is set, shows loading state

### State Flow

```
idle
 → file selected → preview shown
    → "Salvar" clicked → uploading → success → close modal, invalidate GET /auth/me
    → "Remover foto" clicked → removing → success → close modal, invalidate GET /auth/me
```

Errors shown via `notificationService` (Sonner wrapper at `src/services/notification.service.ts`).

### Kubb Regeneration

After API changes:
1. `npm run generate:openapi` in `odonto-api`
2. `npm run kubb` in `odonto-front`
3. Use generated hooks: `useUsersControllerUploadAvatar`, `useUsersControllerRemoveAvatar`

### Affected Files

| Action | File |
|---|---|
| Modify | `apps/odonto-front/src/components/DashboardHeader.tsx` |
| Create | `apps/odonto-front/src/components/profile/AvatarUploadModal.tsx` |
| Modify | `apps/odonto-front/src/contexts/AuthContext.tsx` (add `avatarUrl` to clinic type + hydration fix) |
| Regenerate | `apps/odonto-front/src/generated/` (after kubb) |

---

## Out of Scope

- Cropping/resizing the image before upload
- Admin uploading on behalf of a professional
- Avatar on the User entity (global)
