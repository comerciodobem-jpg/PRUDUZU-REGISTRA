---
title: "Especificação Mestre — Produzir Registra"
aliases:
  - Especificação Mestre
  - Master Spec
type: specification
status: consolidated
project: Produzir Registra
source_of_truth: true
created: 2026-09-22
updated: 2026-09-22
tags:
  - produzir-registra
  - documentacao/especificacao
related:
  - "[[02-UX-AND-SCREENS]]"
  - "[[03-DOMAIN-AND-DATA]]"
  - "[[04-FLOWS-AND-BUSINESS-RULES]]"
  - "[[07-ACCEPTANCE-CRITERIA]]"
  - "[[08-DECISION-LOG]]"
---

# 01 — Especificação Mestre: Produzir Registra

> [!abstract] Navegação
> [[00-START-HERE|Início]] · [[02-UX-AND-SCREENS|Próximo: UX e Telas]]
>
> **Relacionados:** [[03-DOMAIN-AND-DATA|Domínio]] · [[04-FLOWS-AND-BUSINESS-RULES|Fluxos]] · [[07-ACCEPTANCE-CRITERIA|Aceitação]] · [[08-DECISION-LOG|Decisões]]

## 1. Objetivo

O **Produzir Registra** é o aplicativo operacional de registro de produção do Óris 360.

Sua função é transformar a produção física realizada na fábrica em eventos digitais rastreáveis, sem transformar o trabalho do operador em um processo burocrático.

O aplicativo deve resolver simultaneamente:

1. **identidade operacional** — saber quem produziu;
2. **quantidade declarada** — saber quanto cada pessoa registrou;
3. **confiabilidade de estoque** — impedir que um erro individual altere sozinho o estoque oficial;
4. **rastreabilidade** — manter histórico de quem registrou, quem conferiu e qual quantidade foi efetivada;
5. **indicadores** — transformar registros em informações de produção;
6. **necessidades de produção** — permitir que a gestão indique demandas específicas sem transformar toda a rotina em ordem de fabricação.

---

## 2. Princípio de produto

### 2.1 O app não inicia a produção física

O funcionário não precisa:
- abrir uma ordem;
- escolher antecipadamente o produto;
- reservar matéria-prima;
- iniciar cronômetro;
- declarar que começou;
- declarar que terminou;
- solicitar autorização para produzir.

A fábrica continua operando de acordo com sua rotina real.

O registro vem **depois da execução física**.

### 2.2 Fluxo ideal

```
PRODUZIU
→ ESCANEOU
→ INFORMOU A QUANTIDADE
→ REGISTROU
```

Essa sequência deve ser a referência para qualquer decisão de UX.

---

## 3. Papéis

### 3.1 Colaborador de produção

Responsabilidades:
- produzir fisicamente;
- identificar o produto por código de barras;
- informar a quantidade que produziu;
- registrar sob sua própria identidade;
- acompanhar seus registros;
- consultar resultados que o sistema permitir;
- visualizar necessidades/urgências.

Não pode:
- atribuir sua produção a outra pessoa;
- aprovar a própria produção;
- alterar o estoque oficial diretamente;
- apagar registros aprovados;
- sobrescrever divergências;
- editar registros de outro usuário.

### 3.2 Gestor/Conferente

Além das capacidades normais, recebe permissão para:
- visualizar registros aguardando conferência;
- consolidar por produto;
- abrir composição por colaborador;
- informar ou confirmar quantidade física;
- aprovar;
- marcar divergência;
- efetivar o movimento de estoque;
- consultar trilha de auditoria.

O conferente **não é um redigitador**. O aplicativo deve reaproveitar tudo que os operadores já lançaram.

---

## 4. Navegação

### 4.1 Colaborador

- **Registrar**
- **Produzido**
- **Nosso Resultado**

### 4.2 Gestor/Conferente

- **Registrar**
- **Produzido**
- **Nosso Resultado**
- **Conferir**

A aba `Conferir` só aparece quando a permissão estiver presente.

Pode exibir contador:

```
CONFERIR (12)
```

---

## 5. Registrar

### 5.1 Tela

A tela deve destacar o leitor de código de barras.

Componentes:
- título: **Registrar produção**;
- instrução curta;
- área de câmera/leitor;
- alternativa secundária para digitar código;
- alternativa secundária para buscar produto;
- últimos registros do usuário;
- status de sincronização quando necessário.

### 5.2 Após escanear

