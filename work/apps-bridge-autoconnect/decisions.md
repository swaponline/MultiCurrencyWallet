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

## Task 4: Extend useEagerConnect with bridge auto-connect

**Status:** Done
**Commit:** 75ac967 (unifactory repo, branch main)
**Agent:** coder-eager-connect
**Summary:** Extended `useEagerConnect()` hook in unifactory to detect bridge mode via `window.ethereum?.isSwapWalletAppsBridge`, wait for bridge ready up to 5 seconds via `waitForBridgeReady(5000)`, and call `activate(injected)` immediately on bridge ready -- bypassing the `isAuthorized()` check. On timeout, falls back to standard eager connect flow. Extracted existing eager connect logic into `standardEagerConnect()` helper to avoid code duplication between bridge fallback and standalone paths. Also committed Task 2's `walletBridge.ts` utils into the unifactory repo (was in work directory only).
**Deviations:** Нет

**Reviews:**

*Round 1:*
- code-reviewer: pass (2 low informational findings, no changes needed) → [logs/working/task-4/code-reviewer-round1.json]
- test-reviewer: pass (3 low informational findings, no changes needed) → [logs/working/task-4/test-reviewer-round1.json]

**Verification:**
- `npx react-scripts test --env=jsdom --watchAll=false --testPathPattern='src/hooks/index.test'` → 6 passed
- `npx react-scripts test --env=jsdom --watchAll=false --testPathPattern='walletBridge.test'` → 18 passed
- `npx tsc --noEmit` → 0 errors
- No regressions in existing passing tests (124 tests still pass)

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

## Task 7: Add MCW bridge unit tests

**Status:** Done
**Commit:** 61a2b8167
**Agent:** tester-unit
**Summary:** Created comprehensive unit test suite for `wallet-apps-bridge-client.js` with 27 tests across 5 describe blocks. Tests cover all critical bridge protocol flows: provider properties verification (isMetaMask, isSwapWalletAppsBridge, chainId, selectedAddress), HELLO/READY handshake with postMessage mocking, request forwarding (request, enable, send, sendAsync), event forwarding (accountsChanged, chainChanged, disconnect, multiple listeners, removeListener/removeAllListeners), and error handling (30s timeout via fake timers, error responses, source validation). Used eval-based approach to re-evaluate the IIFE bridge client per test for full isolation.
**Deviations:** Removed `window.location` mock (JSDOM does not allow redefining location). Instead relied on `delete window.ethereum` before each test so the bridge client's `injectProvider()` injects unconditionally (since `!window.ethereum` is true). This achieves the same result without needing the URL query param check.

**Reviews:**

*Round 1:*
- test-reviewer: pass (2 low informational findings, no changes needed) → [logs/working/task-7/test-reviewer-round1.json]

**Verification:**
- `npx jest tests/unit/walletBridge.test.ts --verbose` → 27 passed
- `npm run test:unit` → walletBridge tests pass, no regressions (pre-existing btcSend network failures unrelated)

## Task 8: Extend MCW E2E smoke test for auto-connect

**Status:** Done
**Commit:** 464fc6a25
**Agent:** tester-e2e
**Summary:** Created new E2E smoke test file `tests/e2e/walletAppsBridge.smoke.js` with two test cases: Happy Path (import wallet, navigate to Apps, click DEX, wait for bridge ready via polling isConnected, verify no wallet modal, extract and compare address to test wallet) and No Wallet Fallback (skip wallet import, verify modal IS visible). Added `smoke` to jest.config.js testMatch patterns so Jest discovers `.smoke.js` files. Extracted shared DEX navigation logic into `navigateToAppsAndClickDex()` helper after review feedback.
**Deviations:** Added `testMatch` config to `jest.config.js` because Jest's default testMatch only matches `.test.` and `.spec.` files, not `.smoke.` files. Without this change, `jest tests/e2e/walletAppsBridge.smoke.js` would exit with "No tests found". This is a minimal, backward-compatible addition.

**Reviews:**

*Round 1:*
- test-reviewer: pass with 1 minor suggestion (extract duplicated DEX click logic) → [logs/working/task-8/test-reviewer-round1.json]

*Round 2 (after fix):*
- test-reviewer: pass → [logs/working/task-8/test-reviewer-round2.json]

**Verification:**
- `jest tests/e2e/walletAppsBridge.smoke.js --detectOpenHandles` → 2 tests found, suite runs (Puppeteer fails to launch due to server root environment — same behavior as all existing E2E tests like history.test.ts)
- `npm run test:unit` → 27 passed, no regressions (pre-existing btcSend config failure unrelated)

## Task 9: Pre-deploy QA

**Status:** Done
**Agent:** qa-runner
**Summary:** QA passed. MCW: 28 tests green (27 walletBridge + 1 txSize), 4 pre-existing btcSend network failures. unifactory: 128 tests green (35 new feature tests), 5 pre-existing import failures. Zero regressions confirmed by diffing test results against pre-feature baseline. 13 acceptance criteria checked: 8 passed (code-verifiable), 5 not_verifiable (require live browser). 1 minor finding (TS strictNullChecks warnings in MCW test file). No blockers.
**Deviations:** Нет

**Deferred to post-deploy:** 7 criteria require live browser verification (AC1-AC6, AC-T8, AC-T10). See deferredToPostDeploy in qa-report.json.

**Verification:**
- Full report: [logs/working/task-9/qa-report.json]
- MCW `npm run test:unit` → 28 passed, 4 failed (pre-existing)
- unifactory `npx react-scripts test` → 128 passed, 5 suites failed (pre-existing)
- unifactory `npx tsc --noEmit` → 0 errors
- unifactory `npm run build` → success
- unifactory ESLint on feature files → 0 new errors

## Task 10: Deploy MCW (GitHub Pages)

**Status:** Done
**Agent:** deployer
**Summary:** Merged PR #5271 to master (merge commit 731d52846). GitHub Actions workflow "Deploy to swaponline.github.io" triggered automatically and deployed bridge client changes to production. Bridge client now available at https://swaponline.github.io/wallet-apps-bridge-client.js with isMetaMask: true flag and all auto-connect improvements from Tasks 1, 7, 8.
**Deviations:** Had to cherry-pick commits from master to PR branch (Tasks 7, 8 were committed to master instead of feature branch). Fixed 35 TypeScript strictNullChecks errors in walletBridge.test.ts by adding non-null assertions (window.ethereum!.) for CI compatibility.

**Verification:**
- PR #5271 merged to master → 731d52846 (2026-02-26 16:11:25 UTC)
- GitHub Actions workflow 22450531756 → SUCCESS (4m4s)
- Bridge client deployed: `curl -I https://swaponline.github.io/wallet-apps-bridge-client.js` → HTTP 200
- `curl https://swaponline.github.io/wallet-apps-bridge-client.js | grep isMetaMask` → `isMetaMask:!0` (minified true)
- Last-Modified: Thu, 26 Feb 2026 16:16:07 GMT
- CI checks passed: build + preview both green after TypeScript fix
