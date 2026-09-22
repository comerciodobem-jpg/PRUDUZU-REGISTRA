# Produzir Registra App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o aplicativo Produzir Registra completo no repositório, testável, mobile-first, offline-tolerant e pronto para Preview/Production na Vercel.

**Architecture:** Um Next.js App Router separa UI, domínio e persistência. Regras críticas ficam em TypeScript puro e são testadas; Route Handlers chamam serviços server-side; o repositório possui implementação de memória para testes/demo e PostgreSQL/Neon para ambiente conectado.

**Tech Stack:** Next.js 16.3.3, React 19.3.0, TypeScript, Neon serverless PostgreSQL, Zod, Vitest, Service Worker e IndexedDB.

**Spec:** `docs/superpowers/specs/2026-09-22-produzir-registra-implementation-design.md`

## Global Constraints

- Registro individual nunca movimenta estoque oficial.
- Somente quantidade conferida movimenta estoque e consome ficha técnica.
- Autoria vem exclusivamente da sessão do servidor.
- Empresa A nunca acessa dados da Empresa B.
- Nunca permitir saldo oficial negativo.
- Declarado, conferido e movimentado permanecem distintos e auditáveis.
- Scanner → quantidade → registrar deve ser o caminho principal.
- Não criar ordem de produção obrigatória, ranking, financeiro ou estoque reservado.
- Questões O-001 a O-006 seguem a estratégia conservadora descrita na especificação.
- Demo auth só funciona quando `DEMO_MODE=true`.
- Nenhum segredo é versionado.

## Review Focus

- Replay da mesma idempotency key deve produzir um único efeito.
- Duas necessidades ativas do mesmo produto não podem receber associação silenciosa.
- Conferente não autorizado ou de outra empresa deve receber 403.
- Falta de matéria-prima deve zerar saldo e auditar a falta sem impedir o produto acabado.
- Registro offline sincronizado duas vezes não pode duplicar produção.

---

### Task 1: Fundação, CI e contrato RED do domínio

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `.gitignore`, `.env.example`
- Create: `.github/workflows/ci.yml`
- Create: `src/domain/types.ts`, `src/domain/rules.ts`
- Test: `tests/domain/rules.test.ts`

**Interfaces:**
- Produces: `calculateDifference`, `convertPackagingToBase`, `selectUnambiguousNeed`, `calculateMaterialConsumption`.

- [ ] Escrever testes para diferença, conversão, necessidade única/ambígua e clamp de estoque.
- [ ] Fazer o primeiro CI rodar vermelho por funções ainda não implementadas.
- [ ] Registrar a evidência do RED antes da implementação.

### Task 2: Regras de domínio GREEN

**Files:**
- Modify: `src/domain/rules.ts`
- Test: `tests/domain/rules.test.ts`

**Interfaces:**
- Consumes: tipos de `src/domain/types.ts`.
- Produces: funções puras usadas pelos serviços.

- [ ] Implementar somente as regras exigidas pelos testes.
- [ ] Rodar suite e confirmar GREEN.
- [ ] Incluir testes para zero/negativo, necessidade ambígua e shortage.

### Task 3: Repositório em memória, idempotência e serviço de produção

**Files:**
- Create: `src/server/repositories/contracts.ts`
- Create: `src/server/repositories/memory.ts`
- Create: `src/server/services/production-service.ts`
- Create: `src/server/demo/seed.ts`
- Test: `tests/server/production-service.test.ts`

**Interfaces:**
- Produces: `ProductionRepository`, `MemoryProductionRepository`, `ProductionService.recordProduction()`, `ProductionService.reviewProduction()`, métricas e listagens.

- [ ] Testar registro sem movimento de estoque.
- [ ] Testar retry idempotente.
- [ ] Testar review, divergência, estoque e auditoria.
- [ ] Testar isolamento multiempresa e bloqueio de autoaprovação.
- [ ] Implementar até todos passarem.

### Task 4: PostgreSQL/Neon e migração

**Files:**
- Create: `src/server/db/client.ts`
- Create: `src/server/repositories/postgres.ts`
- Create: `db/0001_initial.sql`
- Create: `scripts/db-seed.mjs`
- Test: `tests/server/repository-contract.test.ts`

**Interfaces:**
- Produces: implementação `PostgresProductionRepository` do mesmo contrato.

- [ ] Definir tabelas/índices/constraints para empresas, usuários, produtos, fichas, materiais, registros, reviews, itens, needs, stock movements, audit e idempotency.
- [ ] Implementar transação da conferência.
- [ ] Aplicar constraints de empresa e unicidade.
- [ ] Reusar contract tests da memória no adaptador SQL quando `TEST_DATABASE_URL` existir.

