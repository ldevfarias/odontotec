<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# OdontoTec API (Holographic Voyager)

A Multi-Tenant Dental Clinic Management System built with **NestJS**.

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- [**Architecture & Security**](./docs/ARCHITECTURE.md): Explains the multi-tenancy model, security layers (Tenancy Guard, Throttling), and module structure.
- [**Changelog**](./docs/API_CHANGELOG.md): Tracks recent features (Patient Procedures, Anamnesis, Payments) and fixes.
- [**API Documentation**](./API_DOCUMENTATION.md): (Legacy) Initial API overview.

## Quick Start

### 1. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Database

Ensure PostgreSQL is running and update `.env` (or let the app use defaults for local dev).

### 3. Run the application

\`\`\`bash

# development

npm run start

# watch mode

npm run start:dev
\`\`\`

### 4. Seed Database (Optional)

Populate the DB with initial clinics and users:
\`\`\`bash
npm run seed
\`\`\`

## Security Features

- **Tenancy Isolation**: Strict `clinicId` enforcement via `TenancyInterceptor`.
- **Rate Limiting**: Global throttling enabled.
- **RBAC**: Role-based access for Admin, Dentist, and Simple users.

## License

[MIT licensed](LICENSE).
