# Overview
Refatoração da tela de Pacientes para torná-la mais limpa, focada e com melhor performance, exibindo apenas dados essenciais na listagem e simplificando as ações para "Visualizar" e "Remover".

## Project Type
WEB

## Success Criteria
- Nova tabela implementada exibindo apenas dados principais definidos.
- Ações na tabela reduzidas exclusivamente para "Visualizar" e "Remover".
- Tela otimizada para melhor performance estrutural (evitando re-renderizações desnecessárias do grid ao interagir com outras partes da UI).

## Tech Stack
- Frontend: Next.js, React, Tailwind CSS, Shadcn UI
- Data Fetching: TanStack Query (@tanstack/react-query)

## File Structure
- `apps/odonto-front/src/app/dashboard/patients/page.tsx` (modificação principal)

## Task Breakdown

### Task 1: Refatorar Definição de Colunas da Tabela
- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`, `react-best-practices`
- **Priority:** P1
- **Dependencies:** None
- **INPUT:** `page.tsx` atual.
- **OUTPUT:** Colunas da tabela reduzidas para renderizar estritamente os dados principais (ex: Nome e Telefone).
- **VERIFY:** Checar visualmente se as colunas supérfluas (como Data de Nascimento etc.) foram removidas da visualização principal em favor de uma navegação mais limpa.

### Task 2: Atualizar Botões de Ação (Visualizar e Remover)
- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`
- **Priority:** P1
- **Dependencies:** Task 1
- **INPUT:** Célula de ações na definição das colunas de `page.tsx`.
- **OUTPUT:** 
  1. Botão "Visualizar" visível que redireciona para o detalhe do paciente (`/dashboard/patients/{id}`).
  2. Botão "Remover" implementando o atual componente `DeletePatientDialog`.
- **VERIFY:** Testar os dois cliques: a visualização deve navegar para a tela do paciente, e a remoção deve abrir o modal de exclusão correto.

### Task 3: Otimização de Performance no Render
- **Agent:** `frontend-specialist`
- **Skills:** `react-best-practices`, `performance-profiling`
- **Priority:** P2
- **Dependencies:** Task 2
- **INPUT:** Componentes React e hooks no `page.tsx` e `DataTable`.
- **OUTPUT:** Extração/memorização da declaração de colunas via `useMemo`. Separação de escopo de estados (como o controle de modal de criação) para que a modificação de inputs do form não interfira na renderização da lista grande.
- **VERIFY:** Utilizar o React DevTools Profiler simulando digitação no modal de criação e garantir que as linhas do `DataTable` não acusem re-render desnecessário.

## Phase X: Verification Checklist
- [x] A listagem exibe estritamente os dados acordados.
- [x] O botão "Visualizar" leva à rota de detalhes do paciente.
- [x] O botão de deleção ("Remover") abre o diálogo e finaliza a ação corretamente.
- [x] A performance está sólida e isenta de múltiplos renders list-wide.