### Task 5: Sessão, permissões e APIs

**Files:**
- Create: `src/server/auth/session.ts`
- Create: `src/server/container.ts`
- Create route handlers em `src/app/api/**/route.ts`
- Test: `tests/server/auth.test.ts`, `tests/server/api-services.test.ts`

**Interfaces:**
- Produces: `requireSession`, `requirePermission`, endpoints documentados na spec.

- [ ] Assinar cookie HttpOnly no modo demo.
- [ ] Nunca aceitar autoria do payload.
- [ ] Aplicar company scope em toda operação.
- [ ] Retornar 401/403/404/409/422 de forma consistente.
- [ ] Validar inputs com Zod.

### Task 6: Shell mobile, login e Registro

**Files:**
- Create: `src/app/layout.tsx`, `src/app/globals.css`
- Create: `src/app/login/page.tsx`
- Create: `src/app/(app)/layout.tsx`
- Create: `src/app/(app)/registrar/page.tsx`
- Create components em `src/components/**`

**Interfaces:**
- Consumes: APIs de auth/product/records.
- Produces: fluxo scan → quantidade → registro → scanner pronto novamente.

- [ ] Construir navegação responsiva por permissão.
- [ ] Implementar BarcodeDetector quando disponível e fallback por código manual.
- [ ] Exibir produto, unidade, conversão, quantidade e últimos registros.
- [ ] Prevenir submissão dupla no cliente além da idempotência do servidor.
- [ ] Aplicar identidade visual e acessibilidade.

### Task 7: Produzido, Nosso Resultado e Necessidades

**Files:**
- Create: `src/app/(app)/produzido/page.tsx`
- Create: `src/app/(app)/resultado/page.tsx`
- Create: `src/components/kpi-card.tsx`, `weekly-bars.tsx`, `need-card.tsx`, `status-pill.tsx`

**Interfaces:**
- Consumes: metrics, records e needs.
- Produces: KPIs hoje/semana/mês, gráfico semanal, lista e progresso de necessidade sem meta inventada.

- [ ] Não renderizar bloco de meta quando não existe.
- [ ] Destacar urgência localmente.
- [ ] Exibir estados de review sem depender somente de cor.
- [ ] Preservar linguagem motivacional curta.

### Task 8: Conferir

**Files:**
- Create: `src/app/(app)/conferir/page.tsx`
- Create: `src/components/review-group.tsx`
- Test: `tests/server/review-permissions.test.ts`

**Interfaces:**
- Consumes: pending review groups e POST review.
- Produces: composição por colaborador, quantidade física, diferença e confirmação.

- [ ] Ocultar navegação sem `production.review`.
- [ ] Proteger endpoint independentemente da UI.
- [ ] Mostrar total declarado + composição individual.
- [ ] Não distribuir divergência pelos trabalhadores.
- [ ] Confirmar uma única vez por idempotency key.

### Task 9: PWA e offline

**Files:**
- Create: `public/sw.js`, `public/manifest.webmanifest`
- Create: `src/components/service-worker-register.tsx`
- Create: `src/offline/db.ts`, `src/offline/sync.ts`
- Test: `tests/offline/sync.test.ts`

**Interfaces:**
- Produces: catálogo/cache de shell, fila IndexedDB e `flushPendingRecords()`.

- [ ] Salvar produção local com idempotency key quando fetch falhar por rede.
- [ ] Mostrar pendente de sincronização.
- [ ] Sincronizar lote após reconexão.
- [ ] Preservar erro recuperável para produto desativado/permissão.
- [ ] Nunca marcar sucesso do servidor antes da resposta.

### Task 10: QA, segurança e Vercel readiness

**Files:**
- Modify: `README.md`
- Create: `docs/DEPLOYMENT.md`
- Modify: CI conforme necessário.

**Interfaces:**
- Produces: branch pronta para Preview da Vercel.

- [ ] Rodar `npm test`, `npm run typecheck`, `npm run build`.
- [ ] Verificar visualmente login, registrar, produzido, resultado e conferir em navegador.
- [ ] Fazer revisão de segurança sobre sessão, multiempresa, idempotência e mutações.
- [ ] Fazer revisão final do diff e corrigir achados críticos/importantes com teste RED→GREEN.
- [ ] Abrir/atualizar PR com evidências.
- [ ] Só então conectar/deployar Preview na Vercel; produção permanece dependente de aprovação/merge.
