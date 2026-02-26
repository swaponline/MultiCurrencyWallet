# Decisions Log: apps-bridge-autoconnect

Отчёты агентов о выполнении задач. Каждая запись создаётся агентом, выполнившим задачу.

---

<!-- Записи добавляются агентами по мере выполнения задач.

Формат строгий — используй только эти секции, не добавляй другие.
Не включай: списки файлов, таблицы файндингов, JSON-отчёты, пошаговые логи.
Детали ревью — в JSON-файлах по ссылкам. QA-отчёт — в logs/working/.

## Task N: [название]

**Status:** Done
**Commit:** abc1234
**Agent:** [имя тиммейта или "основной агент"]
**Summary:** 1-3 предложения: что сделано, ключевые решения. Не список файлов.
**Deviations:** Нет / Отклонились от спека: [причина], сделали [что].

**Reviews:**

*Round 1:*
- code-reviewer: 2 findings → [logs/working/task-N/code-reviewer-1.json]
- security-auditor: OK → [logs/working/task-N/security-auditor-1.json]

*Round 2 (после исправлений):*
- code-reviewer: OK → [logs/working/task-N/code-reviewer-2.json]

**Verification:**
- `npm test` → 42 passed
- Manual check → OK

-->

## Task 1: Update MCW bridge client isMetaMask flag

**Status:** Done
**Commit:** 12073d59a
**Agent:** coder-bridge-flag
**Summary:** Changed `isMetaMask: false` to `isMetaMask: true` in `wallet-apps-bridge-client.js` on branch `issue-5268-apps-layout`. This single-line change enables dApp wallet libraries (web3-react, WalletModal) to recognize the bridge provider as MetaMask-compatible, which is required for proper wallet UI rendering and auto-connect flow.
**Deviations:** Нет

**Reviews:**

*Round 1:*
- code-reviewer: OK (0 findings) → [logs/working/task-1/code-reviewer-round1.json]

**Verification:**
- `git show issue-5268-apps-layout:src/front/client/wallet-apps-bridge-client.js | grep 'isMetaMask: true'` → match found
- `git diff HEAD~1..HEAD` → confirms only one line changed (isMetaMask: false → true)

## Task 2: Create unifactory bridge utils module

**Status:** Done
**Commit:** 194d97d8e
**Agent:** coder-bridge-utils
**Summary:** Created `src/utils/walletBridge.ts` for the unifactory repo with three exported functions: `detectBridgeMode()` (URL param + iframe check), `loadBridgeClient()` (dynamic script loading with referrer origin extraction and fallback), and `waitForBridgeReady()` (poll-based waiting with interval-count timeout). Used `getBridgeProvider()` helper with type cast to avoid conflicting with unifactory's existing global `Window.ethereum` type declaration. Chose interval-count based timeout instead of `Date.now()` for Jest fake timer compatibility. All 18 tests pass, TypeScript compiles cleanly.
**Deviations:** Нет

**Reviews:**

*Round 1:*
- code-reviewer: OK (2 low findings, no changes needed) → [logs/working/task-2/code-reviewer-round1.json]
- test-reviewer: OK (2 low findings, no changes needed) → [logs/working/task-2/test-reviewer-round1.json]

**Verification:**
- `npx react-scripts test --env=jsdom --watchAll=false --testPathPattern='walletBridge.test'` → 18 passed
- `npx tsc --noEmit` → 0 errors
- No regressions in existing test suite (111 tests still pass)

## Task 3: Add inline bridge loading script to unifactory index.html

**Status:** Done
**Commit:** 14d0058 (unifactory repo, branch main)
**Agent:** coder-inline-script
**Summary:** Added inline `<script>` to unifactory's `public/index.html` in `<head>` that detects bridge mode (URL param `?walletBridge=swaponline` + iframe context) and dynamically loads `wallet-apps-bridge-client.js` from the parent wallet host via `document.referrer`. Falls back to `https://swaponline.github.io/wallet-apps-bridge-client.js` if referrer is empty or blocked. Uses IIFE to avoid global scope pollution and try-catch for referrer URL parsing. Build verified successful.
**Deviations:** Нет

**Reviews:**

*Round 1:*
- code-reviewer: pass (2 low-severity informational findings, no changes needed) → [logs/working/task-3/code-reviewer-round1.json]

**Verification:**
- `npm run build` in unifactory → build succeeds, inline script present in `build/index.html`
- `grep 'walletBridge' build/index.html` → match found, script preserved after CRA minification

## Task 5: Suppress WalletModal in bridge mode

**Status:** Done
**Commit:** 49a905d (unifactory repo, branch main)
**Agent:** coder-wallet-modal
**Summary:** Added bridge suppression logic to WalletModal: early return `null` when `window.ethereum?.isSwapWalletAppsBridge && active` (both bridge mode active and wallet connected via web3-react). The check is placed after all hook calls to comply with React rules of hooks. Extended `Window.ethereum` type in `react-app-env.d.ts` with `isSwapWalletAppsBridge?: boolean` to resolve TypeScript errors. Added `@testing-library/react` for component testing. 5 unit tests cover all scenarios: bridge connected (suppressed), bridge not connected (fallback), standalone mode, no ethereum, bridge flag false.
**Deviations:** Нет

**Reviews:**

*Round 1:*
- code-reviewer: pass (2 low informational findings, no changes needed) → [logs/working/task-5/code-reviewer-round1.json]

**Verification:**
- `npx react-scripts test --env=jsdom --watchAll=false --testPathPattern='WalletModal/index.test'` → 5 passed
- `npx tsc --noEmit` → 0 errors
- `NODE_OPTIONS='--openssl-legacy-provider' npm run build` → build succeeds

## Task 6: Add bridge ready handler in Web3ReactManager

**Status:** Done
**Commit:** 8ad170a (unifactory repo, branch main)
**Agent:** coder-web3-manager
**Summary:** Added a `useEffect` hook in Web3ReactManager that listens for the `bridgeReady` custom event on `window.ethereum` when the bridge provider is detected (`isSwapWalletAppsBridge` flag). The handler retries wallet connection via `activate(injected)` if not already active, providing an event-driven fallback that complements the polling-based approach in `useEagerConnect`. Dependency array `[active, activate]` ensures the handler always has the correct `active` state in its closure. Installed `@testing-library/react` for component testing. All 6 tests pass, TypeScript compiles cleanly.
**Deviations:** Нет

**Reviews:**

*Round 1:*
- code-reviewer: pass (2 low informational findings, no changes needed) → [logs/working/task-6/code-reviewer-round1.json]
- test-reviewer: pass (2 low informational findings, no changes needed) → [logs/working/task-6/test-reviewer-round1.json]

**Verification:**
- `npx react-scripts test --env=jsdom --watchAll=false --testPathPattern='Web3ReactManager/index.test'` → 6 passed
- `npx tsc --noEmit` → 0 errors
- No regressions in existing test suite (chunkArray, parseENS, retry, uriToHttp: 19 passed)