Exibir:
- foto do produto;
- nome;
- apresentação;
- código interno;
- unidade;
- campo de quantidade;
- botão **Registrar produção**.

Não perguntar:
- nome do funcionário;
- data;
- hora;
- empresa;
- produto novamente;
- campos já conhecidos pelo cadastro.

### 5.3 Registro

O registro deve conter pelo menos:
- `id`;
- `company_id`;
- `user_id`;
- `employee_id`;
- `product_id`;
- `barcode`;
- `declared_quantity`;
- `unit`;
- `recorded_at`;
- `sync_status`;
- `review_status`;
- `source_device_id` quando aplicável;
- vínculo com necessidade quando houver correspondência inequívoca.

### 5.4 Estado inicial

Todo registro operacional nasce como:

**AGUARDANDO CONFERÊNCIA**

Esse registro já pode alimentar:
- histórico individual;
- produtividade declarada;
- quantidade registrada no dia;
- visão do operador.

Mas **não movimenta definitivamente o estoque**.

---

## 6. Produzido

A aba responde:

> **O que já fizemos?**

### 6.1 Conteúdo

Indicadores rápidos:
- Hoje;
- Semana;
- Mês.

Exemplo:
- Hoje: 380 un.;
- Semana: 1.840 un.;
- Mês: 6.720 un.

### 6.2 Gráfico

Gráfico semanal simples de barras.

Objetivo:
- visualização rápida;
- motivação;
- percepção de evolução.

Não transformar em BI administrativo.

### 6.3 Lista

Mostrar registros com:
- produto;
- foto;
- quantidade;
- hora;
- responsável quando permitido;
- status.

Status:
- Aguardando conferência;
- Confirmado;
- Divergente.

Para o operador, priorizar os próprios registros.

---

## 7. Nosso Resultado

A aba responde:

> **Como estamos indo?**

Pode conter:
- produzido hoje;
- produzido na semana;
- produzido no mês;
- evolução diária;
- comparação com período anterior;
- quantidade de registros;
- total de unidades;
- necessidades ativas;
- progresso das necessidades;
- metas somente quando existirem.

### 7.1 Sem meta

Não inventar meta.

Quando não houver meta cadastrada, mostrar apenas:
- realizado;
- evolução;
- histórico comparativo;
- mensagens motivacionais.

### 7.2 Com meta/necessidade

Quando houver necessidade real, mostrar:
- alvo;
- realizado;
- saldo;
- percentual;
- urgência;
- situação.

---

## 8. Necessidade de Produção

Uma **Necessidade de Produção** é uma demanda gerencial específica.

Exemplo:

```
Produto: Colorau 100 g
Necessidade: 4.500 un.
Registrado: 1.800 un.
Faltam: 2.700 un.
```

Ela não deve bloquear a produção livre.

### 8.1 Abatimento

Quando um registro confirmado/conferido do mesmo produto puder ser associado sem ambiguidade, o sistema atualiza o progresso automaticamente.

O operador não deve ser obrigado a escolher a necessidade manualmente em cada registro.

### 8.2 Urgência

Uma necessidade pode receber prioridade:

**URGENTE**

Visual:
- destaque localizado;
- vermelho somente no selo/faixa;
- contador opcional.

Exemplo:
`URGENTE (2)`

---

## 9. Conferência

### 9.1 Objetivo

Separar:
- o que foi declarado;
- o que foi fisicamente validado;
- o que foi efetivamente movimentado no estoque.

### 9.2 Consolidação

A tela deve permitir visão agrupada por produto.

Exemplo:

```
COLORAU 100 g

Registrado pela equipe: 1.500 un.

João: 500
Maria: 700
Carlos: 300

Quantidade física conferida: [1.490]
Divergência: -10
```

### 9.3 Ação

Botão:
**Confirmar produção**

### 9.4 Estados

- `PENDING_REVIEW` — aguardando;
- `CONFIRMED` — validado sem divergência material;
- `DIVERGENT` — quantidade física diferente da declarada;
- `SYNC_PENDING` — ainda não confirmado pelo servidor;
- `CORRECTED` — caso exista correção posterior auditada.

---

## 10. Estoque

### 10.1 Regra central

**Registro individual não altera estoque oficial.**

### 10.2 Após conferência

Somente a quantidade aprovada gera:
- entrada de produto acabado;
- evento de produção;
- consumo de componentes conforme as regras de ficha técnica;
- atualização de indicadores;
- histórico auditável.

### 10.3 Divergência

