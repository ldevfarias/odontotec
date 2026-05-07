# Seed Demo Data — Design Spec

**Date:** 2026-04-20  
**Branch:** feat/odonto-grama  
**Status:** Approved

## Goal

Ampliar o `apps/odonto-api/src/seed.ts` existente com uma função `seedDemoData` que popula a clínica padrão com ~60 pacientes e todos os dados clínicos relacionados, cobrindo todas as tabs do sistema: Registros, Agendamentos, Pagamentos, Anamnese, Odontograma, Orçamentos e Planos de Tratamento.

## Approach

Opção A: **inline no `seed.ts`**, chamada ao final do `bootstrap()` existente, após seed base de clínica/usuários/procedimentos.

## Estrutura

### Função principal

```
seedDemoData(clinic: Clinic, dentist: User, dataSource: DataSource): Promise<void>
```

Chamada em `bootstrap()` logo após `createUserWithMembership` do dentista. Recebe as instâncias já criadas para evitar re-queries.

### Pacientes — 60 registros

- Nomes brasileiros realistas (masculinos e femininos)
- `birthDate`: variação de 18 a 80 anos
- `document`: CPF fictício no formato `XXX.XXX.XXX-XX`
- `email`, `phone`, `address` fictícios mas formatados
- Todos com `clinicId` da clínica padrão
- Idempotente: skip se paciente com mesmo nome+clinicId já existe

### Por paciente — dados relacionados

Todos idempotentes via contagem: se paciente já tem registros do tipo, pula.

#### Procedures (2–4 por paciente)
- Tipos: Restauração, Extração, Canal, Limpeza, Aplicação de Flúor, Clareamento
- `date`: entre -180 e -1 dias (passado)
- `cost`: entre 80 e 500
- `toothNumber`: dentes adultos (11–48), aleatório
- `toothFaces`: null ou uma das faces (M, D, V, L, O)

#### Anamnesis (1 por paciente)
- `complaint`: uma de ~8 queixas principais rotacionadas
- `data` JSONB com campos: `medications`, `allergies`, `medicalHistory`, `smoker`, `pregnant`

#### Payments (2–3 por paciente)
- `amount`: entre 100 e 600
- `method`: PIX, CREDIT_CARD, DEBIT_CARD, CASH (aleatório)
- `status`: 60% COMPLETED, 25% PENDING, 15% CANCELLED
- `date`: entre -180 e -1 dias

#### Appointments (2–5 por paciente)
- `date`: distribuídos entre -180 dias e +28 dias (passado e futuro)
- `duration`: 30 ou 60 minutos
- `status`:
  - Datas passadas: COMPLETED (60%), CANCELLED (25%), ABSENT (15%)
  - Datas futuras: SCHEDULED (70%), CONFIRMED (30%)
- `cancelledBy` e `cancellationReason` preenchidos quando CANCELLED
- `dentistId`: dentista padrão do seed

> **Atenção:** `Appointment` tem unique constraint `(clinicId, dentistId, date)`. O seed deve garantir horários distintos usando offsets incrementais por paciente para evitar conflito.

#### ToothObservations (1–2 por paciente)
- `toothNumber`: dentes 11–48
- `toothFaces`: null ou face aleatória
- `description`: uma de ~6 descrições clínicas (cárie, fratura, desgaste, etc.)
- `date`: entre -180 e -1 dias

#### Budget (1 por paciente)
- `status`: PENDING (40%), APPROVED (45%), REJECTED (15%)
- `notes`: texto curto opcional
- **BudgetItems** (2–3 por budget):
  - `clinicProcedureId`: um dos 5 procedimentos padrão criados no seed base
  - `quantity`: 1 ou 2
  - `unitPrice`: `baseValue` do ClinicProcedure
  - `subtotal`: quantity × unitPrice
- `total`: soma dos subtotals

#### TreatmentPlan (1 por paciente)
- `title`: ex. "Plano de Tratamento Completo"
- `status`: DRAFT (30%), APPROVED (50%), COMPLETED (20%)
- `discount`: 0 ou 50
- `dentistId`: dentista padrão
- **TreatmentPlanItems** (2–3 por plano):
  - `description`: nome do procedimento
  - `value`: entre 150 e 500
  - `toothNumber`: dente aleatório
  - `surface`: face aleatória ou null
  - `status`: PLANNED, IN_PROGRESS, COMPLETED
- `totalAmount`: soma dos values menos discount

## Idempotência

Cada bloco verifica se o paciente já possui registros do tipo (`count > 0` → skip). O seed pode ser rodado múltiplas vezes sem duplicar dados.

## Execução

```bash
cd apps/odonto-api
npm run seed
```

Sem alteração no `package.json`.

## Out of scope

- Documentos (`PatientDocument`) — requer upload para R2
- Notificações (`Notification`)
- Dados para a clínica landing/marketing
