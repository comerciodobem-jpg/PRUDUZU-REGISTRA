---
title: "Decision Log — Produzir Registra"
aliases:
  - Decisões do Produzir Registra
  - Registro de decisões
type: decision-log
status: active
project: Produzir Registra
source_of_truth: true
created: 2026-09-22
updated: 2026-09-22
tags:
  - produzir-registra
  - documentacao/decisoes
related:
  - "[[01-MASTER-SPEC]]"
  - "[[10-CONVERSATION-KNOWLEDGE-MAP]]"
  - "[[11-SOURCE-TRACEABILITY]]"
  - "[[2026-09-22-produzir-registra-design]]"
---

# 08 — Decision Log

> [!important] Precedência e navegação
> Quando houver conflito, a decisão atual mais recente deste documento prevalece. [[00-START-HERE|Início]] · [[07-ACCEPTANCE-CRITERIA|Anterior: Aceitação]] · [[09-AI-HANDOFF-PROMPT|Próximo: Handoff]]
>
> **Relacionados:** [[01-MASTER-SPEC|Especificação]] · [[10-CONVERSATION-KNOWLEDGE-MAP|Mapa Semântico]] · [[11-SOURCE-TRACEABILITY|Fontes]]

Este arquivo registra a evolução das decisões para impedir que um agente implemente uma ideia antiga que foi substituída.

## D-001 — Produção não exige ordem prévia
**Status:** ATUAL / APROVADA

### Ideia anterior
Havia uma proposta de escolher produto, informar quantidade planejada e iniciar produção.

### Decisão atual
A rotina normal é produção livre. O funcionário produz primeiro e registra depois.

### Razão
Evitar burocracia e respeitar o funcionamento real da fábrica.

---

## D-002 — Scanner como entrada principal
**Status:** ATUAL / APROVADA

Produto é identificado por código de barras.

Fluxo:
`scan → quantidade → registrar`.

---

## D-003 — Registro individual é obrigatório para rastreabilidade
**Status:** ATUAL / APROVADA

A intenção é saber o que cada funcionário produziu.

O autor é o usuário logado.

---

## D-004 — Registro não movimenta estoque diretamente
**Status:** ATUAL / APROVADA

Essa decisão substitui a ideia anterior de dar entrada imediatamente no estoque ao registrar.

Nova regra:
- funcionário declara;
- gestor confere;
- estoque recebe o conferido.

---

## D-005 — Um único app, perfis diferentes
**Status:** ATUAL / APROVADA

Não criar app separado de conferência.

A permissão do usuário determina se a aba `Conferir` existe.

---

## D-006 — Conferência consolidada por produto
**Status:** ATUAL / APROVADA

O gestor pode ver total por produto e composição por funcionário.

Objetivo: não redigitar produção.

---

## D-007 — Preservar declarado, conferido e estoque
**Status:** ATUAL / APROVADA

Exemplo:
- declarado 1.500;
- conferido 1.490;
- estoque +1.490.

Nenhum desses números deve apagar o outro.

---

## D-008 — Necessidade de produção coexistindo com liberdade
**Status:** ATUAL / APROVADA

Necessidade não é ordem obrigatória.

Exemplo real de uso conceitual: pedido grande exigindo 4.500 unidades de um produto.

---

## D-009 — Abatimento automático de necessidade
**Status:** ATUAL / APROVADA

Quando registro pertence inequivocamente ao produto de uma necessidade, o sistema relaciona automaticamente.

A regra final de como tratar duas necessidades simultâneas do mesmo produto ainda precisa ser explicitada.

---

## D-010 — Urgente
**Status:** ATUAL / APROVADA

Existe conceito de urgência para furar a rotina normal.

O botão/contador deve chamar atenção sem poluir o app.

---

## D-011 — Três áreas do operador
**Status:** ATUAL / APROVADA

- Registrar;
- Produzido;
- Nosso Resultado.

A ideia anterior de chamar a primeira área “Produzir” foi ajustada porque o app registra depois da produção física.

---

## D-012 — Produzido vs Nosso Resultado
**Status:** ATUAL / APROVADA

Produzido:
- o que já foi feito;
- lista;
- totais simples;
- gráfico semanal.

Nosso Resultado:
- como a equipe está indo;
- evolução;
- necessidade/meta quando existir.

---

## D-013 — Meta não é obrigatória
**Status:** ATUAL / APROVADA

Não inventar meta semanal.

Meta aparece somente quando houver objetivo real.

---

## D-014 — Visual branco, azul e cinza
**Status:** ATUAL / APROVADA

Verde/vermelho/amarelo somente como semântica.

---

## D-015 — Comunicação motivacional
**Status:** ATUAL / APROVADA

Frases mudam ao longo da semana e do dia.

Slogan conceitual:
**Você produz. Você registra. A gente cresce junto.**

---

## D-016 — Sem ranking público
**Status:** ATUAL / APROVADA

Produtividade individual existe para gestão/rastreabilidade.

Não gamificar expondo competição entre funcionários.

---

## D-017 — Estoque central, sem estoque reservado
**Status:** HERDADA DO ÓRIS 360 / APROVADA

Produção conversa com estoque central.

---

## D-018 — Saldo não fica negativo
**Status:** HERDADA DO ÓRIS 360 / APROVADA

Insuficiência é registrada como exceção.

---

## D-019 — Histórico operacional enxuto
**Status:** APROVADA POR ANALOGIA AO PADRÃO DOS APPS ÓRIS 360

Operador consulta; auditoria pesada fica no Óris 360.

---

## Questões ainda abertas

### O-001 — Duas necessidades simultâneas para o mesmo produto
Possibilidades:
- FIFO;
- prioridade;
- prazo;
- associação manual administrativa;
- rateio.

Não decidir silenciosamente.

### O-002 — Janela exata de conferência
Pode ser:
- por turno;
- por dia;
- sob demanda;
- por lote físico.

Ainda não existe decisão final explícita.

### O-003 — Lote/validade
Foi sugerido como evolução de rastreabilidade, mas não foi explicitamente aprovado como obrigatório para o MVP atual do Produzir Registra.

### O-004 — Regra rígida de segregação de função
Foi recomendado que registrante e aprovador não sejam a mesma identidade. A política final por empresa ainda pode precisar configuração.

### O-005 — Primeiro login / autenticação exata
Ainda não foi detalhado no mesmo nível do Sistema de Ponto.

### O-006 — Forma exata de consolidar divergência entre vários operadores
O total divergente é conhecido; atribuir diferença individual automaticamente não foi aprovado e não deve ser feito.
