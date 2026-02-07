# PLAN: Patient Birthdate Persistence

Este plano visa garantir que a data de nascimento do paciente seja corretamente persistida no banco de dados e refletida na API, permitindo que o frontend utilize essa informação conforme necessário.

## User Review Required

> [!NOTE]
> O campo `birthDate` já existe nos DTOs de criação e atualização no backend e no frontend, mas está ausente na entidade `Patient` do TypeORM. Este plano foca em sincronizar a entidade com os DTOs.

## Proposed Changes

### Backend: `odonto-api`

---

#### [MODIFY] [patient.entity.ts](file:///c:/Users/luka/.gemini/antigravity/playground/workspace/apps/odonto-api/src/modules/patients/entities/patient.entity.ts)

Adicionar a coluna `birthDate` à entidade `Patient`.

```typescript
@Column({ name: 'birth_date', type: 'date', nullable: true })
birthDate: Date;
```

#### [VERIFY] [patients.service.ts](file:///c:/Users/luka/.gemini/antigravity/playground/workspace/apps/odonto-api/src/modules/patients/patients.service.ts)

O serviço já utiliza `repository.create(dto)`, portanto a nova coluna será mapeada automaticamente se o nome no DTO corresponder.

---

### Frontend: `odonto-front`

---

#### [VERIFY] Patient Dialog / Forms
Garantir que os campos de formulário estão enviando o campo `birthDate` no formato ISO string (yyyy-mm-dd), que é o esperado pelo TypeORM para colunas do tipo `date`.

#### [VERIFY] [PatientDetailPage](file:///c:/Users/luka/.gemini/antigravity/playground/workspace/apps/odonto-front/src/app/dashboard/patients/%5Bid%5D/page.tsx)
Verificar se o componente já exibe a data corretamente (as linhas 85-88 sugerem que ele já tenta ler `patient.birthDate`).

---

## Verification Plan

### Automated Tests
- N/A (Manual validation preferred for schema sync check).

### Manual Verification
1. **Criação**: Criar um novo paciente preenchendo a data de nascimento e verificar se o valor persiste após o recarregamento.
2. **Edição**: Alterar a data de nascimento de um paciente existente.
3. **API**: Verificar o retorno da rota `GET /patients/:id` para confirmar o campo `birthDate`.
4. **Banco de Dados**: (Opcional) Verificar se a coluna `birth_date` foi criada na tabela `patients`.
