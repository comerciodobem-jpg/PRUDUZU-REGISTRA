---
title: "Prompt de Handoff para Agentes de IA"
aliases:
  - AI Handoff
  - Handoff Produzir Registra
type: ai-handoff
status: active
project: Produzir Registra
created: 2026-09-22
updated: 2026-09-22
tags:
  - produzir-registra
  - documentacao/handoff
  - agentes-ia
related:
  - "[[00-START-HERE]]"
  - "[[01-MASTER-SPEC]]"
  - "[[07-ACCEPTANCE-CRITERIA]]"
  - "[[08-DECISION-LOG]]"
---

# 09 — Prompt de Handoff para outro Agente de IA

> [!abstract] Navegação
> [[00-START-HERE|Início]] · [[08-DECISION-LOG|Anterior: Decisões]] · [[10-CONVERSATION-KNOWLEDGE-MAP|Próximo: Mapa Semântico]]
>
> **Leitura obrigatória:** [[01-MASTER-SPEC|Especificação]] · [[07-ACCEPTANCE-CRITERIA|Aceitação]] · [[08-DECISION-LOG|Decisões]]

Você está trabalhando no projeto **Produzir Registra**, pertencente ao ecossistema **Óris 360**.

Antes de propor ou implementar qualquer coisa:

1. leia as instruções `AGENTS.md`, quando existirem no repositório;
2. comece pelo [[00-START-HERE|índice desta base]] e percorra os documentos relacionados;
3. leia o [[08-DECISION-LOG|Decision Log]] com atenção;
4. trate itens em “Questões abertas” como realmente abertos;
5. não ressuscite decisões antigas substituídas.

## Intenção

O sistema deve permitir que cada funcionário registre rapidamente o que produziu, preservando produtividade individual e rastreabilidade, sem permitir que erros individuais alterem diretamente o estoque oficial.

A solução é uma arquitetura em duas etapas:

```
DECLARAÇÃO DO COLABORADOR
→ AGUARDANDO CONFERÊNCIA
→ CONFERÊNCIA AUTORIZADA
→ MOVIMENTO OFICIAL DE ESTOQUE
```

## Experiência do colaborador

```
Produziu fisicamente
→ escaneou código de barras
→ produto identificado
→ informou quantidade
→ registrou
```

Não crie ordem de produção obrigatória.

## Experiência do gestor

```
abre Conferir
→ vê registros consolidados
→ abre composição individual
→ informa/confirma quantidade física
→ sistema calcula divergência
→ aprova
→ estoque recebe quantidade aprovada
```

## Áreas

Colaborador:
- Registrar;
- Produzido;
- Nosso Resultado.

Gestor:
- as mesmas;
- Conferir.

## Regras inegociáveis

- branco, azul e cinza como identidade;
- scanner como entrada principal;
- autoria vem da sessão;
- registro não altera estoque;
- conferência altera estoque;
- declarado nunca é sobrescrito;
- divergência é preservada;
- necessidade não bloqueia produção livre;
- meta não existe por padrão;
- sem ranking público;
- sem estoque reservado;
- saldo oficial não negativo;
- idempotência em ações críticas;
- offline deve ser recuperável.

## Antes de codificar

Mapeie:
- stack real do repositório;
- autenticação;
- banco;
- APIs existentes;
- padrões de UI;
- multiempresa;
- permissões;
- estoque;
- produtos;
- ficha técnica.

Não invente nomes de tabela/endpoint como fatos existentes. Os nomes deste documento são sugestões de domínio.

## Critério de sucesso

Um funcionário da produção deve conseguir aprender o fluxo sem treinamento formal.

Um gestor deve conseguir responder:
- quem registrou;
- quanto declarou;
- quanto foi conferido;
- quanto entrou no estoque;
- onde houve divergência;
- qual necessidade está aberta;
- quanto falta.

## Proibição sem nova aprovação

Não implemente:
- PCP completo;
- ordem obrigatória;
- início/fim obrigatório;
- ranking;
- autoaprovação;
- edição silenciosa;
- custos/preços no app operacional.

Use [[07-ACCEPTANCE-CRITERIA|Critérios de Aceitação]] como contrato de testes.
