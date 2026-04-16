# ANTIGRAVITY - odonto-api

## AI-SDLC Compliance

**Este projeto segue estritamente o [AI-SDLC.md](../../AI-SDLC.md).**

## Coding Standards

- Use TypeScript for all backend development.
- Follow NestJS best practices and architectural patterns (SOLID, Clean Code).
- **Spec-Driven Development (SDD)**: All changes to the API must first be reflected in DTOs/Swagger decorators.
- **TDD (Test-Driven Development)**:
  1. Escrever o teste (Red).
  2. Implementar a lógica mínima (Green).
  3. Refatorar (Refactor).

## Workflow

1.  **Contract:** Update DTOs/Controllers -> `npm run generate:openapi`.
2.  **Test:** Create a failing test in `src/modules/*/tests/`.
3.  **Implement:** Write the service/logic to pass the test.
4.  **Verify:** Run `npm run test` or `npm run test:e2e`.

## Testing Standards

- **Unit Tests**: Mandatory for all Services. Deve testar sucesso, falha e isolamento de tenant (`clinicId`).
- **E2E Tests**: Mandatory for all new Controller endpoints.
- **Coverage**: Aim for high coverage in business logic layers.

## AI Prompt Guidelines (High Quality)

- **TDD Request**: "Escreva primeiro um teste unitário para este novo serviço seguindo o padrão Jest."
- **Spec Focus**: "Atualize os decorators do Swagger antes de alterar a lógica do controller."
- **Multi-tenancy**: "Garanta que todas as queries SQL/TypeORM incluam explicitamente o filtro de `clinicId`."

## Tech Stack

- Framework: NestJS
- Database: PostgreSQL with TypeORM
- API Documentation: Swagger/OpenAPI
- Validation: class-validator
- Testing: Jest
