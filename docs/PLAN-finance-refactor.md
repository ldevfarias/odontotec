# PLAN: Refinamento do Módulo Financeiro

Este plano detalha as melhorias de reatividade, identidade visual e segurança (confirmações) no gerenciamento de orçamentos e pagamentos.

## 🎯 Escopo

1.  **Reatividade em Tempo Real**: Garantir que qualquer mudança de status (Aprovar/Cancelar) seja refletida instantaneamente em toda a aplicação via invalidação global de cache.
2.  **Identidade Visual (Badges)**:
    - `APPROVED`: Cor verde (sucesso).
    - `COMPLETED`: Cor Indigo (finalizado/concluído).
3.  **Segurança e UX (Shadcn AlertDialog)**:
    - Substituir `confirm()` por `AlertDialog` para ações críticas.
    - Implementar fluxo de "Cancelar Orçamento" com diálogo de confirmação.
4.  **Consistência de Ações**: Restringir ações na aba financeira apenas a aprovação e cancelamento (conforme diretrizes).

## 🛠️ Alterações Propostas

### 🟢 Frontend

#### [MODIFY] `PaymentsTab.tsx`

- **Importações**: Adicionar `AlertDialog` e componentes relacionados do Shadcn.
- **Invalidação de Cache**: Expandir o `onSuccess` do `updateTreatmentPlan` para invalidar múltiplas queries:
  - `TreatmentPlansControllerFindAll`
  - `PaymentsControllerFindAllByPatient`
  - `PatientsControllerFindOne`
- **Logica de Cancelamento**: Implementar função `handleCancelPlan` que exibe o `AlertDialog` antes de disparar o `updateTreatmentPlan` com status `CANCELLED`.
- **Estilização de Badges**: Atualizar lógica de cores no componente `Badge` para suportar Indigo no status `COMPLETED`.

#### [MODIFY] `OdontogramTab.tsx` (Opcional)

- Garantir que a exibição dos itens de orçamento no histórico também reflita as cores atualizadas para consistência visual.

## 🏁 Plano de Verificação

### Testes Manuais

- [ ] **Aprovação Instantânea**: Aprovar um orçamento e verificar se o saldo "Total Pago/Aberto" atualiza imediatamente sem refresh.
- [ ] **Cancelamento com Shadcn**: Tentar cancelar um orçamento e confirmar se o `AlertDialog` aparece e se o status muda corretamente após confirmação.
- [ ] **Cores dos Badges**: Validar se o badge `COMPLETED` exibe a cor Indigo corretamente.
- [ ] **Sincronia Odontograma**: Verificar se ao aprovar no Financeiro, o item no Odontograma também atualiza o status visualmente.

## 👥 Atribuições

- **Antigravity**: Orquestração de cache e UI.
- **Frontend Specialist**: Implementação dos Diálogos de Confirmação.