Exemplo:

```
Declarado: 1.500
Conferido: 1.490
Movimentado: 1.490
Diferença: -10
```

Nunca sobrescrever `declared_quantity` para fazê-la igual à conferida.

---

## 11. Ficha Técnica e consumo de componentes

O Óris 360 já possui conceito de Ficha Técnica vinculada ao Produto.

Ela pode conter:
- matéria-prima em kg;
- garrafa;
- tampa;
- rótulo;
- demais insumos.

Ao consolidar uma produção aprovada, o sistema calcula o consumo correspondente.

### 11.1 Regra histórica do estoque de componentes

Decisões anteriores do Óris 360:
- não criar estoque reservado;
- não permitir saldo oficial negativo;
- não bloquear a produção física já realizada por insuficiência teórica;
- quando a baixa calculada superar o saldo disponível, baixar até zero;
- registrar a insuficiência como exceção/rastreabilidade;
- permitir posterior acerto administrativo.

Essas regras devem ser preservadas, mas a efetivação deve respeitar a nova barreira de conferência.

---

## 12. Produtividade e confiabilidade

Cada registro individual permite calcular:
- produção por colaborador;
- por dia;
- por semana;
- por mês;
- por produto;
- quantidade de registros;
- divergências.

### 12.1 Confiabilidade

A plataforma pode calcular indicador gerencial:

```
Declarado no período
vs
Validado no período
```

Não criar ranking público no app do operador.

---

## 13. Unidades, caixas, fardos e kits

Quando o cadastro conhecer a conversão, permitir entrada facilitada.

Exemplo:

```
1 caixa = 24 unidades
10 caixas + 8 unidades
= 248 unidades
```

A conversão deve vir do cadastro do produto.

Não pedir que o funcionário faça conta manual.

---

## 14. Offline

O app deve tolerar perda temporária de conexão.

### 14.1 Registro offline

Permitir:
- ler produto já disponível localmente;
- informar quantidade;
- salvar evento local;
- mostrar `PENDENTE DE SINCRONIZAÇÃO`.

### 14.2 Reconexão

Ao reconectar:
- enviar eventos;
- receber confirmação do servidor;
- evitar duplicidade;
- trocar status para `AGUARDANDO CONFERÊNCIA`.

Nunca afirmar sucesso de servidor sem confirmação.

---

## 15. Idempotência

Proteger no mínimo:
- registrar produção;
- confirmar conferência;
- corrigir registro;
- efetivar estoque.

Toques duplos e retries não podem duplicar operações.

---

## 16. Sessão e identidade

O usuário autenticado define o autor do registro.

Nunca mostrar seletor “produzido por” ao colaborador.

Se houver política de sessão única do ecossistema Óris 360, reutilizá-la.

---

## 17. Motivação e linguagem

O app é dirigido à equipe de produção.

Mensagens:
- curtas;
- humanas;
- respeitosas;
- motivacionais;
- não infantis.

Exemplos aprovados no conceito:
- “Tudo começa nas suas mãos.”
- “Você produz. Você registra. A gente cresce junto.”
- “Quem faz, faz a diferença.”
- “É daqui que o resultado começa.”
- “Pequenos registros, grandes resultados.”
- “Produza com qualidade. Registre com responsabilidade.”

As frases podem variar por:
- dia da semana;
- manhã;
- tarde.

---

## 18. Visual

Paleta:
- branco;
- azul;
- cinza.

Apoio semântico:
- verde = sucesso;
- amarelo/laranja = atenção;
- vermelho = urgente/erro/divergência.

Características:
- mobile-first;
- cartões claros;
- tipografia legível;
- botões grandes;
- ícones simples;
- bastante respiro;
- sem poluição visual.

---

## 19. O que não implementar sem nova decisão

- ordem de produção obrigatória;
- “aceitar produção” antes de iniciar;
- início/fim obrigatório;
- ranking público;
- edição silenciosa;
- estoque reservado;
- saldo negativo;
- aprovação automática do próprio operador;
- financeiro no app;
- custos/preços na interface do operador;
- dashboards administrativos complexos;
- formulários longos.

---

## 20. Regra de interpretação

Quando existir conflito entre uma proposta inicial da conversa e uma decisão posterior, prevalece a decisão posterior registrada no [[08-DECISION-LOG|Decision Log]].

O objetivo maior é:

> **registrar a realidade da produção com o mínimo de atrito, sem abrir mão da confiabilidade do estoque.**
