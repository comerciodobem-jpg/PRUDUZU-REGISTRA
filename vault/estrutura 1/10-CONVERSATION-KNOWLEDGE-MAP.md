---
title: "Mapa Semântico da Conversa e da Intenção"
aliases:
  - Mapa de conhecimento
  - Intenção do Produzir Registra
type: knowledge-map
status: consolidated
project: Produzir Registra
created: 2026-09-22
updated: 2026-09-22
tags:
  - produzir-registra
  - conhecimento/mapa
  - documentacao/intencao
related:
  - "[[00-START-HERE]]"
  - "[[01-MASTER-SPEC]]"
  - "[[08-DECISION-LOG]]"
  - "[[11-SOURCE-TRACEABILITY]]"
---

# 10 — Mapa Semântico da Conversa e da Intenção

> [!abstract] Navegação
> [[00-START-HERE|Início]] · [[09-AI-HANDOFF-PROMPT|Anterior: Handoff]] · [[11-SOURCE-TRACEABILITY|Próximo: Fontes]]
>
> **Relacionados:** [[01-MASTER-SPEC|Especificação]] · [[08-DECISION-LOG|Decisões]] · [[2026-09-22-produzir-registra-design|Design Consolidado]]

## 1. Evolução do pensamento

### Etapa A — inspiração no Separa Confere

O projeto começou buscando a mesma disciplina de especificação do Separa Confere:
- poucas abas;
- operação simples;
- histórico;
- indicadores;
- foco no usuário da operação.

O PDF do Separa Confere serviu como referência de **estrutura de especificação**, não como regra de negócio de produção.

### Etapa B — produção como lista de necessidades

Foi explorada a ideia de mostrar uma lista “do que produzir”, com:
- prioridade;
- urgente;
- quantidade sugerida;
- iniciar produção.

Essa visão ajudou a criar a ideia de necessidade/urgência.

### Etapa C — percepção da rotina real

O usuário esclareceu que, quando o estoque está confortável, a equipe possui liberdade para decidir o que produzir.

Isso derrubou a ideia de que toda produção nasce de uma necessidade.

### Etapa D — simplificação radical

O usuário explicou que a pessoa pode produzir normalmente e, no fim, pegar os produtos prontos, ler o código de barras e registrar a quantidade.

Daí surgiu a regra mais importante:

```
não planejar no app;
registrar o realizado.
```

### Etapa E — problema de controle de estoque

Surgiu a preocupação:
- se cada funcionário lança, erros podem bagunçar o estoque;
- se só uma pessoa lança o total, perde-se produtividade individual.

### Etapa F — solução de duas camadas

Foi consolidada a arquitetura:
- cada funcionário registra;
- registro individual não movimenta estoque;
- gestor/conferente valida;
- estoque recebe somente quantidade aprovada.

Essa é a síntese semântica do projeto.

---

## 2. Teia de objetivos

```
simplicidade
   ↘
    adoção pelo operador
       ↘
        qualidade do dado
           ↘
            indicadores úteis

identidade individual
   ↘
    produtividade
       ↘
        rastreabilidade

conferência
   ↘
    estoque confiável
       ↘
        custo / planejamento / compras confiáveis

necessidades
   ↘
    coordenação quando necessário
       ↘
        sem destruir autonomia da rotina normal
```

---

## 3. Tensões que o projeto precisa equilibrar

### Simplicidade vs controle

Resposta:
- operador faz pouco;
- sistema registra muito por trás.

### Autonomia vs prioridade

Resposta:
- produção livre sempre existe;
- necessidade/urgência orienta quando necessário.

### Produtividade individual vs estoque confiável

Resposta:
- declaração individual;
- conferência separada.

### Motivação vs poluição visual

Resposta:
- mensagens curtas;
- resultado coletivo;
- sem ranking.

### Offline vs consistência

Resposta:
- fila local;
- servidor como fonte final;
- idempotência.

---

## 4. Frases e tom aprovados conceitualmente

Frases valorizadas na conversa:
- “Tudo começa nas suas mãos.”
- “Você produz. Você registra. A gente cresce junto.”
- “Quem faz, faz a diferença.”
- “É daqui que o resultado começa.”
- “Pequenos registros, grandes resultados.”
- “Produza com qualidade. Registre com responsabilidade.”

O tom desejado é:
- humano;
- direto;
- motivador;
- sem linguagem corporativa fria;
- sem infantilização.

---

## 5. Vocabulário canônico

Use preferencialmente:

- Produzir Registra;
- Registrar;
- Produzido;
- Nosso Resultado;
- Conferir;
- Necessidade de Produção;
- Urgente;
- Aguardando Conferência;
- Confirmado;
- Divergente;
- quantidade declarada;
- quantidade conferida;
- entrada efetiva no estoque;
- Ficha Técnica;
- Matéria-Prima e Insumo.

Evitar:
- “ordem de produção” como conceito obrigatório;
- “estoque reservado”;
- “meta semanal” como padrão fixo.

---

## 6. Relação com o restante do Óris 360

O Produzir Registra se encaixa em uma visão maior do Óris 360:

```
Produto
→ Ficha Técnica
→ Produção registrada
→ Conferência
→ Estoque
→ Histórico
→ Indicadores
```

A plataforma administrativa continua responsável por:
- cadastros;
- ficha técnica;
- custo;
- preço;
- auditoria;
- indicadores gerenciais;
- ajustes.

O app operacional existe para capturar a realidade com atrito mínimo.

---

## 7. Como interpretar sugestões anteriores

Algumas sugestões anteriores foram exploratórias e não devem ser tratadas como requisitos finais.

Exemplos substituídos:
- “Iniciar produção” obrigatório;
- escolher produto antes de produzir;
- movimentar estoque no momento do registro;
- meta fixa semanal.

Sempre usar o [[08-DECISION-LOG|Decision Log]].

---

## 8. Resultado final desejado

Quando outro agente entender o projeto corretamente, ele deverá conseguir explicar em uma frase:

> **O Produzir Registra é um scanner operacional de produção com autoria individual e conferência separada, criado para registrar a realidade da fábrica sem burocracia e sem comprometer o estoque oficial.**
