# Professional Avatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow clinic professionals to upload a per-clinic profile avatar, scoped to their `ClinicMembership`, accessible from a modal opened via the app header.

**Architecture:** `avatarUrl` is added to `ClinicMembership` (not `User`) so the same professional can have different photos in different clinics. Two new endpoints (`PUT /users/me/avatar`, `DELETE /users/me/avatar`) handle upload/removal. Existing `GET /auth/me` and `GET /users` are extended to return `avatarUrl`. The frontend `AuthContext` hydration bug (stale sessionStorage) is fixed as part of this work. The frontend uses a Shadcn `Dialog` triggered from the existing header `Popover`.

**Tech Stack:** NestJS, TypeORM, Cloudflare R2 (via existing `IStorageProvider`), React, TanStack Query, Shadcn UI, Kubb (API client generation)

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `apps/odonto-api/src/modules/clinics/entities/clinic-membership.entity.ts` | Add `avatarUrl` column |
| Generate | `apps/odonto-api/src/migrations/<ts>-AddAvatarUrlToClinicMembership.ts` | DB migration |
| Create | `apps/odonto-api/src/modules/users/dto/clinic-user.dto.ts` | Response DTO for `GET /users` with `avatarUrl` |
| Modify | `apps/odonto-api/src/modules/users/users.module.ts` | Add `ClinicMembership` to TypeORM features |
| Modify | `apps/odonto-api/src/modules/users/users.service.ts` | `findAllByClinic`, `uploadAvatar`, `removeAvatar` |
| Modify | `apps/odonto-api/src/modules/users/users.controller.ts` | `PUT /users/me/avatar`, `DELETE /users/me/avatar` |
| Modify | `apps/odonto-api/src/modules/clinics/clinics.service.ts` | Extend `findAllByUser` to include `avatarUrl` |
| Modify | `apps/odonto-api/src/modules/auth/auth.service.ts` | Extend `getMe` + `login` clinics map to include `avatarUrl` |
| Create/Update | `apps/odonto-api/src/modules/users/users.service.spec.ts` | Unit tests |
| Modify | `apps/odonto-front/src/contexts/AuthContext.tsx` | Add `avatarUrl` to `UserClinic` + fix stale hydration |
| Modify | `apps/odonto-front/src/components/DashboardHeader.tsx` | Avatar image display + "Alterar foto" trigger |
| Create | `apps/odonto-front/src/components/profile/AvatarUploadModal.tsx` | Upload/remove modal |

---

## Task 1: Add `avatarUrl` to `ClinicMembership` entity and generate migration

**Files:**
- Modify: `apps/odonto-api/src/modules/clinics/entities/clinic-membership.entity.ts`
- Generate: `apps/odonto-api/src/migrations/`

- [ ] **Step 1: Add `avatarUrl` column to the entity**

In `apps/odonto-api/src/modules/clinics/entities/clinic-membership.entity.ts`, add after the `isActive` column (line 25):

```typescript
@Column({ name: 'avatar_url', nullable: true, default: null })
avatarUrl: string | null;
```

Full updated entity for reference:
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Clinic } from '../entities/clinic.entity';
import { ClinicRole } from '../enums/clinic-role.enum';

@Entity('clinic_memberships')
@Unique(['userId', 'clinicId'])
export class ClinicMembership {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'clinic_id' })
    clinicId: number;

    @Column({
        type: 'enum',
        enum: ClinicRole,
        default: ClinicRole.RECEPTIONIST,
    })
    role: ClinicRole;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'avatar_url', nullable: true, default: null })
    avatarUrl: string | null;

    @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Clinic, (clinic) => clinic.memberships, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clinic_id' })
    clinic: Clinic;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
