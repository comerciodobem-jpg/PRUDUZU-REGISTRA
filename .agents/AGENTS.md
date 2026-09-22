# AGENTS.md — Contexto obrigatório para agentes

## Missão

Antes de alterar qualquer parte relacionada ao **Produzir Registra**, leia a documentação em `docs/produzir-registra/`.

Este projeto foi construído por refinamento iterativo de negócio. Algumas ideias antigas foram substituídas por decisões mais recentes. O arquivo `08-DECISION-LOG.md` define qual regra prevalece em caso de conflito histórico.

## Intenção semântica central

O Produzir Registra existe para resolver simultaneamente três problemas:

1. saber **quem produziu**;
2. saber **quanto foi declarado como produzido**;
3. garantir que **somente o que foi conferido altere o estoque oficial**.

Não sacrifique um desses objetivos para simplificar outro.

## Regra operacional mais importante

O funcionário **não abre ordem de produção para poder trabalhar**.

Fluxo normal:

```
produzir fisicamente
→ escanear código de barras
→ informar quantidade
→ registrar
→ aguardar conferência
```

O registro individual serve imediatamente para rastreabilidade/produtividade declarada, mas **não movimenta sozinho o estoque oficial**.

O conferente/gestor valida a produção física. Só a quantidade aprovada gera o movimento definitivo de estoque.

## Um app, perfis diferentes

Não criar dois aplicativos.

- **Colaborador:** Registrar | Produzido | Nosso Resultado
- **Gestor/Conferente:** as mesmas áreas + Conferir

A aba **Conferir** é controlada por permissão.

## Identidade visual

Base obrigatória:
- branco;
- azul;
- cinza.

Cores auxiliares:
- verde = sucesso/confirmado;
- amarelo/laranja = atenção;
- vermelho = urgente/erro/divergência.

A interface deve ser limpa, mobile-first, operacional e sem aparência de ERP administrativo.

## Restrições de escopo

Não introduzir sem aprovação:
- ordem de produção obrigatória;
- iniciar/finalizar produção como etapas obrigatórias;
- preços, custos ou margens no app operacional;
- ranking público de funcionários;
- estoque reservado;
- saldo negativo;
- aprovação automática da própria produção pelo operador;
- reescrita silenciosa de registros já aprovados.

## Óris 360

O Produzir Registra pertence conceitualmente ao **módulo Produção** e se integra com:
- Produtos;
- Ficha Técnica;
- Matérias-Primas e Insumos;
- Estoque;
- Colaboradores/usuários;
- Indicadores.

Leia `05-ORIS360-INTEGRATION.md` antes de desenhar APIs ou persistência.

## Fonte da verdade

Em conflito entre uma ideia histórica e uma decisão recente:
1. decisão marcada como **ATUAL/APROVADA** em `08-DECISION-LOG.md`;
2. `01-MASTER-SPEC.md`;
3. documentação temática;
4. notas de referência históricas.

Questões marcadas como **ABERTAS** não devem ser decididas silenciosamente pelo agente.
