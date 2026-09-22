---
title: "Offline, Segurança, Auditoria e Confiabilidade"
aliases:
  - Segurança e Auditoria
  - Confiabilidade do Produzir Registra
type: reliability-specification
status: consolidated
project: Produzir Registra
created: 2026-09-22
updated: 2026-09-22
tags:
  - produzir-registra
  - documentacao/confiabilidade
  - seguranca
related:
  - "[[03-DOMAIN-AND-DATA]]"
  - "[[04-FLOWS-AND-BUSINESS-RULES]]"
  - "[[05-ORIS360-INTEGRATION]]"
  - "[[07-ACCEPTANCE-CRITERIA]]"
---

# 06 — Offline, Segurança, Auditoria e Confiabilidade

> [!abstract] Navegação
> [[00-START-HERE|Início]] · [[05-ORIS360-INTEGRATION|Anterior: Integração]] · [[07-ACCEPTANCE-CRITERIA|Próximo: Aceitação]]
>
> **Relacionados:** [[03-DOMAIN-AND-DATA|Domínio]] · [[04-FLOWS-AND-BUSINESS-RULES|Fluxos]] · [[05-ORIS360-INTEGRATION|Integração]]

## 1. Fonte da verdade

A plataforma/servidor é a fonte final para:
- usuários;
- permissões;
- produtos;
- necessidades;
- conferências;
- estoque;
- auditoria.

Offline é uma capacidade de continuidade, não uma autoridade paralela.

---

## 2. Idempotência

Toda ação mutável crítica deve ter uma chave de idempotência.

Exemplos:
- registrar produção;
- sincronizar registro;
- confirmar revisão;
- aplicar movimento de estoque;
- corrigir evento.

O servidor deve permitir replay seguro.

---

## 3. Autoria

O autor vem do token/sessão.

Nunca confiar em `user_id` arbitrário enviado por cliente sem validar a sessão.

---

## 4. Permissões

Mínimo:
- `production.record`;
- `production.read.self`;
- `production.read.team` opcional;
- `production.review`;
- `production.correct`;
- `production.need.read`;
- `production.need.manage` administrativo.

---

## 5. Regra de aprovação

Quem registrou uma produção não deve conseguir aprová-la como operador.

Caso uma pessoa também tenha papel de gestor, a plataforma deve registrar claramente o contexto de atuação e impedir autoaprovação quando a política assim exigir.

A regra recomendada é: **registro e aprovação do mesmo evento não devem ser da mesma identidade**.

---

## 6. Auditoria

Auditar:
- criação;
- sincronização;
- revisão;
- divergência;
- correção;
- movimento de estoque;
- conclusão de necessidade.

Não é necessário expor tudo no app operacional.

---

## 7. Offline

Dados locais mínimos:
- catálogo necessário para leitura;
- conversões;
- identidade da sessão;
- fila de registros;
- necessidades recentes quando aplicável.

Não guardar:
- segredos;
- dados financeiros desnecessários.

---

## 8. Sincronização

Fila local deve conter:
- local_id;
- idempotency_key;
- payload;
- created_at;
- retry_count;
- last_error;
- server_id quando confirmado.

---

## 9. Conflitos

Se produto for desativado entre registro offline e sync:
- não apagar o registro local;
- servidor retorna erro específico;
- app marca como requerendo resolução.

Se usuário perder permissão:
- não enviar novas ações restritas;
- registros previamente criados continuam auditáveis.

---

## 10. Estoque

Movimentos de estoque e revisão devem preferencialmente ocorrer em transação lógica única ou workflow durável.

Objetivo:
- não aprovar produção e falhar silenciosamente antes de movimentar estoque;
- não movimentar estoque duas vezes após retry.

---

## 11. Observabilidade

Registrar:
- falhas de sync;
- divergências;
- duplicidades evitadas;
- movimentos de estoque falhos;
- insuficiência de componente;
- latência de scanner/busca;
- taxa de erro por endpoint.

---

## 12. Privacidade

O app mostra produtividade individual porque isso faz parte da operação.

Evitar exposição desnecessária:
- não mostrar ranking;
- não mostrar dados pessoais além do necessário;
- limitar visão de equipe por permissão.

---

## 13. Segurança operacional

Validar:
- quantidade > 0;
- produto ativo;
- empresa correta;
- unidade compatível;
- conversão válida;
- permissão;
- idempotency key;
- registro ainda elegível para conferência.

---

## 14. Correção

Correção nunca apaga o evento original.

Use:
- evento compensatório;
- novo revision;
- motivo obrigatório;
- trilha antes/depois.