```

- [ ] **Step 2: Build and generate the TypeORM migration**

> **Requires:** PostgreSQL running on port 5434 (per `.env`). In dev, `synchronize: true` auto-applies entity changes, but a migration is needed for production (Fly.io).

```bash
cd apps/odonto-api && npm run build && npm run migration:generate -- AddAvatarUrlToClinicMembership
```

Expected: A new file at `apps/odonto-api/src/migrations/<timestamp>-AddAvatarUrlToClinicMembership.ts` with `ALTER TABLE clinic_memberships ADD COLUMN avatar_url`.

- [ ] **Step 3: Review the generated migration**

Open the generated file and verify it contains an `up()` that adds `avatar_url VARCHAR NULL` and a `down()` that drops it.

- [ ] **Step 4: Commit**

```bash
git add apps/odonto-api/src/modules/clinics/entities/clinic-membership.entity.ts apps/odonto-api/src/migrations/
git commit -m "feat: add avatar_url column to clinic_memberships entity and migration"
```

---

## Task 2: Create `ClinicUserDto`, update `UsersModule`, and fix `findAllByClinic`

**Context:** `GET /users` currently returns `User[]` from a raw query that only selects user columns — no `avatarUrl`. We need to: (a) add a DTO for the new shape, (b) inject `ClinicMembership` repo into `UsersModule`/`UsersService`, (c) update `findAllByClinic` to use it.

**Files:**
- Create: `apps/odonto-api/src/modules/users/dto/clinic-user.dto.ts`
- Modify: `apps/odonto-api/src/modules/users/users.module.ts`
- Modify: `apps/odonto-api/src/modules/users/users.service.ts`
- Modify: `apps/odonto-api/src/modules/users/users.controller.ts`
- Create: `apps/odonto-api/src/modules/users/users.service.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/odonto-api/src/modules/users/users.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserInvitation } from './entities/user-invitation.entity';
import { PendingRegistration } from './entities/pending-registration.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { ClinicMembership } from '../clinics/entities/clinic-membership.entity';
import { STORAGE_PROVIDER } from '../../common/providers/storage/storage.provider.interface';
import { EmailService } from '../email/email.service';

const mockRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
});

describe('UsersService - findAllByClinic', () => {
    let service: UsersService;
    let mockMembershipRepo: ReturnType<typeof mockRepo>;

    beforeEach(async () => {
        mockMembershipRepo = mockRepo();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: getRepositoryToken(User), useValue: mockRepo() },
                { provide: getRepositoryToken(UserInvitation), useValue: mockRepo() },
                { provide: getRepositoryToken(PendingRegistration), useValue: mockRepo() },
                { provide: getRepositoryToken(Clinic), useValue: mockRepo() },
                { provide: getRepositoryToken(ClinicMembership), useValue: mockMembershipRepo },
                { provide: STORAGE_PROVIDER, useValue: { upload: jest.fn(), delete: jest.fn() } },
                { provide: EmailService, useValue: { sendInvitationEmail: jest.fn() } },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it('returns users with avatarUrl from membership', async () => {
        mockMembershipRepo.find.mockResolvedValue([
            {
                user: { id: 1, name: 'Ana', email: 'ana@test.com', role: 'DENTIST', isActive: true },
                avatarUrl: 'https://cdn.example.com/clinics/5/avatars/uuid.jpg',
            },
            {
                user: { id: 2, name: 'Bob', email: 'bob@test.com', role: 'SIMPLE', isActive: true },
                avatarUrl: null,
            },
        ]);

        const result = await service.findAllByClinic(5);

        expect(result).toEqual([
            { id: 1, name: 'Ana', email: 'ana@test.com', role: 'DENTIST', isActive: true, avatarUrl: 'https://cdn.example.com/clinics/5/avatars/uuid.jpg' },
            { id: 2, name: 'Bob', email: 'bob@test.com', role: 'SIMPLE', isActive: true, avatarUrl: null },
        ]);
    });
});
```

- [ ] **Step 2: Run test to confirm it FAILS**

```bash
cd apps/odonto-api && npx jest --testPathPattern="users.service.spec" --no-coverage
```

Expected: FAIL — `ClinicMembership` repo not injected yet, `findAllByClinic` returns old shape.

- [ ] **Step 3: Create `ClinicUserDto`**

Create `apps/odonto-api/src/modules/users/dto/clinic-user.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class ClinicUserDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    role: string;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty({ nullable: true, type: String })
    avatarUrl: string | null;
}
```

- [ ] **Step 4: Update `UsersModule` to add `ClinicMembership`**

In `apps/odonto-api/src/modules/users/users.module.ts`, add `ClinicMembership` to `TypeOrmModule.forFeature`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserInvitation } from './entities/user-invitation.entity';
import { PendingRegistration } from './entities/pending-registration.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { ClinicMembership } from '../clinics/entities/clinic-membership.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User, UserInvitation, PendingRegistration, Clinic, ClinicMembership])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [TypeOrmModule, UsersService],
})
export class UsersModule { }
```

- [ ] **Step 5: Update `UsersService` — inject `ClinicMembership` repo and rewrite `findAllByClinic`**

