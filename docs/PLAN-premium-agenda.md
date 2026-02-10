# PLAN: Agenda Premium (Visão Semanal e Grade Nativa)

Implementar um componente de agenda de alto desempenho com grade horária visual, suportando visão semanal (Seg-Sáb), filtros por profissional e slots de 45 minutos.

## 🎯 Success Criteria
- [ ] Visualização de grade horária (Timeline) de 07:00 às 21:00.
- [ ] Visão semanal omitindo o domingo.
- [ ] Filtro por dentista com alternância entre "Clínica" (Todos) e "Individual".
- [ ] Renderização performática de múltiplos agendamentos no grid.
- [ ] Registro/Edição de agendamentos via clique nos slots.

## 💻 Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS (CSS Grid).
- **Libraries**: `date-fns` para manipulação de datas, `lucide-react` para ícones.
- **Backend Integration**: Reproveitamento do `AppointmentsController` e hooks gerados.

## 📂 Proposed File Structure
- `apps/odonto-front/src/app/dashboard/agenda/page.tsx`: Componente principal (Refatoração).
- `apps/odonto-front/src/components/agenda/ScheduleGrid.tsx`: O novo componente de grade. (NEW)
- `apps/odonto-front/src/components/agenda/AppointmentCard.tsx`: Card visual posicionado na grade. (NEW)

## 📝 Task Breakdown

### Phase 1: Foundation & Data Flow
- **Task ID**: `agenda-01`
- **Name**: Refactor Agenda State & Professional Filter
- **Agent**: `frontend-specialist`
- **Skills**: `clean-code`, `react-best-practices`
- **INPUT**: `agenda/page.tsx` atual.
- **OUTPUT**: Estado centralizado (`selectedDentistId`, `viewDate`, `viewType`) e componente de Select para profissionais.
- **VERIFY**: O seletor de dentista deve listar os profissionais e atualizar o estado local.

### Phase 2: UI Implementation (The Grid)
- **Task ID**: `agenda-02`
- **Name**: Implement CSS Grid Schedule Layout
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`, `clean-code`
- **INPUT**: Definições (07-21h, 45min slots).
- **OUTPUT**: Componente `ScheduleGrid.tsx` com colunas (dias) e linhas (horários).
- **VERIFY**: Visualização de Segunda a Sábado correta no desktop e tablet.

### Phase 3: Logic & Positioning
- **Task ID**: `agenda-03`
- **Name**: Appointment Positioning Logic
- **Agent**: `frontend-specialist`
- **Skills**: `clean-code`
- **INPUT**: Dados do backend (timestamp + duration).
- **OUTPUT**: Cálculo de `grid-row-start` e `grid-row-end` baseado no horário.
- **VERIFY**: Agendamentos devem aparecer na posição correta da grade conforme o horário de início e duração.

### Phase 4: Interactions (MVP)
- **Task ID**: `agenda-04`
- **Name**: Slot Click to Create/Edit
- **Agent**: `frontend-specialist`
- **Skills**: `react-best-practices`
- **INPUT**: `AppointmentDialog` existente.
- **OUTPUT**: Trigger de abertura do dialog ao clicar em slots vazios ou agendamentos existentes.
- **VERIFY**: Clicar em 09:00 deve pré-preencher o formulário com a data e hora selecionadas.

## ✅ Phase X: Verification
- [ ] Validar design contra "Purple Ban" e regras de estética premium.
- [ ] Executar `python .agent/skills/frontend-design/scripts/ux_audit.py .`
- [ ] Testar performance com >20 agendamentos na visão semanal.
- [ ] Verificar responsividade em telas menores.
