# PLAN: Anamnese Refactor

## 🎯 Visão Geral

Refatorar o módulo de anamnese para um modelo mais robusto, estruturado e visualmente informativo, permitindo o acompanhamento do histórico do paciente e alertas críticos de saúde.

## 🚀 Critérios de Sucesso

- [ ] Formulário abrangente com suporte a: Sim/Não, Texto, Seleção Única e Múltipla Escolha.
- [ ] Histórico de versões: possibilidade de ver anamneses realizadas em diferentes datas.
- [ ] Sistema de Alertas: Alertas visuais automáticos (ex: Alergias) no topo do prontuário.
- [ ] Backend validando a estrutura do JSON enviado.

## 🛠️ Tech Stack

- **Backend:** NestJS, TypeORM (JSONB), Zod Validation.
- **Frontend:** React Hook Form, Zod, Shadcn UI (Accordion, RadioGroup, Checkbox).

## 📂 Arquitetura de Dados (JSONB)

O campo `data` da entidade `Anamnesis` seguirá a seguinte estrutura:

```json
{
  "answers": [
    { "questionId": "hypertension", "value": true, "details": "Controlada com medicação" },
    { "questionId": "allergies", "value": ["penicilina", "iodo"], "details": "" }
  ]
}
```

## 📋 Plano de Ação

### Fase 1: Backend Foundation (P0)

- **Task 1: DTO e Validação:** Criar esquema Zod no backend para validar a estrutura dinâmica das respostas.
- **Task 2: Serviço de Alertas:** Implementar lógica no `PatientsService` que varre a anamnese mais recente em busca de campos marcados como `alert: true`.

### Fase 2: Frontend UI/UX (P1)

- **Task 3: Componente de Formulário:** Criar `AnamnesisForm.tsx` que renderiza as perguntas baseadas em um template centralizado.
- **Task 4: Histórico:** Criar visualização de lista com datas para acessar anamneses passadas.
- **Task 5: Alertas Visuais:** Implementar componente de `Banner` ou `Badges` de alerta no header do paciente.

### Fase X: Verificação

- [ ] Criar nova anamnese com campos de alerta.
- [ ] Validar se o alerta aparece no dashboard do paciente.
- [ ] Verificar se anamneses antigas continuam acessíveis.