In `apps/odonto-api/src/modules/users/users.service.ts`:

Add to imports at top:
```typescript
import { ClinicMembership } from '../clinics/entities/clinic-membership.entity';
import { ClinicUserDto } from './dto/clinic-user.dto';
import { Inject } from '@nestjs/common';
import { STORAGE_PROVIDER } from '../../common/providers/storage/storage.provider.interface';
import type { IStorageProvider } from '../../common/providers/storage/storage.provider.interface';
```

Add to constructor (after `private clinicRepository`):
```typescript
@InjectRepository(ClinicMembership)
private membershipRepository: Repository<ClinicMembership>,
@Inject(STORAGE_PROVIDER)
private storageProvider: IStorageProvider,
```

Replace the `findAllByClinic` method (lines 178-187):
```typescript
async findAllByClinic(clinicId: number): Promise<ClinicUserDto[]> {
    const memberships = await this.membershipRepository.find({
        where: { clinicId, isActive: true },
        relations: ['user'],
    });
    return memberships
        .filter(m => m.user)
        .map(m => ({
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            role: m.user.role,
            isActive: m.user.isActive,
            avatarUrl: m.avatarUrl ?? null,
        }));
}
```

- [ ] **Step 6: Update `UsersController` return type annotation for `findAll`**

In `apps/odonto-api/src/modules/users/users.controller.ts`, update the `findAll` method:

Add import: `import { ClinicUserDto } from './dto/clinic-user.dto';`

Update the `findAll` method:
```typescript
@Get()
@Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
@ApiOperation({ summary: 'List all clinic users' })
@ApiResponse({ status: 200, type: [ClinicUserDto] })
findAll(@Tenant() clinicId: number): Promise<ClinicUserDto[]> {
    return this.usersService.findAllByClinic(clinicId);
}
```

- [ ] **Step 7: Run test to confirm it PASSES**

```bash
cd apps/odonto-api && npx jest --testPathPattern="users.service.spec" --no-coverage
```

Expected: PASS — 1 passing test.

- [ ] **Step 8: Commit**

```bash
git add apps/odonto-api/src/modules/users/dto/clinic-user.dto.ts \
        apps/odonto-api/src/modules/users/users.module.ts \
        apps/odonto-api/src/modules/users/users.service.ts \
        apps/odonto-api/src/modules/users/users.controller.ts \
        apps/odonto-api/src/modules/users/users.service.spec.ts
git commit -m "feat: add ClinicUserDto and include avatarUrl in GET /users response"
```

---

## Task 3: Extend `findAllByUser` and `getMe`/`login` to include `avatarUrl`

**Context:** `ClinicsService.findAllByUser` currently returns `{ clinic, role }[]`. We extend it to include `avatarUrl` from the membership. Then `AuthService.getMe`, `login`, and `registerByInvitation` all map this result — they all need to include `avatarUrl` in the clinics array. This is the data that feeds `AuthContext` in the frontend.

**Files:**
- Modify: `apps/odonto-api/src/modules/clinics/clinics.service.ts`
- Modify: `apps/odonto-api/src/modules/auth/auth.service.ts`

- [ ] **Step 1: Update `findAllByUser` in `ClinicsService`**

In `apps/odonto-api/src/modules/clinics/clinics.service.ts`, update the `findAllByUser` method (lines 51-57):

```typescript
async findAllByUser(userId: number): Promise<{ clinic: Clinic; role: ClinicRole; avatarUrl: string | null }[]> {
    const memberships = await this.membershipRepository.find({
        where: { userId, isActive: true },
        relations: ['clinic'],
    });
    return memberships.map(m => ({ clinic: m.clinic, role: m.role, avatarUrl: m.avatarUrl ?? null }));
}
```

- [ ] **Step 2: Update all clinics mappings in `AuthService`**

In `apps/odonto-api/src/modules/auth/auth.service.ts`, find every occurrence of:
```typescript
clinics.map(c => ({ id: c.clinic.id, name: c.clinic.name, role: c.role }))
```

There are 3 occurrences (lines ~54, ~238, ~257). Replace **all three** with:
```typescript
clinics.map(c => ({ id: c.clinic.id, name: c.clinic.name, role: c.role, avatarUrl: c.avatarUrl ?? null }))
```

- [ ] **Step 3: Build to verify no TypeScript errors**

```bash
cd apps/odonto-api && npm run build 2>&1 | grep -E "error TS|Error"
```

Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add apps/odonto-api/src/modules/clinics/clinics.service.ts \
        apps/odonto-api/src/modules/auth/auth.service.ts
