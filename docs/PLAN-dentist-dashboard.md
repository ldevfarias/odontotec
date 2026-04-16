# PLAN-dentist-dashboard.md

> Dashboard personalizado para o perfil **DENTIST**

---

## 🎯 Objetivo

Quando o usuário logado tem `role === 'DENTIST'`, o dashboard exibe uma visão focada na agenda pessoal do dentista — não nos dados globais da clínica.

---

## 🧠 Design Commitment (Frontend Specialist)

- **Topologia:** Layout assimétrico `65/35` — timeline à esquerda (dominante), painel lateral direito com KPIs + pacientes recentes
- **Geometria:** Sharp edges (0-2px radius) para elementos de dados; bordas sólidas sem glassmorphism
- **Paleta:** Slate escuro + Teal accent (sem azul padrão, sem roxo) — evoca foco clínico e confiança
- **Motion:** Entrada escalonada (stagger) dos cards; linha de "agora" animada na timeline
- **Anti-clichê:** Sem bento grid, sem split 50/50, sem mesh gradient

---

## 📐 Arquitetura de Componentes

```
dashboard/page.tsx
├── (role === 'DENTIST') → <DentistDashboard />
└── (outros roles)      → <AdminDashboard /> (atual)

dashboard/components/dentist/
├── DentistDashboard.tsx       ← orquestrador (novo)
├── DentistKPIStrip.tsx        ← faixa de 3 KPIs horizontais
├── DentistTimeline.tsx        ← timeline do dia (componente principal)
└── DentistRecentPatients.tsx  ← lista de pacientes recentes
```

---

## 📊 KPIs do Dentista (`DentistKPIStrip`)

| KPI            | Fonte de dados                                       | Ícone           |
| -------------- | ---------------------------------------------------- | --------------- |
| Pacientes hoje | `appointments` filtrados por `dentistId` + data hoje | `CalendarCheck` |
| Confirmados    | `appointments` com `status === 'CONFIRMED'`          | `CheckCircle2`  |
| Pendentes      | `appointments` com `status === 'SCHEDULED'`          | `Clock`         |

**Fonte:** `useAppointmentsControllerFindAll({ date: today, dentistId: user.id })`

---

## 🕐 Timeline do Dia (`DentistTimeline`)

Inspirado na referência enviada (layout de disponibilidade com horários à esquerda e cards de agendamento à direita).

### Estrutura visual

```
08:00 ─────────────────────────────────────
      [ João Silva · Limpeza · 30min       ]  ← SCHEDULED (indigo)
09:00 ─────────────────────────────────────
      [ Maria Costa · Canal · 60min        ]  ← CONFIRMED (teal)
      ── AGORA ──────────────────────────── ← linha vermelha animada
10:00 ─────────────────────────────────────
      [ Pedro Alves · Extração · 45min     ]  ← SCHEDULED (indigo)
```

### Comportamento

- Scroll automático para o horário atual
- Cards clicáveis → abre `AppointmentPopover`
- Cores por status (igual ao `ScheduleGrid` existente)
- Horário de 08:00 às 18:00

**Fonte:** mesmo hook `useAppointmentsControllerFindAll({ date: today, dentistId: user.id })`

---

## 👥 Pacientes Recentes (`DentistRecentPatients`)

Lista dos últimos 5 pacientes do dentista (baseado nos agendamentos mais recentes).

### Estrutura visual

```
[ Avatar ] João Silva          → botão "Ver Ficha"
           Última consulta: hoje, 09:00
[ Avatar ] Maria Costa         → botão "Ver Ficha"
           Última consulta: ontem, 14:00
```

**Fonte:** `useAppointmentsControllerFindAll({ dentistId: user.id })` → extrair pacientes únicos mais recentes

---

## 🗂️ Layout Geral (`DentistDashboard`)

```
┌─────────────────────────────────────────────────────┐
│  Bom dia, Dr. [Nome]!  ·  Hoje, 18 de fevereiro     │
│  [KPI: Pacientes Hoje] [KPI: Confirmados] [KPI: Pendentes] │
├──────────────────────────────┬──────────────────────┤
│                              │                      │
│   TIMELINE DO DIA (65%)      │  PACIENTES           │
│                              │  RECENTES (35%)      │
│   08:00 ──────────────────   │                      │
│   [ João Silva · Limpeza ]   │  [ Avatar ] João     │
│   09:00 ──────────────────   │  [ Avatar ] Maria    │
│   [ Maria Costa · Canal  ]   │  [ Avatar ] Pedro    │
│   ── AGORA ────────────────  │  [ Avatar ] Ana      │
│   10:00 ──────────────────   │  [ Avatar ] Carlos   │
│                              │                      │
│                              │  [Ver todos →]       │
└──────────────────────────────┴──────────────────────┘
```

---

## 📁 Arquivos a Criar/Modificar

### [MODIFY] `dashboard/page.tsx`

- Importar `useAuth`
- Condicional: `isDentist ? <DentistDashboard /> : <AdminDashboard />`
- Mover JSX atual para `AdminDashboard` (componente local)

### [NEW] `dashboard/components/dentist/DentistDashboard.tsx`

- Orquestrador: busca dados, distribui para sub-componentes
- Hook: `useAppointmentsControllerFindAll({ date: today, dentistId: user.id })`
- Hook: `usePatientsControllerFindAll()` (para dados dos pacientes)

### [NEW] `dashboard/components/dentist/DentistKPIStrip.tsx`

- 3 cards KPI em linha horizontal
- Dados calculados a partir dos appointments do dia

### [NEW] `dashboard/components/dentist/DentistTimeline.tsx`

- Timeline vertical de 08:00-18:00
- Linha "Agora" animada
- Cards de agendamento clicáveis com `AppointmentPopover`

### [NEW] `dashboard/components/dentist/DentistRecentPatients.tsx`

- Lista dos últimos 5 pacientes únicos
- Link para ficha do paciente (`/dashboard/patients/[id]`)

---

## ✅ Critérios de Verificação

- [ ] Dentista logado vê `DentistDashboard`, não o dashboard admin
- [ ] KPIs mostram apenas os agendamentos do dentista logado para hoje
- [ ] Timeline exibe agendamentos em ordem cronológica com linha "Agora"
- [ ] Pacientes recentes listam os 5 mais recentes com link para ficha
- [ ] Outros roles (ADMIN, SIMPLE) continuam vendo o dashboard atual
- [ ] Loading states com Skeleton em todos os componentes
- [ ] Responsivo: mobile empilha timeline + pacientes verticalmente

---

## 🚀 Ordem de Implementação

1. `DentistKPIStrip.tsx` — mais simples, sem dependências
2. `DentistRecentPatients.tsx` — lista simples
3. `DentistTimeline.tsx` — componente principal (mais complexo)
4. `DentistDashboard.tsx` — orquestrador
5. `dashboard/page.tsx` — integração final com condicional de role
