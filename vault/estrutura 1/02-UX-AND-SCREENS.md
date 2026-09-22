---
title: "UX, Telas e Experiência"
aliases:
  - UX do Produzir Registra
  - Telas do Produzir Registra
type: ux-specification
status: consolidated
project: Produzir Registra
created: 2026-09-22
updated: 2026-09-22
tags:
  - produzir-registra
  - documentacao/ux
related:
  - "[[01-MASTER-SPEC]]"
  - "[[04-FLOWS-AND-BUSINESS-RULES]]"
  - "[[07-ACCEPTANCE-CRITERIA]]"
  - "[[10-CONVERSATION-KNOWLEDGE-MAP]]"
---

# 02 — UX, Telas e Experiência

> [!abstract] Navegação
> [[00-START-HERE|Início]] · [[01-MASTER-SPEC|Anterior: Especificação]] · [[03-DOMAIN-AND-DATA|Próximo: Domínio]]
>
> **Relacionados:** [[04-FLOWS-AND-BUSINESS-RULES|Fluxos]] · [[07-ACCEPTANCE-CRITERIA|Aceitação]] · [[10-CONVERSATION-KNOWLEDGE-MAP|Intenção original]]

## 1. Princípio de UX

O usuário está trabalhando na fábrica.

A interface deve competir o mínimo possível com o trabalho físico.

A pergunta para cada elemento é:

> “Isso ajuda o funcionário a registrar mais rápido ou só adiciona informação?”

Se não ajudar a operação, deve ficar no Óris 360 administrativo, não no app.

---

## 2. Tela de entrada / identidade

### Objetivos

- transmitir identidade do aplicativo;
- motivar;
- permitir acesso rápido;
- destacar urgências quando existirem.

Elementos possíveis:
- frase motivacional dinâmica;
- logomarca Produzir Registra;
- slogan;
- botão **Fazer meu login**;
- botão/indicador de **Urgente** quando houver necessidade crítica.

Mensagens variam por:
- segunda-feira manhã;
- segunda-feira tarde;
- terça-feira;
- etc.

A lógica pode ser configurável por calendário/período.

---

## 3. Navegação principal

### Colaborador

```
[ REGISTRAR ] [ PRODUZIDO ] [ NOSSO RESULTADO ]
```

### Gestor

```
[ REGISTRAR ] [ PRODUZIDO ] [ NOSSO RESULTADO ] [ CONFERIR ]
```

Em mobile estreito, `Conferir` pode ir para navegação inferior ou menu secundário, desde que continue fácil e evidente ao gestor.

---

## 4. Registrar

### Hero principal

```
Registrar produção
Aponte a câmera para o código de barras do produto.
```

Grande botão/área:
- câmera;
- feedback visual de leitura;
- opção `Digitar código`.

Após leitura:

```
[foto]
Colorau
100 g
Código: CL100

Quantidade produzida
[       ]

[ REGISTRAR PRODUÇÃO ]
```

### Feedback

Sucesso:
`Produção registrada com sucesso.`

Aguardando servidor:
`Registro salvo. Aguardando sincronização.`

Erro de código:
`Produto não encontrado.`

---

## 5. Últimos registrados por você

Abaixo do scanner, cards compactos:

```
Colorau 100 g
240 un.
16:42
Aguardando conferência
```

Benefícios:
- reduz medo de “será que registrou?”;
- ajuda a identificar erro recente;
- reforça autoria.

---

## 6. Produzido

### Cabeçalho

`Olha o que nossa equipe já fez!`

Subtexto opcional:
`Cada produção é um passo para um resultado maior.`

### KPIs simples

- Hoje;
- Semana;
- Mês.

### Gráfico

Barra semanal:
- Seg;
- Ter;
- Qua;
- Qui;
- Sex;
- Sáb.

### Lista

Filtros:
- Hoje;
- Semana;
- Mês.

Card:
- foto;
- produto;
- quantidade;
- horário;
- status.

---

## 7. Nosso Resultado

Objetivo emocional:
- mostrar progresso;
- dar sentido ao trabalho;
- celebrar conquista coletiva.

Conteúdo:
- total do período;
- evolução;
- comparação anterior;
- necessidades ativas;
- progresso quando houver.

### Quando não há meta

Não exibir bloco vazio “Meta”.

### Quando há meta

Exemplo:

```
Meta / necessidade
4.500 Colorau

3.100 produzidos
1.400 faltando
69%
```

---

## 8. Urgente

Urgência deve ser impossível de ignorar, mas não deve dominar toda a interface.

Exemplo:

```
🚨 URGENTE (2)
Produções que precisam de atenção imediata.
```

Ao abrir:
- produto;
- quantidade necessária;
- saldo;
- origem/observação quando permitido;
- progresso.

---

## 9. Conferir

### Lista geral

Pode mostrar:
- período;
- produto;
- total declarado;
- quantidade de registros;
- status;
- diferença quando já conferido.

### Detalhe

```
Colorau 100 g
Registrado pela equipe: 1.500

João — 500
Maria — 700
Carlos — 300

Quantidade física conferida
[ 1490 ]

Divergência: -10

[ CONFIRMAR PRODUÇÃO ]
```

O gestor deve conseguir conferir em lote, mas sempre abrir a composição individual.

---

## 10. Mensagens motivacionais

A mensagem não pode impedir a operação.

Posições adequadas:
- topo;
- banner fino;
- rodapé;
- estado vazio;
- confirmação de sucesso.

Evitar:
- modal obrigatório;
- animação longa;
- texto demais;
- gamificação competitiva.

---

## 11. Acessibilidade operacional

- botões grandes;
- contraste forte;
- fonte legível;
- alvo de toque confortável;
- feedback sonoro/háptico opcional no scanner;
- não depender só de cor;
- números importantes em fonte maior;
- câmera com orientação clara.

---

## 12. Identidade visual

### Base

- branco: fundo;
- azul escuro: títulos;
- azul médio: ações;
- azul claro: superfícies;
- cinza claro: cards;
- cinza: secundários.

### Semântica

- verde: confirmado/sucesso;
- amarelo/laranja: atenção;
- vermelho: urgente/divergência;
- preto: texto primário.

---

## 13. Estados vazios

### Nenhum registro hoje

`Ainda não há produção registrada hoje.`

### Nenhuma necessidade

`Nenhuma necessidade especial no momento. Continue a produção normalmente.`

### Nada para conferir

`Tudo conferido por aqui.`

### Offline

`Sem internet. Seus registros serão sincronizados quando a conexão voltar.`

---

## 14. Regra de limpeza

Não mostrar no app operacional:
- custo;
- preço;
- margem;
- DRE;
- faturamento;
- fornecedores;
- financeiro;
- configurações complexas;
- auditoria técnica detalhada.

Essas informações pertencem à plataforma administrativa.