git commit -m "feat: include avatarUrl in clinics payload for getMe, login, and registerByInvitation"
```

---

## Task 4: Add avatar upload/remove endpoints

**Context:** Two new endpoints: `PUT /users/me/avatar` (upload) and `DELETE /users/me/avatar` (remove). The `UsersService` already has `membershipRepository` and `storageProvider` injected (done in Task 2). R2 path: `clinics/{clinicId}/avatars`.

**Files:**
- Modify: `apps/odonto-api/src/modules/users/users.service.ts`
- Modify: `apps/odonto-api/src/modules/users/users.controller.ts`
- Modify: `apps/odonto-api/src/modules/users/users.service.spec.ts`

- [ ] **Step 1: Write failing tests**

Add to `apps/odonto-api/src/modules/users/users.service.spec.ts` (append after the existing describe block):

```typescript
describe('UsersService - uploadAvatar', () => {
    let service: UsersService;
    let mockMembershipRepo: ReturnType<typeof mockRepo>;
    let mockStorage: { upload: jest.Mock; delete: jest.Mock };

    beforeEach(async () => {
        mockMembershipRepo = mockRepo();
        mockStorage = { upload: jest.fn(), delete: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: getRepositoryToken(User), useValue: mockRepo() },
                { provide: getRepositoryToken(UserInvitation), useValue: mockRepo() },
                { provide: getRepositoryToken(PendingRegistration), useValue: mockRepo() },
                { provide: getRepositoryToken(Clinic), useValue: mockRepo() },
                { provide: getRepositoryToken(ClinicMembership), useValue: mockMembershipRepo },
                { provide: STORAGE_PROVIDER, useValue: mockStorage },
                { provide: EmailService, useValue: { sendInvitationEmail: jest.fn() } },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    const mockFile = {
        buffer: Buffer.from('img'),
        originalname: 'avatar.jpg',
        mimetype: 'image/jpeg',
    } as Express.Multer.File;

    it('uploads avatar to correct R2 path and returns avatarUrl', async () => {
        mockMembershipRepo.findOne.mockResolvedValue({ userId: 1, clinicId: 5, avatarUrl: null });
        mockStorage.upload.mockResolvedValue('https://cdn.example.com/clinics/5/avatars/uuid.jpg');
        mockMembershipRepo.update.mockResolvedValue({});

        const result = await service.uploadAvatar(1, 5, mockFile);

        expect(mockStorage.upload).toHaveBeenCalledWith(
            mockFile.buffer,
            mockFile.originalname,
            mockFile.mimetype,
            'clinics/5/avatars',
        );
        expect(result).toEqual({ avatarUrl: 'https://cdn.example.com/clinics/5/avatars/uuid.jpg' });
    });

    it('deletes old avatar before uploading new one', async () => {
        mockMembershipRepo.findOne.mockResolvedValue({ userId: 1, clinicId: 5, avatarUrl: 'https://cdn.example.com/clinics/5/avatars/old.jpg' });
        mockStorage.upload.mockResolvedValue('https://cdn.example.com/clinics/5/avatars/new.jpg');
        mockMembershipRepo.update.mockResolvedValue({});

        await service.uploadAvatar(1, 5, mockFile);

        expect(mockStorage.delete).toHaveBeenCalledWith('https://cdn.example.com/clinics/5/avatars/old.jpg');
    });

    it('throws NotFoundException when membership not found on upload', async () => {
        mockMembershipRepo.findOne.mockResolvedValue(null);
        await expect(service.uploadAvatar(1, 99, mockFile)).rejects.toThrow(NotFoundException);
    });

    it('removes avatar and returns null', async () => {
        mockMembershipRepo.findOne.mockResolvedValue({ userId: 1, clinicId: 5, avatarUrl: 'https://cdn.example.com/clinics/5/avatars/uuid.jpg' });
        mockStorage.delete.mockResolvedValue(undefined);
        mockMembershipRepo.update.mockResolvedValue({});

        const result = await service.removeAvatar(1, 5);

        expect(mockStorage.delete).toHaveBeenCalledWith('https://cdn.example.com/clinics/5/avatars/uuid.jpg');
        expect(result).toEqual({ avatarUrl: null });
    });

    it('throws NotFoundException when membership not found on remove', async () => {
        mockMembershipRepo.findOne.mockResolvedValue(null);
        await expect(service.removeAvatar(1, 99)).rejects.toThrow(NotFoundException);
    });
});
```

- [ ] **Step 2: Run tests to confirm they FAIL**

```bash
cd apps/odonto-api && npx jest --testPathPattern="users.service.spec" --no-coverage
```

Expected: FAIL — `uploadAvatar` and `removeAvatar` methods don't exist yet.

- [ ] **Step 3: Add `uploadAvatar` and `removeAvatar` to `UsersService`**

Append to `apps/odonto-api/src/modules/users/users.service.ts` before the closing `}`:

```typescript
async uploadAvatar(userId: number, clinicId: number, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    const membership = await this.membershipRepository.findOne({
        where: { userId, clinicId, isActive: true },
    });
    if (!membership) {
        throw new NotFoundException('Membership not found for this clinic');
    }

    // Delete old avatar (best-effort — proceed even if R2 delete fails)
    if (membership.avatarUrl) {
        try {
            await this.storageProvider.delete(membership.avatarUrl);
        } catch { /* best-effort */ }
    }

    const avatarUrl = await this.storageProvider.upload(
        file.buffer,
        file.originalname,
        file.mimetype,
        `clinics/${clinicId}/avatars`,
    );

    await this.membershipRepository.update({ userId, clinicId }, { avatarUrl });
    return { avatarUrl };
}

async removeAvatar(userId: number, clinicId: number): Promise<{ avatarUrl: null }> {
    const membership = await this.membershipRepository.findOne({
        where: { userId, clinicId, isActive: true },
    });
    if (!membership) {
        throw new NotFoundException('Membership not found for this clinic');
    }

    if (membership.avatarUrl) {
        try {
            await this.storageProvider.delete(membership.avatarUrl);
        } catch { /* best-effort */ }
    }

    await this.membershipRepository.update({ userId, clinicId }, { avatarUrl: null });
    return { avatarUrl: null };
}
```

- [ ] **Step 4: Add endpoints to `UsersController`**

In `apps/odonto-api/src/modules/users/users.controller.ts`, add to imports:

```typescript
import { Put, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
```

Add these two methods after `acceptTerms` (before `findInvitation`):

```typescript
@Put('me/avatar')
@Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
@UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
@ApiOperation({ summary: 'Upload profile avatar for active clinic', operationId: 'usersControllerUploadAvatar' })
@ApiConsumes('multipart/form-data')
@ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
uploadAvatar(
    @Request() req,
    @Tenant() clinicId: number,
    @UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
            ],
        }),
    ) file: Express.Multer.File,
) {
    const userId = req.user.sub || req.user.userId;
    return this.usersService.uploadAvatar(userId, clinicId, file);
}

