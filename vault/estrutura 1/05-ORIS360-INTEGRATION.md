---
title: "Integração com Óris 360"
aliases:
  - Integração Óris 360
  - Ecossistema Óris 360
type: integration-specification
status: consolidated
project: Produzir Registra
created: 2026-09-22
updated: 2026-09-22
tags:
  - produzir-registra
  - documentacao/integracao
related:
  - "[[03-DOMAIN-AND-DATA]]"
  - "[[04-FLOWS-AND-BUSINESS-RULES]]"
  - "[[06-OFFLINE-SECURITY-AUDIT]]"
  - "[[11-SOURCE-TRACEABILITY]]"
---

# 05 — Integração com Óris 360

> [!abstract] Navegação
> [[00-START-HERE|Início]] · [[04-FLOWS-AND-BUSINESS-RULES|Anterior: Fluxos]] · [[06-OFFLINE-SECURITY-AUDIT|Próximo: Confiabilidade]]
>
> **Relacionados:** [[03-DOMAIN-AND-DATA|Domínio]] · [[07-ACCEPTANCE-CRITERIA|Aceitação]] · [[11-SOURCE-TRACEABILITY|Fontes]]

## 1. Posição no ecossistema

```
Óris 360
└── Produção
    ├── Produzir Registra
    ├── Produtos
    ├── Ficha Técnica
    ├── Matérias-Primas e Insumos
    ├── Estoque
    └── Indicadores
```

O Produzir Registra é a interface operacional móvel. O Óris 360 continua sendo a plataforma administrativa.

---

## 2. Produtos

O app consulta:
- produto;
- foto;
- código;
- código de barras;
- unidade;
- conversões de embalagem;
- status ativo;
- ficha técnica relacionada.

O produto é a âncora da leitura por scanner.

---

## 3. Ficha Técnica

No Óris 360, a ficha técnica pertence ao produto.

Exemplos de itens:
- garrafa;
- tampa;
- rótulo;
- matéria-prima em kg.

Na consolidação aprovada:
- calcular consumo proporcional;
- guardar versão da ficha usada;
- gerar baixa oficial dos componentes.

---

## 4. Matérias-Primas e Insumos

Tela administrativa do Óris 360 mantém:
- busca;
- categorias;
- imagem;
- unidade;
- saldo.

Unidades já discutidas:
- kg para pós;
- unidade para garrafa, tampa, rótulo;
- demais unidades conforme cadastro.

Produzir Registra não edita cadastro de insumo.

---

## 5. Estoque

### Produto acabado

Entrada definitiva só depois de conferência.

### Componentes

Baixa baseada na ficha técnica.

### Sem estoque reservado

Decisão preservada:
- não criar reserva paralela;
- usar estoque central;
- nunca permitir saldo negativo.

---

## 6. Indicadores

O app gera eventos que alimentam:
- produzido hoje;
- produzido na semana;
- produzido no mês;
- evolução diária;
- total por colaborador;
- total por produto;
- divergências;
- confiabilidade do registro;
- necessidades;
- cumprimento de necessidade;
- alertas de matéria-prima;
- produção versus objetivo quando houver objetivo.

Indicadores avançados ficam na plataforma do gestor.

---

## 7. Colaboradores e usuários

A sessão determina:
- empresa;
- usuário;
- colaborador;
- permissões.

Permissão adicional:
- `production.review` ou equivalente.

A pessoa autorizada vê `Conferir`.

---

## 8. Necessidades

A criação de necessidade pode ficar na plataforma administrativa do Óris 360.

Campos:
- produto;
- quantidade;
- prioridade;
- prazo opcional;
- observação;
- responsável pela criação.

O app somente consome e acompanha.

---

## 9. Eventos recomendados

Eventos de domínio possíveis:

- `production.recorded`
- `production.record.synced`
- `production.reviewed`
- `production.divergence_detected`
- `production.need.created`
- `production.need.progressed`
- `production.need.completed`
- `stock.finished_goods_increased`
- `stock.material_consumed`
- `stock.material_shortage_detected`
- `production.record.corrected`

Esses nomes são recomendação de arquitetura, não implementação existente.

---

## 10. Custo e preço

O Óris 360 possui conceitos de custo médio e preço sugerido.

O Produzir Registra **não deve mostrar isso ao operador**.

Se a produção confirmada atualizar custo, essa lógica ocorre na camada administrativa.

O preço de venda continua manual; não deve ser alterado automaticamente por uma produção.

---

## 11. Relação com outros apps

### Separa Confere

Referência de filosofia:
- app operacional focado;
- histórico somente leitura;
- ações críticas protegidas;
- servidor como autoridade em ações sensíveis.

Não copiar regras de Pedido que não pertencem à produção.

### Entrega Registra

Também trabalha com rastreabilidade operacional, porém após faturamento.

Produzir Registra atua antes, no chão da fábrica.

### Sistema de Ponto

Pode compartilhar identidade do colaborador, mas não misturar fluxos.

---

## 12. API mínima conceitual

Possíveis contratos:

- buscar produto por barcode;
- criar production record;
- listar records do usuário;
- listar resultados agregados;
- listar necessidades;
- listar pendentes de conferência;
- criar production review;
- obter composição da conferência;
- sincronizar lote offline;
- criar correção auditada.

Detalhes exatos dependem da stack final do repositório.
