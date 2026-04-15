# PLAN: Patients Layout Refactor

## 1. Overview
Refactor the **Patients list layout** (`apps/odonto-front/src/components/patients`) to follow a modern, premium aesthetic that deviates from generic AI templates, strictly adhering to the styles, colors, and design tokens present in `DESIGN_SYSTEM.md`. The layout includes a data table with specific columns and bulk actions. KPI cards were removed from the current scope.

## 2. Project Type
**WEB** (Next.js/React) - Primary Agent: `@frontend-specialist`

## 3. Success Criteria
- [ ] (Obsoleto no escopo atual) The page implements the 3 required KPIs: Pacientes para Lembrar (Reminders), Total de Pacientes, and Novos Pacientes.
- [ ] The data table shows specific columns: Nome, Telefone, Último Procedimento (Data), Próxima Consulta (Data).
- [ ] A bulk action for "Enviar Mensagem/Lembrete" appears when multiple rows are selected.
- [ ] UI strictly follows `DESIGN_SYSTEM.md` without any standard template clichés.
- [ ] A polished, premium aesthetic with proper typography, spacing (`spacing-*`), and colors.

## 4. Tech Stack
- Frontend: Next.js (app directory assumed or pages), React
- Design: TailwindCSS + `DESIGN_SYSTEM.md` utilities (`card-surface`, `badge-*`, `body-small`, etc.)
- Components: shadcn/ui components customized with design system tokens.

## 5. File Structure
Location: `apps/odonto-front/src/components/patients`
- `PatientsLayout.tsx` (Main wrapper)
- `PatientsTable.tsx` (Main data table)
- `PatientsBulkActions.tsx` (Floating action bar for selected items)

## 6. Task Breakdown

| Task ID | Task Name | Agent & Skill | Priority | Dependencies | INPUT → OUTPUT → VERIFY |
|---------|-----------|---------------|----------|--------------|-------------------------|
| T1 | **Design System Review** | `@frontend-specialist`, `frontend-design` | P0 | None | Read `DESIGN_SYSTEM.md` → Output styles to use → Verify understanding of typography/colors |
| T2 | **KPI Component** | `@frontend-specialist` | P1 | T1 | Obsoleto no escopo atual (KPI removido da tela) |
| T3 | **Table Component** | `@frontend-specialist` | P1 | T1 | Input column definitions → Output `PatientsTable.tsx` → Verify it shows correct headers and mock data |
| T4 | **Bulk Actions** | `@frontend-specialist` | P1 | T3 | Input selected state from table → Output floating `PatientsBulkActions.tsx` → Verify it shows "Enviar Mensagem" |
| T5 | **Main Layout Integration** | `@frontend-specialist` | P1 | T3, T4 | Assemble components → Output updated patients page/layout → Verify spacing and responsiveness |

## 7. Phase X Verification
- [ ] `npm run lint` passes
- [ ] Visual QA check (Color contrast, padding matching token scale)
- [ ] No purple hex codes used (per design guidelines).
- [ ] Layout matches the intended modern aesthetic.
