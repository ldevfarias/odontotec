# Professional Avatar — Design Spec

## Overview

Allow clinic professionals to upload a per-clinic profile avatar. The avatar is scoped to the `ClinicMembership` (not global to the user), so the same professional can have different photos in different clinics.

---

## Decisions

| Question | Decision |
|---|---|
| Avatar scope | Per clinic (stored on `ClinicMembership`) |
| Who can upload | Only the professional themselves |
| Upload UX | Preview before confirm |
| Remove avatar | Yes — button in the same modal |

---

## Backend

### Data Model

Add `avatarUrl` (nullable string) to the `ClinicMembership` entity:

```typescript
// apps/odonto-api/src/modules/clinics/entities/clinic-membership.entity.ts
@Column({ nullable: true })
avatarUrl: string | null;
```

Generate a TypeORM migration to add the column.

### R2 Storage Path

```
clinics/{clinicId}/avatars/{uuid}.ext
```

Follows the same multi-tenant scoping pattern as:
- `clinics/{clinicId}/patients/{patientId}/exams/{uuid}`
- `clinics/{clinicId}/logos/{uuid}`

### API Endpoints

**Upload avatar**
```
PUT /users/me/avatar
```
- Auth: `JwtAuthGuard` + `X-Clinic-Id` header
- Body: `multipart/form-data` with `file` field
- Constraints: max 5MB, accepted types `image/jpeg`, `image/png`, `image/webp`
- Behavior:
  1. If membership already has an `avatarUrl`, delete the old file from R2 first
  2. Upload new file to `clinics/{clinicId}/avatars/{uuid}.ext`
  3. Update `ClinicMembership.avatarUrl` with the returned URL
  4. Return updated membership (or just `{ avatarUrl }`)

**Remove avatar**
```
DELETE /users/me/avatar
```
- Auth: `JwtAuthGuard` + `X-Clinic-Id` header
- Behavior:
  1. Delete file from R2 (if `avatarUrl` is set)
  2. Set `ClinicMembership.avatarUrl = null`
  3. Return `{ avatarUrl: null }`

**List professionals** (existing, update response)
```
GET /users
```
- Already returns user list; must now include `avatarUrl` from the membership join

### Affected Files

| Action | File |
|---|---|
| Modify | `apps/odonto-api/src/modules/clinics/entities/clinic-membership.entity.ts` |
| Modify | `apps/odonto-api/src/modules/users/users.controller.ts` |
| Modify | `apps/odonto-api/src/modules/users/users.service.ts` |
| Generate | `apps/odonto-api/src/migrations/<timestamp>-AddAvatarUrlToClinicMembership.ts` |

---

## Frontend

### Entry Point

Click on the user avatar in the app header → opens the avatar modal.

### Avatar Modal

- **Mobile-first:** full-width bottom sheet on mobile, centered modal on desktop
- **Contents:**
  1. Current avatar (photo) or initials fallback if no avatar
  2. File input — accepts `.jpg, .jpeg, .png, .webp`, max 5MB
  3. Preview of the selected image (shown after file selection, before upload)
  4. **"Salvar"** button — calls `PUT /users/me/avatar`, disabled until file selected
  5. **"Remover foto"** button — calls `DELETE /users/me/avatar`, visible only when `avatarUrl` is set

### State Flow

```
idle → file selected → preview shown → user clicks Salvar → uploading → success → modal closes
                                      → user clicks Remover → removing → success → modal closes
```

### After Save/Remove

- Invalidate React Query cache for `GET /auth/me` and `GET /users`
- Avatar in the header updates immediately

### Kubb Regeneration

After API changes are finalized:
1. `npm run generate:openapi` in `odonto-api`
2. `npm run kubb` in `odonto-front`
3. Use generated hooks `useUsersControllerUploadAvatar` and `useUsersControllerRemoveAvatar`

### Affected Files

| Action | File |
|---|---|
| Modify | `apps/odonto-front/src/components/layout/Header.tsx` (or wherever the avatar lives) |
| Create | `apps/odonto-front/src/components/profile/AvatarUploadModal.tsx` |
| Regenerate | `apps/odonto-front/src/generated/` (after kubb) |

---

## Out of Scope

- Cropping/resizing the image before upload
- Admin uploading on behalf of a professional
- Avatar on the User entity (global)
