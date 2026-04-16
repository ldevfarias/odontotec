# PLAN: Dynamic Appointment Creation

Este plano descreve a implementação da criação dinâmica de agendamentos na nova tela de `/agendamentos`, integrando um modal de formulário com validações em tempo real e busca de pacientes.

## 🔴 CRITICAL RULES

- **No Purple**: Seguir o design system (sem tons de roxo/violeta).
- **UX Premium**: Micro-animações no modal, feedback de carregamento e estados claros de erro.
- **Clean Code**: Evitar `any`, usar tipagem do Kubb sempre que possível.

## Overview

A funcionalidade permitirá que usuários (Admins ou Dentistas) criem agendamentos diretamente na tela de calendário. O formulário será inteligente, adaptando-se ao papel do usuário logado e garantindo que não haja conflitos de horários.

## Success Criteria

- [ ] Botão "Novo Agendamento" funcional na tela `/agendamentos`.
- [ ] Modal com formulário completo (Paciente buscador, Dentista, Data, Hora, Duração).
- [ ] Seleção de pacientes com busca (searchable select/combobox).
- [ ] Dentistas logados não veem o campo de seleção de dentista (ID automático no payload).
- [ ] Dropdown de duração com opções fixas e positivas.
- [ ] Validação de conflito de horário disparada ao selecionar data/hora/dentista/duração.
- [ ] Feedback visual claro (Toast) após criação.

## Tech Stack

- **Frontend**: Next.js, Shadcn UI (Dialog, Form, Popover, Command), React Hook Form, Zod.
- **Backend**: NestJS, TypeORM, PostgreSQL.
- **API**: Hooks gerados pelo Kubb para consumo.

## File Structure

```
apps/odonto-front/src/
  ├── components/appointments/
  │     └── AppointmentModal.tsx [NEW]
  └── app/(app)/agendamentos/
        └── page.tsx [MODIFY]
apps/odonto-api/src/
  └── modules/appointments/
        ├── appointments.controller.ts [MODIFY]
        └── appointments.service.ts [MODIFY]
```

## Task Breakdown

### Phase 1: API Enhancements (Backend)

| Task ID    | Name                                                               | Agent                | Skills         | Priority | Dependencies |
| :--------- | :----------------------------------------------------------------- | :------------------- | :------------- | :------- | :----------- |
| B1         | Implementar endpoint de verificação de disponibilidade             | `backend-specialist` | `api-patterns` | P0       | -            |
| **INPUT**  | `dentistId`, `date`, `duration`                                    |
| **OUTPUT** | `GET /appointments/check-availability` -> `{ available: boolean }` |
| **VERIFY** | Testar via Swagger ou cURL com horários conflitantes conhecidos.   |

### Phase 2: Form & UI Foundation (Frontend)

| Task ID    | Name                                                           | Agent                 | Skills                          | Priority | Dependencies |
| :--------- | :------------------------------------------------------------- | :-------------------- | :------------------------------ | :------- | :----------- |
| F1         | Criar `AppointmentModal` e Schema Zod                          | `frontend-specialist` | `frontend-design`, `clean-code` | P1       | B1           |
| **INPUT**  | Requisitos do usuário (dropdowns, busca de paciente)           |
| **OUTPUT** | Componente `AppointmentModal.tsx` com formulário base.         |
| **VERIFY** | Abrir o modal manualmente e verificar renderização dos campos. |

| Task ID    | Name                                                    | Agent                 | Skills            | Priority | Dependencies |
| :--------- | :------------------------------------------------------ | :-------------------- | :---------------- | :------- | :----------- |
| F2         | Implementar Busca de Pacientes (Combobox)               | `frontend-specialist` | `frontend-design` | P1       | F1           |
| **INPUT**  | Hook `usePatientsControllerFindAll`                     |
| **OUTPUT** | Dropdown de pacientes com filtro de busca textual.      |
| **VERIFY** | Digitar nome de um paciente e ver se aparece no filtro. |

| Task ID    | Name                                               | Agent                 | Skills       | Priority | Dependencies |
| :--------- | :------------------------------------------------- | :-------------------- | :----------- | :------- | :----------- |
| F3         | Lógica de Role-Based UI (Dentista vs Admin)        | `frontend-specialist` | `clean-code` | P2       | F1           |
| **INPUT**  | `useAuth` user role                                |
| **OUTPUT** | Omitir campo de dentista se role for `DENTIST`.    |
| **VERIFY** | Logar como dentista e confirmar que o campo sumiu. |

### Phase 3: Integration & UX

| Task ID    | Name                                                          | Agent                 | Skills                  | Priority | Dependencies |
| :--------- | :------------------------------------------------------------ | :-------------------- | :---------------------- | :------- | :----------- |
| F4         | Integrar Validação de Disponibilidade Real-time               | `frontend-specialist` | `performance-profiling` | P2       | B1, F1       |
| **INPUT**  | Debounced check no form                                       |
| **OUTPUT** | Erro visual no formulário se houver conflito detectado.       |
| **VERIFY** | Tentar agendar no mesmo horário de um existente e ver o erro. |

| Task ID    | Name                                                                 | Agent                 | Skills       | Priority | Dependencies |
| :--------- | :------------------------------------------------------------------- | :-------------------- | :----------- | :------- | :----------- |
| F5         | Finalização e Refresh do Calendário                                  | `frontend-specialist` | `clean-code` | P2       | F4           |
| **INPUT**  | `mutate` do create appointment                                       |
| **OUTPUT** | Fechar modal e invalidar queries de agendamentos no sucesso.         |
| **VERIFY** | Criar agendamento e ver ele aparecer instantaneamente no calendário. |

## Phase X: Verification

- [ ] Executar `npm run build` no frontend.
- [ ] Rodar `security_scan.py` na API.
- [ ] Validar UX com `ux_audit.py`.
- [ ] Testar fluxo completo: Criar agendamento -> Verificar conflito -> Sucesso/Erro.

---

**[OK] Plan created: docs/PLAN-appointment-creation.md**
