---
title: "Rastreabilidade das Fontes e Referências"
aliases:
  - Fontes do Produzir Registra
  - Source Traceability
type: source-traceability
status: active
project: Produzir Registra
created: 2026-09-22
updated: 2026-09-22
tags:
  - produzir-registra
  - documentacao/fontes
  - rastreabilidade
related:
  - "[[00-START-HERE]]"
  - "[[08-DECISION-LOG]]"
  - "[[10-CONVERSATION-KNOWLEDGE-MAP]]"
  - "[[2026-09-22-produzir-registra-design]]"
---

# 11 — Rastreabilidade das Fontes e Referências

> [!abstract] Navegação
> [[00-START-HERE|Início]] · [[10-CONVERSATION-KNOWLEDGE-MAP|Anterior: Mapa Semântico]] · [[2026-09-22-produzir-registra-design|Próximo: Design Consolidado]]
>
> **Relacionados:** [[01-MASTER-SPEC|Especificação]] · [[08-DECISION-LOG|Decisões]] · [[10-CONVERSATION-KNOWLEDGE-MAP|Intenção]]

## Objetivo

Este documento explica de onde veio cada grupo de decisões da base do Produzir Registra.

Ele não substitui os arquivos funcionais. Serve para outro agente saber distinguir:
- referência externa/projeto anterior;
- decisão do usuário;
- proposta exploratória;
- decisão atual consolidada.

---

## 1. PDF — Especificação Mestre do Separa Confere

O PDF **“Especificação Mestre Separa Confere — Óris 360”** foi usado como referência de método de documentação e filosofia operacional.

Elementos reaproveitados como padrão conceitual:
- especificação escrita para eliminar ambiguidades;
- app operacional focado em uma função;
- histórico como consulta;
- uso de servidor como autoridade para ações sensíveis;
- proteção contra toque/requisição duplicada;
- tolerância a perda temporária de internet;
- interface simples;
- separação entre operação no app e administração na plataforma.

Elementos NÃO copiados literalmente para Produzir Registra:
- fila de Pedidos;
- ACEITAR pedido;
- exclusividade de Pedido;
- status de separação;
- finalização de conferência do Pedido;
- cores de envelhecimento por dias;
- regras comerciais do Pedido.

O Produzir Registra possui domínio próprio.

---

## 2. Conversa — identidade e motivação

Decisões surgidas diretamente da conversa:
- usuário do app é o pessoal da produção/fábrica;
- frases motivacionais mudam ao longo da semana e por período do dia;
- comunicação deve valorizar quem produz;
- slogan conceitual: “Você produz. Você registra. A gente cresce junto.”;
- interface não deve parecer administrativa.

---

## 3. Conversa — urgente

A necessidade de um botão/área de urgência surgiu porque:
- a rotina normal pode seguir estoque/experiência da equipe;
- algumas demandas precisam “furar a fila”;
- essas demandas devem ser evidentes para o time.

Daí:
- conceito `URGENTE`;
- contador opcional;
- destaque localizado.

---

## 4. Conversa — três áreas

Foi discutida uma analogia com as três abas do Separa Confere.

A estrutura consolidada evoluiu para:

- Registrar;
- Produzido;
- Nosso Resultado.

A área Conferir aparece somente para gestor/conferente.

---

## 5. Conversa — Produzido

Foi pedido um lugar para:
- ver quantidade feita;
- ver semana;
- ver histórico;
- motivar a equipe.

Daí:
- total Hoje/Semana/Mês;
- gráfico semanal;
- lista de registros.

---

## 6. Conversa — Nosso Resultado

Foi pedido um espaço mais motivacional.

Conceito:
- evolução;
- comparação;
- metas quando existirem;
- resultado coletivo.

Decisão posterior importante:
- **não existe meta fixa obrigatória**.

---

## 7. Conversa — produção livre

Ponto decisivo do projeto.

O usuário explicou que:
- em momentos tranquilos, com estoque cheio, a equipe tem liberdade;
- não existe sempre uma “necessidade”;
- obrigar o funcionário a escolher antes o que vai produzir burocratiza.

Isso substituiu a proposta inicial de uma fila obrigatória de produção.

---

## 8. Conversa — registrar depois de produzir

O usuário explicou o fluxo desejado:
- produção acontece normalmente;
- produto já possui cadastro e código de barras;
- depois a pessoa lê o código;
- informa quantidade;
- registra.

Isso originou o fluxo mestre atual.

---

## 9. Conversa — conflito produtividade x estoque

O usuário identificou o problema:
- cada funcionário registrar é ótimo para saber produtividade;
- mas erro de registro pode bagunçar estoque;
- centralizar tudo em uma pessoa protege estoque, mas perde autoria individual.

A solução consolidada:
- registro individual;
- aprovação/conferência separada;
- movimento de estoque só depois da aprovação.

---

## 10. Conversa — um único app

Foi perguntado se seriam telas diferentes.

Decisão:
- um único Produzir Registra;
- permissões diferentes;
- gestor recebe área adicional de conferência.

---

## 11. Memória de projeto Óris 360 — Produção/Estoque

Contextos relevantes incorporados:
- Produto possui Ficha Técnica;
- Matéria-Prima e Insumos possuem cadastro e saldo;
- custo médio existe no Óris 360;
- preço de venda é manual;
- indicadores de produção fazem parte da visão administrativa;
- produção deve alimentar estoque e custo;
- sistema deve privilegiar dados gerados pelo processo, não planilhas manuais.

Esses pontos estão documentados como integração, não como elementos visíveis ao operador.

---

## 12. Sugestões do assistente incorporadas

Foram incorporadas quando compatíveis com a intenção do usuário:
- preservar quantidade declarada e conferida separadamente;
- idempotência;
- auditoria;
- conversão caixa/fardo;
- indicador gerencial de confiabilidade;
- consolidação por produto para o conferente;
- evitar ranking público;
- manter app limpo.

Onde uma sugestão não foi explicitamente aprovada como requisito obrigatório, ela é marcada como recomendação ou questão aberta.

---

## 13. Material não reproduzido literalmente

A documentação não armazena a conversa bruta palavra por palavra.

Ela armazena:
- decisões;
- intenções;
- exemplos;
- mudanças de direção;
- regras;
- dúvidas abertas;
- relações semânticas.

Isso foi feito para que outro agente consiga raciocinar sobre o projeto sem depender de uma transcrição longa e contraditória.

---

## 14. Regra para novos agentes

Se uma nova conversa trouxer decisão explícita do usuário que contradiga esta base:
1. atualizar o [[08-DECISION-LOG|Decision Log]];
2. marcar a decisão antiga como substituída;
3. atualizar a especificação;
4. manter a razão da mudança;
5. não apagar o histórico conceitual.
