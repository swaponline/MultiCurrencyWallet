# Patterns & Conventions

Coding conventions, development workflow, and project-specific practices.
For universal coding standards, see `~/.claude/skills/code-writing/references/universal-patterns.md`.

---

## Project-Specific Code Patterns

### Code Style

- **No semicolons** (`semi: never`)
- **Single quotes** (`quotes: single`)
- **2-space indent**, **180 char max line length**
- **Trailing commas** in multiline (`comma-dangle: always-multiline`)
- CSS uses **CSS Modules** via `react-css-modules` with SCSS
- TypeScript: `noImplicitAny: false`, `strictNullChecks: true`, `experimentalDecorators: true`

### Module Aliases

Always use Webpack/tsconfig aliases, not relative paths across module boundaries:
- `swap.app`, `swap.flows`, `swap.swaps` — Core swap engine
- `helpers`, `redux/*`, `components` — Frontend modules
- `common/*` — Shared utilities

### Config System

Import config via `app-config` alias: `import config from 'app-config'`. Config selected by `CONFIG` env var (e.g., `testnet.dev`), files in `src/front/config/`.

### State Management (Redaction)

Use `redaction` (NOT raw Redux). Action types auto-generated from reducer function names. Example:
```typescript
// Reducer function name becomes action type
function setUserData(state, { payload }) { ... }
// Dispatch: actions.setUserData({ ... })
```

### Currency Actions

- EVM chains: extend `ethLikeAction.ts`
- ERC20/BEP20 tokens: extend `erc20LikeAction.ts`
- UTXO chains (BTC): separate helpers (`btc.ts`, `ghost.ts`)

---

## Git Workflow

<!--
SCALING HINT: If this section grows beyond ~80 lines, extract to references/git-workflow.md.
-->

### Branch Structure

- **`master`** - Production-ready code. Triggers deployment to swaponline.github.io (mainnet). Protected branch.
- **Feature branches** - Created from `master`, merged back via PR. E.g., `issue-5268-apps-layout`, `fix-deploy-publicpath`.

### Branch Decision Criteria

**Feature branch (always):** All changes go through PR review before merging to `master`.

**Branch naming:** `issue-XXXX-short-desc` (reference GitHub issue) or `fix/feat/refactor-short-desc`.

Rule of thumb: Never push directly to `master` — always PR.

### Testing Requirements

- **On PR:** GitHub Actions builds mainnet + testnet bundles, runs unit tests (`npm run test:unit`). E2E tests commented out (setup issue).
- **Manual testing:** E2E swap tests available (`npm run test:e2e_swap`), run locally before merge.
- **Core library:** Run `npm run core:test` if modifying swap engine.

### Security & Quality Gates

- **Pre-commit:** No automated secret scanning configured.
- **PR checks:** GitHub Actions build + unit tests must pass before merge.
- **Code review:** Human review required for all PRs.

---

## Testing & Verification

<!--
SCALING HINT: If this section grows beyond ~60 lines, extract to references/testing.md.
This section stores proven verification approaches discovered during development.
Generic testing methodology lives in ~/.claude/skills/test-master/.
-->

### Test Infrastructure

**Framework:** Jest + Puppeteer (E2E)
**Test commands:** `npm run test:unit` (Jest), `npm run test:e2e_swap` (Puppeteer swap flows)
**Config:** Jest config in `package.json`, E2E tests in `tests/e2e/`
**Test wallets:** `tests/testWallets.json` (encrypted, decrypted in CI via GPG)

**Environment:** Tests run with `CONFIG=testnet.dev` (testnet RPC endpoints)

**E2E setup:** Requires building testnet bundle first (`npm run build:testnet-tests`)

### Agent Verification Methods

**Balance checks:** Read blockchain via RPC (testnet), verify balance updates after sends
**Transaction history:** Query explorer APIs, verify tx appears in history
**P2P connectivity:** Check libp2p peer count, verify order book syncs

### User Verification Methods

**Visual UI:** Open wallet in browser, verify layout/styling (agent can't render)
**Atomic swap flow:** Full swap E2E requires two users, agent runs automated test with test wallets
**Chrome extension:** Install from `build-chrome-extension/`, test in real Chrome (agent can't install extensions)

---

## Business Rules

### Atomic Swap Lifecycle

**States:** `waiting` → `signed` → `confirmed` → `completed` (or `refunded` if timeout)

**Timeouts:**
- HTLC lock time: configurable per swap (typically 48h for initiator, 24h for participant)
- Refund available: after lock time expires if counterparty didn't claim

**Fee calculation:**
- User pays blockchain fees only (no platform fees)
- Estimated before swap start, actual fee depends on network congestion
- Separate fees for both chains (e.g., BTC tx fee + ETH gas fee)

### Balance Display

Display formula: `balance = confirmed_balance` (no pending/unconfirmed shown separately)

Precision: Display up to 8 decimals for BTC, 18 for ETH/tokens (blockchain native precision)
