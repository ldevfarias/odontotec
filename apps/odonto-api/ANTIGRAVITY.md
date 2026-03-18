# ANTIGRAVITY - odonto-api

## Coding Standards
- Use TypeScript for all backend development.
- Follow NestJS best practices and architectural patterns.
- Implement **Spec-Driven Development (SDD)**: All changes to the API must first be reflected in the OpenAPI/Swagger specification.
- **Workflow**:
    1. Update DTOs/Controllers in NestJS.
    2. Run `npm run generate:openapi` to export the contract.
    3. Ensure the spec is satisfied before allowing frontend sync.
- **Testing Standards**:
    - **Unit Tests**: Mandatory for Services and Utilities using Jest.
    - **E2E Tests**: Mandatory for critical API flows (Auth, CRUDs).
    - Always run tests before committing: `npm run test`.

## AI Prompt Guidelines (High Quality)
- **Context First**: Always provide the current file path and relevant DTOs/Entities when asking for changes.
- **Spec Focus**: If a field is missing, ask the AI to update the Swagger/OpenAPI decorators FIRST.
- **No Placeholders**: Explicitly tell the AI: "No placeholders. Implement full logic following multi-tenancy rules."
- **Review Requirement**: Ask the AI to explain logic decisions and security implications (RBAC, Multi-tenancy).

## Tech Stack
- Framework: NestJS
- Database: PostgreSQL with TypeORM
- API Documentation: Swagger/OpenAPI
- Validation: class-validator
- SDD: github/spec-kit
