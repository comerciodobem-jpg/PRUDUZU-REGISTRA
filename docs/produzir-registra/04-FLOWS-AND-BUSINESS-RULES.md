---
title: "Fluxos e Regras de Negócio"
aliases:
  - Fluxos do Produzir Registra
  - Regras de negócio
type: business-rules
status: consolidated
project: Produzir Registra
created: 2026-09-22
updated: 2026-09-22
tags:
  - produzir-registra
  - documentacao/fluxos
related:
  - "[[03-DOMAIN-AND-DATA]]"
  - "[[05-ORIS360-INTEGRATION]]"
  - "[[06-OFFLINE-SECURITY-AUDIT]]"
  - "[[07-ACCEPTANCE-CRITERIA]]"
---

# 04 — Fluxos e Regras de Negócio

> [!abstract] Navegação
> [[00-START-HERE|Início]] · [[03-DOMAIN-AND-DATA|Anterior: Domínio]] · [[05-ORIS360-INTEGRATION|Próximo: Integração]]
>
> **Relacionados:** [[01-MASTER-SPEC|Especificação]] · [[06-OFFLINE-SECURITY-AUDIT|Confiabilidade]] · [[07-ACCEPTANCE-CRITERIA|Aceitação]]

## Fluxo A — Produção livre

1. Funcionário produz fisicamente.
2. Abre o app.
3. Escaneia o produto.
4. Produto é encontrado.
5. Digita quantidade.
6. Registra.
7. Sistema vincula ao usuário logado.
8. Registro fica `PENDING_REVIEW`.
9. Produtividade declarada é atualizada.
10. Estoque permanece inalterado até revisão.

---

## Fluxo B — Vários registros consecutivos

1. Escaneia produto A.
2. Informa quantidade.
3. Registra.
4. Confirmação rápida.
5. Scanner volta a ficar pronto.
6. Escaneia produto B.

Não obrigar retorno à home.

---

## Fluxo C — Necessidade ativa

1. Gestão cria necessidade.
2. App mostra destaque.
3. Equipe continua produzindo normalmente.
4. Operador registra produto.
5. Sistema detecta necessidade compatível.
6. Registro pode aparecer no progresso provisório.
7. Após conferência, progresso confirmado é atualizado.
8. Ao atingir alvo, necessidade conclui.

---

## Fluxo D — Urgência

1. Gestão marca necessidade como urgente.
2. App mostra selo/contador.
3. Operador vê alvo e saldo.
4. Não é obrigado a “aceitar”.
5. Produções do produto alimentam o progresso.
6. Ao concluir, urgência deixa a lista ativa.

---

## Fluxo E — Conferência sem divergência

1. Gestor abre `Conferir`.
2. Seleciona período/produto.
3. Vê total declarado.
4. Confere fisicamente.
5. Quantidade física = declarada.
6. Confirma.
7. Registros associados passam a `CONFIRMED`.
8. Estoque recebe quantidade confirmada.
9. Ficha técnica gera consumos.
10. Histórico e indicadores atualizam.

---

## Fluxo F — Conferência com divergência

1. Total declarado: 1.500.
2. Total físico: 1.490.
3. Gestor informa 1.490.
4. Sistema mostra -10.
5. Confirma.
6. Registro de review fica `DIVERGENT`.
7. Estoque recebe 1.490.
8. Declarações individuais continuam preservadas.
9. Divergência entra na auditoria.

---

## Fluxo G — Falta de saldo de matéria-prima

Após conferência:
1. ficha técnica exige 10 kg;
2. saldo oficial mostra 8 kg;
3. sistema não pode gerar -2 kg;
4. baixa 8 kg;
5. saldo vai a zero;
6. registra insuficiência de 2 kg;
7. produto acabado continua registrado porque a produção física já aconteceu;
8. ajuste administrativo posterior reconcilia o estoque.

---

## Fluxo H — Registro offline

1. App perde internet.
2. Produto já disponível localmente é lido.
3. Operador registra.
4. Evento fica `LOCAL_PENDING`.
5. App mostra pendência.
6. Ao reconectar, envia usando idempotency key.
7. Servidor confirma.
8. Status vira `SYNCED/PENDING_REVIEW`.

---

## Fluxo I — Retry / toque duplo

1. Usuário toca duas vezes.
2. Cliente reaproveita a mesma idempotency key.
3. Servidor devolve o mesmo resultado.
4. Apenas um registro existe.

---

## Fluxo J — Correção pós-aprovação

1. Gestor identifica erro.
2. Não altera silenciosamente o original.
3. Abre ação de correção.
4. Sistema exige motivo.
5. Cria evento de correção.
6. Ajusta estoque por movimento compensatório quando necessário.
7. Mantém antes/depois na auditoria.

---

## Fluxo K — Produção de caixas/fardos

1. Produto possui conversão.
2. Operador escolhe `10 caixas + 8 un.`.
3. Sistema converte para 248.
4. Registro salva quantidade base.
5. Interface pode guardar composição usada para facilitar auditoria.

---

## Regras negativas

O sistema NÃO deve:
- obrigar a escolher necessidade;
- transformar necessidade em trava;
- autoaprovar;
- permitir operador escolher outro autor;
- movimentar estoque no simples registro;
- esconder divergência;
- sobrescrever declarado;
- permitir saldo negativo;
- criar estoque paralelo no app.
