# ANTIGRAVITY - odonto-front

## Coding Standards
- Use TypeScript for all frontend development.
- Follow Next.js App Router best practices.
- Implement **Spec-Driven Development (SDD)**: All UI components and data fetching must be driven by the API specifications.
- **Workflow**:
    1. Sync with backend spec using `npx kubb`.
    2. Use generated Zod schemas for form validation.
    3. Use generated TanStack Query hooks for all data fetching.
    4. Never create manual types for API responses; always use the generated ones.
- **Testing Standards**:
    - **Component Testing**: Use Vitest/React Testing Library for complex UI logic.
    - **No Logic in Components**: Move complex logic to hooks or utility functions for easier testing.
    - **Integration**: Verify generated hooks against the current `openapi.json`.

## AI Prompt Guidelines (High Quality)
- **Component Driven**: When requesting UI, specify: "Using shadcn/ui and following the App Router pattern."
- **Hook Reference**: Instead of asking for a fetch, say: "Use the Kubb-generated hook `useGet...` found in `@/generated/hooks`."
- **Strict Validation**: Always tell the AI: "Include form validation using the Zod schema generated from the spec."
- **Atomic Design**: Request components to be broken down: "Separate the form logic into a sub-component with specific Props definition."
- Use **TanStack Query** for data fetching and state management.
- Use **Zod** for schema validation.
- Document all features in the `docs/use-cases.md` file.

## Tech Stack
- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- Data Fetching: TanStack Query (React Query)
- Validation: Zod
- SDD: Kubb + github/spec-kit
