# ANTIGRAVITY - odonto-front

## AI-SDLC Compliance

**Este projeto segue estritamente o [AI-SDLC.md](../../AI-SDLC.md).**

## Coding Standards

- Use TypeScript for all frontend development.
- Follow Next.js App Router best practices.
- **Spec-Driven Development (SDD)**: All UI components and data fetching must be driven by API specifications.
- **TDD (Test-Driven Development)**:
  1. Criar teste de componente/hook antes da UI complexa.
  2. Usar Vitest e React Testing Library.

## Workflow

1.  **Sync:** `npx kubb` para atualizar hooks, tipos e schemas.
2.  **Test:** Create a Vitest test for the new hook or complex UI logic.
3.  **Implement:** Build the component using generated hooks and Zod schemas.
4.  **Verify:** `npm run test` e validação visual.

## UI & State Standards

- **Hook-Only Fetching**: Proibido `fetch` manual. Usar `src/generated/hooks/`.
- **Validation**: Sempre usar os schemas Zod gerados do Kubb.
- **Componentes**: Isolar lógica de negócios em hooks customizados para facilitar o teste.
- **Shadcn/UI**: Padrão para componentes de UI.

## AI Prompt Guidelines (High Quality)

- **TDD Hook**: "Crie um teste no Vitest para validar o comportamento deste novo hook de UI."
- **Kubb Hook**: "Use o hook gerado pelo Kubb `useGet...` para buscar os dados."
- **Zod Validation**: "Garanta que o formulário use o schema Zod gerado pelo Kubb para validação."

## Tech Stack

- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- Data Fetching: TanStack Query (Hooks do Kubb)
- Validation: Zod (Schemas do Kubb)
- Testing: Vitest + React Testing Library
