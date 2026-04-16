# AI-Augmented Software Development Life Cycle (AI-SDLC)

Este documento define o padrão de ouro para o desenvolvimento de software neste repositório, otimizado para colaboração entre IA e humanos, com foco em rigor técnico e qualidade de engenharia.

## 1. Princípios Fundamentais

1.  **Test-Driven Development (TDD) Primeiro:** Nenhum código de produção deve ser escrito antes de um teste que falhe.
2.  **Spec-Driven Development (SDD):** O contrato da API (OpenAPI/Swagger) é a única fonte da verdade.
3.  **Engenharia de Software de Alto Nível:** Aplicação rigorosa de SOLID, Clean Code e padrões de design.
4.  **Multi-tenancy Nativo:** Isolamento de dados (`clinicId`) deve ser verificado em nível de teste e implementação.
5.  **Self-Correction Loops:** Revisão proativa de segurança (OWASP) e performance antes da entrega.

## 2. O Ciclo de Desenvolvimento (Red-Green-Refactor + Review)

Toda tarefa deve seguir este fluxo estrito:

### Fase 1: Pesquisa e Contrato (SDD)

1.  **Análise de Requisitos:** Entender o impacto no sistema e no multi-tenancy.
2.  **Definição de Contrato:** Se houver mudança na API, atualizar DTOs e Swagger no Backend primeiro.
3.  **Sync:** Executar `npm run generate:openapi` (API) e `npm run kubb` (Front) para garantir que os tipos e hooks existam.

### Fase 2: Implementação com TDD (Red)

1.  **Criação do Teste:** Escrever um teste de unidade ou E2E que descreva o comportamento desejado.
2.  **Execução do Teste:** Rodar o teste e confirmar que ele **falha** (Red).
    - API: `npm run test -- <path_to_test>`
    - Front: `npm run test` (se aplicável via Vitest)

### Fase 3: Implementação (Green)

1.  **Código Mínimo:** Escrever o código estritamente necessário para fazer o teste passar.
2.  **Passagem no Teste:** Rodar o teste e confirmar que ele **passa** (Green).

### Fase 4: Refatoração (Refactor)

1.  **Limpeza:** Melhorar o código sem alterar o comportamento (remover duplicação, melhorar nomes, extrair métodos).
2.  **Validação:** Garantir que todos os testes continuam passando.

### Fase 5: Self-Correction Loop (Review)

1.  **Segurança (OWASP):** Revisar o código em busca de vulnerabilidades (SQL Injection, XSS, falhas de autenticação, IDOR no `clinicId`).
2.  **Performance:** Identificar gargalos, queries N+1 no TypeORM ou re-renders desnecessários no React.
3.  **Melhoria:** Aplicar correções baseadas na própria revisão antes de entregar a tarefa.

## 3. Padrões de Engenharia

### Backend (NestJS)

- **Services:** Devem conter a lógica de negócio pura e validações de tenant.
- **Controllers:** Devem ser magros, focados em orquestração e documentação Swagger.
- **TypeORM:** Sempre usar o repositório filtrado por `clinicId`.
- **Validação:** Uso rigoroso de `class-validator` nos DTOs.

### Frontend (Next.js)

- **Hooks Gerados:** Proibido criar tipos de API manuais. Usar `src/generated/hooks/`.
- **Componentes:** Separar lógica de apresentação (UI) de lógica de estado (Hooks).
- **Zod:** Validação de formulários deve vir dos schemas gerados pelo Kubb.

## 4. Checklist de "Done" para a IA

- [ ] Contrato Swagger atualizado e exportado.
- [ ] Hooks do Kubb sincronizados no frontend.
- [ ] Teste automatizado (Unitário ou E2E) criado e passando.
- [ ] Validação de Tenant (`clinicId`) implementada e testada.
- [ ] **Self-Correction:** Código revisado para Segurança (OWASP) e Performance.
- [ ] Código refatorado seguindo SOLID e Clean Code.
- [ ] Sem placeholders ou lógica incompleta.