@Delete('me/avatar')
@Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
@ApiOperation({ summary: 'Remove profile avatar for active clinic', operationId: 'usersControllerRemoveAvatar' })
removeAvatar(@Request() req, @Tenant() clinicId: number) {
    const userId = req.user.sub || req.user.userId;
    return this.usersService.removeAvatar(userId, clinicId);
}
```

- [ ] **Step 5: Run all tests to confirm they PASS**

```bash
cd apps/odonto-api && npx jest --no-coverage 2>&1 | tail -8
```

Expected: All tests pass (including the 5 new ones).

- [ ] **Step 6: Commit**

```bash
git add apps/odonto-api/src/modules/users/users.service.ts \
        apps/odonto-api/src/modules/users/users.controller.ts \
        apps/odonto-api/src/modules/users/users.service.spec.ts
git commit -m "feat: add PUT /users/me/avatar and DELETE /users/me/avatar endpoints"
```

---

## Task 5: Generate OpenAPI spec and regenerate Kubb clients

**Context:** Kubb reads `openapi.json` and generates TypeScript types, Axios clients, and React Query hooks for the frontend. This must be done before writing any frontend code that calls the new endpoints.

**Files:**
- Regenerate: `apps/odonto-api/openapi.json`
- Regenerate: `apps/odonto-front/src/generated/`

- [ ] **Step 1: Start the API server and generate OpenAPI**

> The API must be running for `generate:openapi` to work. Start it in a separate terminal if not already running.

```bash
cd apps/odonto-api && npm run generate:openapi
```

Expected: `apps/odonto-api/openapi.json` updated with the two new endpoints (`PUT /users/me/avatar`, `DELETE /users/me/avatar`) and the updated `GET /users` response shape.

- [ ] **Step 2: Verify new endpoints appear in openapi.json**

```bash
grep -A 3 "usersControllerUploadAvatar\|usersControllerRemoveAvatar" apps/odonto-api/openapi.json | head -20
```

Expected: Both operation IDs appear.

- [ ] **Step 3: Regenerate Kubb clients**

```bash
cd apps/odonto-front && npm run kubb
```

Expected: New files generated:
- `apps/odonto-front/src/generated/hooks/useUsersControllerUploadAvatar.ts`
- `apps/odonto-front/src/generated/hooks/useUsersControllerRemoveAvatar.ts`
- Updated `apps/odonto-front/src/generated/ts/` types for `ClinicUserDto` with `avatarUrl`

- [ ] **Step 4: Commit**

```bash
git add apps/odonto-api/openapi.json apps/odonto-front/src/generated/
git commit -m "chore: regenerate openapi.json and kubb clients for avatar endpoints"
```

---

## Task 6: Update `AuthContext` — add `avatarUrl` type and fix stale hydration

**Context:** `UserClinic` interface needs `avatarUrl`. The hydration code at line 62-64 sets `activeClinic` from the stale sessionStorage snapshot (`parsed`) instead of the fresh server response — this prevents the avatar from updating after upload. We fix it to use the fresh data.

**Files:**
- Modify: `apps/odonto-front/src/contexts/AuthContext.tsx`

- [ ] **Step 1: Update `UserClinic` interface**

In `apps/odonto-front/src/contexts/AuthContext.tsx`, update the `UserClinic` interface (lines 15-19):

```typescript
export interface UserClinic {
    id: number;
    name: string;
    role: string;
    avatarUrl?: string | null;
}
```

- [ ] **Step 2: Fix the stale sessionStorage hydration**

Replace lines 62-64:
```typescript
// BEFORE (stale):
if (response.data.clinics.find((c: UserClinic) => c.id === parsed.id)) {
    setActiveClinicState(parsed);
    api.defaults.headers.common['X-Clinic-Id'] = String(parsed.id);
```

With:
```typescript
// AFTER (uses fresh server data):
const freshClinic = response.data.clinics.find((c: UserClinic) => c.id === parsed.id);
if (freshClinic) {
    setActiveClinicState(freshClinic);
    sessionStorage.setItem('activeClinic', JSON.stringify(freshClinic));
    api.defaults.headers.common['X-Clinic-Id'] = String(freshClinic.id);
```

- [ ] **Step 3: Build the frontend to verify no TypeScript errors**

```bash
cd apps/odonto-front && npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: No TypeScript errors related to `avatarUrl`.

- [ ] **Step 4: Commit**

```bash
git add apps/odonto-front/src/contexts/AuthContext.tsx
git commit -m "fix: add avatarUrl to UserClinic type and fix stale activeClinic hydration from sessionStorage"
```

---

## Task 7: Update `DashboardHeader` — show avatar image and add "Alterar foto" trigger

**Context:** The avatar circle in the header (line 85 in `DashboardHeader.tsx`) currently only shows initials. We add a conditional `<img>` when `avatarUrl` is present. We also add an "Alterar foto" button to the existing `PopoverContent` that opens the `AvatarUploadModal` dialog.

**Files:**
- Modify: `apps/odonto-front/src/components/DashboardHeader.tsx`

- [ ] **Step 1: Update `DashboardHeader.tsx`**

Full updated file:

```tsx
'use client';

import { useState } from 'react';

import { NotificationBell } from './notifications/NotificationBell';
import { Search, Settings, LogOut, ChevronDown, Menu, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientSearchCMDK } from '@/components/patients/PatientSearchCMDK';
import { Sidebar } from '@/components/Sidebar';
import { AvatarUploadModal } from '@/components/profile/AvatarUploadModal';

export function DashboardHeader() {
    const { user, logout, activeClinic } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [avatarModalOpen, setAvatarModalOpen] = useState(false);

    const initials = user?.name
        ? user.name.split(' ').slice(0, 2).map((n) => n[0].toUpperCase()).join('')
        : '?';

    return (
        <header className="card-surface min-h-[4rem] flex items-center justify-between px-4 sm:px-6 py-3 shrink-0 rounded-2xl border border-gray-100 shadow-sm bg-white">
            {/* Left: Mobile Menu & Logo */}
            <div className="flex items-center flex-1 overflow-hidden pr-4 gap-3">
                <div className="md:hidden flex items-center">
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors active:scale-95">
                                <Menu className="h-5 w-5" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72 flex flex-col border-r-0">
                            <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                            <Sidebar isMobile />
                        </SheetContent>
                    </Sheet>
                </div>
                <div
                    className="flex items-center gap-2 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => router.push('/dashboard')}
                >
                    <span className="font-bold text-[1.1rem] sm:text-xl tracking-tight text-gray-800">
                        Odonto<span className="text-teal-600 font-extrabold">Eh</span>Tec
                    </span>
                </div>
            </div>

            {/* Search Trigger */}
            <div className="relative w-full max-w-sm hidden md:block group mr-4">
                <button
                    onClick={() => setSearchOpen(true)}
                    className="relative w-full flex items-center justify-between pl-4 pr-3 py-2 text-sm text-muted-foreground rounded-full bg-gray-50 border border-gray-100 shadow-sm hover:border-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all h-10 group-hover:bg-gray-100/50 cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 group-hover:text-primary transition-colors duration-200" />
                        <span>Pesquisar paciente</span>
                    </div>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
                <NotificationBell />
                <div className="w-[1px] h-8 bg-gray-200 hidden sm:block" />

                {/* User Profile Popover */}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <button className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer group outline-none">
                            <div className="h-9 w-9 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-sm font-bold text-primary shadow-sm border border-primary/20 shrink-0">
                                {activeClinic?.avatarUrl
                                    ? <img src={activeClinic.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                    : initials
                                }
                            </div>
                            <div className="flex flex-col items-start hidden sm:flex">
                                {user?.name ? (
                                    <>
                                        <span className="text-sm font-semibold text-gray-800 leading-tight">{user.name || 'Usuário'}</span>
                                        <span className="text-xs text-muted-foreground font-medium leading-tight">{user.email || ''}</span>
                                    </>
                                ) : (
                                    <div className="space-y-1.5 flex flex-col">
                                        <Skeleton className="h-3.5 w-24" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                )}
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block group-hover:text-gray-700 transition-colors" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-1.5" align="end">
                        <button
                            onClick={() => { setOpen(false); setAvatarModalOpen(true); }}
                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            Alterar foto
                        </button>
                        <Separator className="my-1" />
                        {activeClinic?.role !== 'DENTIST' && (
                            <button
                                onClick={() => { setOpen(false); router.push('/settings'); }}
                                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <Settings className="h-4 w-4 text-muted-foreground" />
                                Configurações
                            </button>
                        )}
                        <Separator className="my-1" />
                        <button
                            onClick={() => { setOpen(false); logout(); }}
                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                            <LogOut className="h-4 w-4" />
                            Sair da aplicação
                        </button>
                    </PopoverContent>
                </Popover>

                {/* Avatar upload modal — rendered outside Popover to avoid nesting issues */}
                <AvatarUploadModal open={avatarModalOpen} onOpenChange={setAvatarModalOpen} />
            </div>

            {/* CMDK Search Palette */}
            <PatientSearchCMDK open={searchOpen} onOpenChange={setSearchOpen} />
        </header>
    );
}
```

- [ ] **Step 2: Build to verify no TypeScript errors**

```bash
cd apps/odonto-front && npm run build 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```

Expected: No errors from `DashboardHeader.tsx`.

- [ ] **Step 3: Commit**

```bash
git add apps/odonto-front/src/components/DashboardHeader.tsx
git commit -m "feat: show avatar image in header and add Alterar foto trigger"
```

---

## Task 8: Create `AvatarUploadModal` component

**Context:** Modal triggered from the header. Shows current avatar, a file input with preview, "Salvar" and "Remover foto" buttons. Uses the generated Kubb hooks. After save/remove, invalidates `GET /auth/me` so the header avatar updates automatically.

**Files:**
- Create: `apps/odonto-front/src/components/profile/AvatarUploadModal.tsx`

- [ ] **Step 1: Find the generated hook names after Kubb regeneration**

```bash
ls apps/odonto-front/src/generated/hooks/ | grep -i avatar
```

Expected: Files named `useUsersControllerUploadAvatar.ts` and `useUsersControllerRemoveAvatar.ts` (if operationId was set correctly in Task 4). Use whatever names appear.

- [ ] **Step 2: Create `AvatarUploadModal.tsx`**

Create `apps/odonto-front/src/components/profile/AvatarUploadModal.tsx`:

```tsx
'use client';

import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notification.service';
import { useUsersControllerUploadAvatar } from '@/generated/hooks/useUsersControllerUploadAvatar';
import { useUsersControllerRemoveAvatar } from '@/generated/hooks/useUsersControllerRemoveAvatar';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface AvatarUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AvatarUploadModal({ open, onOpenChange }: AvatarUploadModalProps) {
    const { activeClinic, user } = useAuth();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const uploadMutation = useUsersControllerUploadAvatar();
    const removeMutation = useUsersControllerRemoveAvatar();

    const initials = user?.name
        ? user.name.split(' ').slice(0, 2).map((n) => n[0].toUpperCase()).join('')
        : '?';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ACCEPTED_TYPES.includes(file.type)) {
            notificationService.error('Formato inválido. Use JPG, PNG ou WebP.');
            return;
        }
        if (file.size > MAX_SIZE_BYTES) {
            notificationService.error('Imagem muito grande. Máximo 5MB.');
            return;
        }

        // Revoke previous preview URL to avoid memory leaks
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        if (!selectedFile) return;
        try {
            await uploadMutation.mutateAsync({ data: { file: selectedFile } });
            // ⚠️ VERIFY THIS KEY: check apps/odonto-front/src/generated/hooks/ for the GET /auth/me hook
        // and use its queryKey value here. Run: grep -r "queryKey" apps/odonto-front/src/generated/hooks/ | grep -i "authme\|getme"
        await queryClient.invalidateQueries({ queryKey: ['/auth/me'] });
            notificationService.success('Foto atualizada com sucesso!');
            handleClose();
        } catch {
            notificationService.error('Erro ao salvar foto. Tente novamente.');
        }
    };

    const handleRemove = async () => {
        try {
            await removeMutation.mutateAsync({});
            // ⚠️ SAME KEY as above — must match the generated hook's queryKey
            await queryClient.invalidateQueries({ queryKey: ['/auth/me'] });
            notificationService.success('Foto removida.');
            handleClose();
        } catch {
            notificationService.error('Erro ao remover foto. Tente novamente.');
        }
    };

    const handleClose = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
        onOpenChange(false);
    };

    const currentAvatarUrl = previewUrl ?? activeClinic?.avatarUrl ?? null;
    const isLoading = uploadMutation.isPending || removeMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Foto de perfil</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-4">
                    {/* Avatar preview */}
                    <div className="h-24 w-24 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-2xl font-bold text-primary border-2 border-primary/20">
                        {currentAvatarUrl
                            ? <img src={currentAvatarUrl} alt="preview" className="w-full h-full object-cover" />
                            : initials
                        }
                    </div>

                    {/* File input (hidden, triggered by button) */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                    >
                        Escolher imagem
                    </Button>

                    {selectedFile && (
                        <p className="text-sm text-muted-foreground text-center truncate max-w-full px-4">
                            {selectedFile.name}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={!selectedFile || isLoading}
                        className="w-full"
                    >
                        {uploadMutation.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>

                    {activeClinic?.avatarUrl && !previewUrl && (
                        <Button
                            variant="ghost"
                            onClick={handleRemove}
                            disabled={isLoading}
                            className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                            {removeMutation.isPending ? 'Removendo...' : 'Remover foto'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
```

> **Note on query key:** The `queryKey` used in `invalidateQueries` (`['/auth/me']`) must match what Kubb generates for the `GET /auth/me` endpoint. After kubb runs, check `apps/odonto-front/src/generated/hooks/useAuthControllerGetMe.ts` (or similar) and use the same key.

- [ ] **Step 2: Build the frontend to verify no TypeScript errors**

```bash
cd apps/odonto-front && npm run build 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```

Expected: No errors from `AvatarUploadModal.tsx`.

- [ ] **Step 3: Run full backend test suite one last time**

```bash
cd apps/odonto-api && npx jest --no-coverage 2>&1 | tail -5
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/odonto-front/src/components/profile/AvatarUploadModal.tsx
git commit -m "feat: add AvatarUploadModal component for per-clinic profile photo"
```

---

## Note on Query Key Verification

After completing Task 5 (Kubb), verify the React Query key for `GET /auth/me`. Open the generated hook file and look for the `queryKey`. Example:

```bash
grep -r "queryKey" apps/odonto-front/src/generated/hooks/ | grep -i "authme\|auth-me\|getme" | head -5
```

Use whatever key Kubb generates in `AvatarUploadModal`'s `invalidateQueries` call (Task 8).
