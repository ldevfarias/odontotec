# PLAN: Odontogram & Finance Synchronization

Este plano detalha a implementação de um histórico global de procedimentos no Odontograma e a expansão da aba Financeira para incluir a gestão de orçamentos (Planos de Tratamento).

## 🎯 Escopo

1.  **Odontograma**: 
    - Histórico passa a exibir todos os procedimentos do paciente por padrão (agrupados por dente).
    - Clicar em um item do histórico seleciona automaticamente o dente correspondente no Odontograma.
2.  **Financeiro**:
    - Introdução de sub-abas: "Pagamentos" e "Orçamentos".
    - Gestão de Status dos Orçamentos (DRAFT -> APPROVED, etc.) diretamente na aba financeira.
    - Sincronização de valores e itens.

## 🛠️ Alterações Propostas

### 🟢 Frontend

#### [MODIFY] `OdontogramTab.tsx`
- Alterar `filteredProcedures` para não retornar vazio quando `selectedTooth` for null.
- Implementar agrupamento visual por dente no Histórico quando nenhum estiver selecionado.
- Adicionar evento de clique nos cards do histórico para chamar `handleToothSelect(toothNumber)`.

#### [MODIFY] `PaymentsTab.tsx`
- Implementar componente `Tabs` (Shadcn) para separar "Pagamentos" e "Orçamentos".
- Criar `TreatmentPlansList` dentro da sub-aba de Orçamentos.
- Adicionar botões de ação para alterar o status do orçamento (ex: "Aprovar", "Finalizar").

### 🔵 Backend

*Nenhuma alteração estrutural necessária, pois as rotas de PATCH para TreatmentPlans já existem. Apenas garantir que os métodos de serviço reflitam as mudanças de status corretamente.*

## 🏁 Plano de Verificação

### Testes Manuais
- [ ] Abrir prontuário e verificar se o histórico do odontograma mostra itens de múltiplos dentes.
- [ ] Clicar em um procedimento do dente 16 no histórico e verificar se o dente 16 é destacado no gráfico.
- [ ] Ir para a aba Financeiro e alternar entre as sub-abas.
- [ ] Alterar o status de um orçamento de "DRAFT" para "APPROVED" e verificar se a mudança persiste após recarregar.

## 👥 Atribuições
- **Antigravity**: Implementação UI/UX e lógica de seleção.
- **Frontend Specialist**: Refatoração das sub-abas financeiras.
- **Backend Specialist**: Auditoria de regras de transição de status (opcional).
