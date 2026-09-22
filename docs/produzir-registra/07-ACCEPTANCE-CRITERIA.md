---
title: "Critérios de Aceitação"
aliases:
  - Contrato de testes
  - Acceptance Criteria
type: acceptance-criteria
status: consolidated
project: Produzir Registra
created: 2026-09-22
updated: 2026-09-22
tags:
  - produzir-registra
  - documentacao/testes
related:
  - "[[01-MASTER-SPEC]]"
  - "[[02-UX-AND-SCREENS]]"
  - "[[04-FLOWS-AND-BUSINESS-RULES]]"
  - "[[06-OFFLINE-SECURITY-AUDIT]]"
---

# 07 — Critérios de Aceitação

> [!abstract] Navegação
> [[00-START-HERE|Início]] · [[06-OFFLINE-SECURITY-AUDIT|Anterior: Confiabilidade]] · [[08-DECISION-LOG|Próximo: Decisões]]
>
> **Relacionados:** [[01-MASTER-SPEC|Especificação]] · [[02-UX-AND-SCREENS|UX]] · [[04-FLOWS-AND-BUSINESS-RULES|Fluxos]]

## A. Registro

- [ ] Usuário logado consegue escanear um produto válido.
- [ ] Produto correto é exibido.
- [ ] Usuário informa quantidade.
- [ ] Registro é vinculado automaticamente ao usuário da sessão.
- [ ] Registro nasce como aguardando conferência.
- [ ] Estoque oficial não muda nesse momento.
- [ ] Toque duplo não cria duplicidade.
- [ ] Após sucesso, scanner fica pronto para o próximo produto.

## B. Produto inválido

- [ ] Código desconhecido mostra mensagem clara.
- [ ] Registro não é criado.
- [ ] Busca manual secundária continua disponível quando prevista.

## C. Produzido

- [ ] Totais de Hoje/Semana/Mês refletem registros permitidos.
- [ ] Lista mostra quantidade e status.
- [ ] Filtro de período funciona.
- [ ] Gráfico semanal usa dados reais do período.

## D. Nosso Resultado

- [ ] Tela funciona sem meta.
- [ ] Não exibe meta inventada.
- [ ] Quando existe necessidade, exibe alvo/progresso/saldo.
- [ ] Mensagens motivacionais não bloqueiam o uso.

## E. Necessidades

- [ ] Gestão consegue criar necessidade no sistema administrativo.
- [ ] App exibe necessidade ativa.
- [ ] Urgência recebe destaque.
- [ ] Produção livre continua permitida.
- [ ] Registro compatível atualiza progresso conforme regra de validação.
- [ ] Ao atingir alvo, necessidade conclui.
- [ ] Histórico mantém alvo original e produção relacionada.

## F. Conferência

- [ ] Aba só aparece para usuário autorizado.
- [ ] Pendências podem ser agrupadas por produto.
- [ ] Gestor enxerga composição por colaborador.
- [ ] Gestor informa quantidade física.
- [ ] Sistema calcula diferença.
- [ ] Confirmação preserva quantidade declarada.
- [ ] Estoque recebe quantidade conferida.
- [ ] Usuário sem permissão não consegue chamar API de conferência.

## G. Divergência

- [ ] Declarado e conferido permanecem armazenados.
- [ ] Movimento de estoque usa confirmado.
- [ ] Divergência fica auditável.
- [ ] Nenhuma rotina silenciosamente altera o declarado.

## H. Ficha técnica

- [ ] Produção conferida gera consumo proporcional.
- [ ] Versão da ficha usada é rastreável.
- [ ] Saldo de componente não fica negativo.
- [ ] Insuficiência gera exceção/auditoria.

## I. Offline

- [ ] Sem internet, registro local pode ser salvo quando catálogo permite.
- [ ] Usuário vê “pendente de sincronização”.
- [ ] Reconexão envia sem duplicar.
- [ ] Erro de sync fica visível e recuperável.
- [ ] Servidor não aceita ações sem autorização atual.

## J. Auditoria

- [ ] Correção exige motivo.
- [ ] Antes/depois é preservado.
- [ ] Quem registrou é preservado.
- [ ] Quem conferiu é preservado.
- [ ] Data/hora são preservadas.

## K. Conversões

- [ ] Produto com caixa/fardo converte corretamente para unidade base.
- [ ] Registro salva quantidade base.
- [ ] Valor zero/negativo é bloqueado.

## L. Multiempresa

- [ ] Usuário da Empresa A não acessa registros da Empresa B.
- [ ] Necessidades são isoladas por empresa.
- [ ] Conferência é isolada por empresa.
- [ ] Estoque é isolado por empresa.

## M. UX

- [ ] Fluxo principal pode ser executado sem navegar por telas administrativas.
- [ ] Não há ordem de produção obrigatória.
- [ ] Não há seleção manual do autor.
- [ ] Não há custo/preço no app operacional.
- [ ] Cores base são branco, azul e cinza.
