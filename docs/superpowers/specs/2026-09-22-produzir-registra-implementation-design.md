# Produzir Registra — Arquitetura de Implementação

**Data:** 2026-09-22  
**Status:** aprovado para implementação pelo pedido explícito de construção do repositório  
**Base funcional:** `docs/produzir-registra/01-MASTER-SPEC.md` e `08-DECISION-LOG.md`

## 1. Resultado a entregar

Um único aplicativo web mobile-first/PWA chamado **Produzir Registra**, pertencente ao módulo Produção do Óris 360, capaz de executar o fluxo:

```
produção física
→ leitura do código de barras
→ quantidade
→ registro individual
→ aguardando conferência
→ conferência autorizada
→ estoque oficial + consumo de ficha técnica
→ histórico + indicadores + auditoria
```

O registro individual jamais movimenta estoque oficial sozinho.

## 2. Stack

- Next.js 16.3.3, App Router e TypeScript.
- React 19.3.
- Route Handlers do Next.js para a API do próprio aplicativo.
- PostgreSQL como modelo de persistência de produção; driver Neon serverless na implantação Vercel.
- Vitest para regras de domínio e serviços.
- CSS nativo organizado em tokens; sem dependência de framework visual.
- Service Worker + IndexedDB para continuidade offline.
- GitHub Actions para teste, typecheck e build.
- Vercel para Preview/Production após o branch estar validado.

## 3. Limites de responsabilidade

### Interface
Responsável por scanner, quantidade, navegação, feedback, histórico, resultados, necessidades e conferência.

### Domínio
Responsável por validação, conversão de embalagens, estados, cálculo de divergência, associação não ambígua de necessidade, consumo de ficha técnica, idempotência e autorização de ações críticas.

### Repositório
Interface única de acesso aos dados. Haverá:
- implementação em memória para testes e Preview demonstrativo;
- implementação PostgreSQL para ambiente conectado.

Nenhuma regra de negócio deve depender diretamente do fornecedor do banco.

## 4. Autenticação

A autenticação definitiva do Óris 360 continua sendo uma decisão aberta no produto. Portanto:

- `SessionProvider` é uma interface.
- Preview pode ativar `DEMO_MODE=true` para duas identidades fictícias: colaborador e conferente.
- Demo login nunca é habilitado implicitamente em produção.
- a autoria do registro é sempre obtida da sessão no servidor;
- `user_id` enviado pelo navegador nunca define autoria.

Assim a implementação funciona para demonstração e teste sem transformar o login demonstrativo em decisão definitiva do Óris 360.

## 5. Questões abertas preservadas

### O-001 — múltiplas necessidades do mesmo produto
Autoassociar somente quando existe **uma única** necessidade elegível. Com duas ou mais, o registro fica sem vínculo automático e gera sinal de ambiguidade. Não usar FIFO, prioridade ou rateio sem nova decisão.

### O-002 — janela de conferência
Não fixar turno/dia/lote. A API aceita período opcional e a UI permite filtrar; registros pendentes permanecem pendentes até revisão.

### O-003 — lote/validade
Fora do MVP atual; o modelo deixa espaço para extensão sem exigir campos.

### O-004 — segregação
Autoaprovação bloqueada por padrão. `ALLOW_SELF_REVIEW` pode ser habilitado explicitamente em ambiente controlado até existir política por empresa.

### O-005 — primeiro login
Isolado em `SessionProvider`; modo demo é somente infraestrutura de avaliação.

### O-006 — divergência entre operadores
A divergência pertence à conferência agrupada. Nenhuma diferença é distribuída automaticamente entre colaboradores.

## 6. Integridade e idempotência

- toda mutação crítica recebe `idempotencyKey`;
- chaves são únicas por empresa/operação;
- quantidade deve ser positiva;
- produto deve estar ativo e pertencer à empresa;
- revisão só inclui registros elegíveis;
- review + movimentos de estoque + auditoria acontecem numa transação no PostgreSQL;
- retries devolvem o resultado já criado, sem duplicar efeitos.

## 7. Estoque

Na confirmação:
1. preservar total declarado;
2. registrar quantidade conferida;
3. criar entrada de produto acabado pela quantidade conferida;
4. carregar versão de ficha técnica;
5. calcular consumo proporcional;
6. reduzir cada componente até no máximo zero;
7. registrar insuficiência quando consumo calculado supera saldo;
8. atualizar necessidade vinculada pela quantidade conferida;
9. escrever auditoria.

Nunca criar saldo negativo e nunca reescrever a declaração original.

## 8. Offline

O catálogo sincronizado permite leitura local. Registros sem rede entram em IndexedDB com:
- `localId`;
- `idempotencyKey`;
- payload;
- data;
- tentativas;
- último erro.

Ao reconectar, `/api/sync` recebe o lote. O cliente só marca `SYNCED` após confirmação do servidor.

## 9. UX

- branco, azul e cinza como base;
- verde/sucesso, amarelo/atenção, vermelho/urgente/divergência;
- navegação inferior;
- scanner é protagonista;
- botões grandes;
- nenhuma tela financeira;
- sem ranking;
- sem ordem de produção;
- sem formulário longo;
- mensagens motivacionais curtas e não bloqueantes.

## 10. Rotas

- `/login`
- `/registrar`
- `/produzido`
- `/resultado`
- `/conferir` — somente com permissão.

API:
- `GET /api/products/barcode/:barcode`
- `GET|POST /api/production/records`
- `GET /api/production/metrics`
- `GET /api/production/needs`
- `GET /api/production/reviews/pending`
- `POST /api/production/reviews`
- `POST /api/production/sync`
- `POST /api/auth/demo`
- `DELETE /api/auth/session`

## 11. Verificação de entrega

A branch só é considerada pronta quando:
- testes de domínio/serviço passam;
- typecheck passa;
- build Next.js passa;
- fluxo colaborador e conferente é testado no browser;
- tentativa de conferência sem permissão falha;
- toque/retry idempotente não duplica;
- registro não altera estoque;
- review altera estoque uma única vez;
- divergência preserva declarado/conferido;
- estoque de componente nunca fica negativo;
- fluxo offline é recuperável;
- revisão de segurança e QA não encontram defeitos críticos/importantes abertos.
