# 🚀 OdontoTec — Roadmap Pós-Lançamento

Este arquivo documenta as funcionalidades e melhorias identificadas como necessárias para as próximas versões, garantindo que nenhum item de qualidade ou UX seja esquecido após o deploy inicial.

## 🛠️ Infraestrutura & Segurança

- [ ] **Configuração Dinâmica de CORS:** Substituir o valor fixo no `main.ts` pela variável de ambiente `FRONTEND_URL`.
- [ ] **Auditoria de Secrets:** Garantir que o `.env.example` cubra todas as chaves (Stripe, R2, Email, JWT Refresh).

## 📈 Melhorias em Pacientes

- [ ] **KPIs Reais:** Substituir os cálculos mockados (10% e 15%) por lógica baseada nas datas reais de criação (`createdAt`) e agendamento (`nextAppointmentDate`) retornadas pela API.
- [ ] **Bulk Messaging:** Implementar a funcionalidade real de envio de mensagem ou definir o canal (WhatsApp/Email/SMS) e remover o toast de placeholder.

## 📅 Melhorias em Agendamentos

- [ ] **Categorias Dinâmicas:** Vincular as cores e nomes de categorias do `Calendar` aos procedimentos reais ou tipos de agendamento salvos na base.
- [ ] **Filtros de Profissional:** Melhorar a reatividade dos filtros de profissional no calendário.

## 🎨 Interface & UX

- [ ] **Prefixos Profissionais em Massa:** Garantir que o campo de "Nome Profissional" considere os prefixos (Dr., Dra.) de forma consistente em todo o sistema.
- [ ] **Tratamento de Erros Global:** Refinar as mensagens do `GlobalExceptionFilter` para que sejam mais amigáveis ao usuário final no frontend.

---

> Para implementar qualquer um dos itens acima, utilize o comando `/enhance` ou `@project-planner`.
