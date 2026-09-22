---
title: "Domínio, Entidades e Dados"
aliases:
  - Modelo de domínio
  - Entidades do Produzir Registra
type: domain-model
status: consolidated
project: Produzir Registra
created: 2026-09-22
updated: 2026-09-22
tags:
  - produzir-registra
  - documentacao/dominio
related:
  - "[[01-MASTER-SPEC]]"
  - "[[04-FLOWS-AND-BUSINESS-RULES]]"
  - "[[05-ORIS360-INTEGRATION]]"
  - "[[06-OFFLINE-SECURITY-AUDIT]]"
---

# 03 — Domínio, Entidades e Dados

> [!abstract] Navegação
> [[00-START-HERE|Início]] · [[02-UX-AND-SCREENS|Anterior: UX]] · [[04-FLOWS-AND-BUSINESS-RULES|Próximo: Fluxos]]
>
> **Relacionados:** [[01-MASTER-SPEC|Especificação]] · [[05-ORIS360-INTEGRATION|Integração]] · [[06-OFFLINE-SECURITY-AUDIT|Confiabilidade]]

## 1. Visão

O domínio deve distinguir claramente:
- produto;
- produção declarada;
- produção conferida;
- movimento de estoque;
- necessidade;
- divergência;
- usuário;
- ficha técnica.

---

## 2. Entidades

### Product

Campos conceituais:
- id;
- company_id;
- sku;
- name;
- barcode;
- image_url;
- control_unit;
- package_conversion;
- technical_sheet_id;
- active.

### ProductionRecord

Representa a declaração individual.

Campos:
- id;
- company_id;
- user_id;
- employee_id;
- product_id;
- declared_quantity;
- unit;
- recorded_at;
- local_recorded_at;
- sync_status;
- review_status;
- source_device_id;
- production_need_id opcional;
- idempotency_key;
- created_at.

### ProductionReview

Representa a conferência.

Campos:
- id;
- company_id;
- product_id;
- period_start;
- period_end;
- declared_total;
- confirmed_quantity;
- difference_quantity;
- reviewer_user_id;
- reviewed_at;
- status;
- notes;
- idempotency_key.

### ProductionReviewItem

Relaciona review e registros individuais.

Campos:
- review_id;
- production_record_id;
- declared_quantity;
- included_quantity.

### ProductionNeed

Campos:
- id;
- company_id;
- product_id;
- target_quantity;
- confirmed_progress_quantity;
- registered_progress_quantity opcional para visão provisória;
- remaining_quantity;
- priority;
- status;
- created_by;
- created_at;
- due_at opcional;
- note;
- completed_at.

### StockMovement

Campos conceituais:
- id;
- company_id;
- product_or_material_id;
- type;
- quantity;
- reference_type;
- reference_id;
- created_at;
- created_by_system_or_user.

### TechnicalSheet

Composição padrão de um produto.

### TechnicalSheetItem

- material_id;
- quantity_per_base;
- unit.

### AuditEvent

- actor;
- action;
- entity_type;
- entity_id;
- before;
- after;
- reason;
- timestamp.

---

## 3. Estados de ProductionRecord

### sync_status

- `LOCAL_PENDING`
- `SYNCED`
- `SYNC_FAILED`

### review_status

- `PENDING_REVIEW`
- `CONFIRMED`
- `DIVERGENT`
- `CORRECTED`

---

## 4. Estados de ProductionNeed

- `OPEN`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

Prioridade:
- `NORMAL`
- `ATTENTION`
- `URGENT`

---

## 5. Regras de integridade

1. `ProductionRecord.user_id` vem da sessão.
2. Operador não troca autoria.
3. Registro confirmado nunca é apagado silenciosamente.
4. Estoque só recebe evento definitivo de produção por uma conferência autorizada.
5. `declared_quantity` é imutável após aprovação; correções usam evento adicional.
6. Necessidade mantém alvo original.
7. Progresso confirmado da necessidade deriva de produção validada.
8. Toda ação crítica usa `idempotency_key`.
9. Dados são sempre isolados por `company_id`.

---

## 6. Quantidades

Separar semanticamente:

- **declarada** — operador;
- **confirmada** — conferente;
- **movimentada** — estoque;
- **alvo** — necessidade;
- **saldo** — alvo menos confirmado;
- **consumo calculado** — ficha técnica;
- **consumo efetivado** — movimento de matéria-prima.

---

## 7. Divergência

Divergência não é erro que precisa ser escondido.

É um fato auditável.

Exemplo:

```
declared_total = 1500
confirmed_quantity = 1490
difference_quantity = -10
```

O sistema preserva todos.

---

## 8. Conversão de embalagem

Exemplo de objeto:

```json
{
  "base_unit": "un",
  "packaging": [
    { "name": "caixa", "multiplier": 24 }
  ]
}
```

Entrada:
- 10 caixas;
- 8 un.

Resultado:
- 248 un.

---

## 9. Relação com estoque de componentes

Após aprovação:
1. gera entrada do produto acabado;
2. carrega ficha técnica vigente;
3. calcula consumo proporcional;
4. aplica baixa em matérias-primas/insumos;
5. registra insuficiências;
6. nunca deixa saldo oficial negativo.

A implementação deve registrar qual versão de ficha técnica foi usada na consolidação para auditoria futura.

---

## 10. Multiempresa

Como Óris 360 é um sistema que atende contas/empresas, todas as entidades operacionais devem respeitar isolamento por empresa.

Nenhum registro de uma empresa pode aparecer em outra.
