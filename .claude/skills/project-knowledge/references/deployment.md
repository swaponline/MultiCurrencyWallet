# Deployment & Operations

## Purpose
Deployment process, infrastructure, and production operations for AI agents.

---

## Deployment Platform

**Web App:** GitHub Pages (swaponline.github.io)
- **Type:** Static hosting (client-side SPA)
- **Why:** Free, reliable, CDN-backed, no server maintenance, perfect for client-side crypto wallet

**Market-Maker Bot:** Server-side Node.js process
- **Type:** Long-running Node.js process (babel-node)
- **Why:** Provides liquidity for P2P swaps, requires persistent connection to libp2p network
- **Note:** Bot deployment details TBD (currently manual, no automated deployment configured)

---

## Access Information

**SSH Access:** Not applicable (static hosting)

**Credentials location:** GitHub Actions secrets (`buildbot` secret for deploy script)

---

## Environment Variables

**Build-time only (no runtime .env):**
- `CONFIG` - Selects config file from `src/front/config/` (e.g., `testnet.dev`, `mainnet.prod`)
  - Set in: `.github/workflows/deploymaster.yml` (mainnet), local dev via npm scripts
- `NODE_ENV` - `production` for mainnet builds (enables minification)
- `DEBUG` - Enables debug logs (e.g., `app:*,swap.core:*`)

**GitHub Actions secrets:**
- `buildbot` - SSH deploy key for pushing to `swaponline.github.io` repo
  - Used in: `scripts/deploy` (called by deploymaster.yml)
  - To rotate: Generate new SSH key, add to swaponline.github.io deploy keys, update Actions secret

**Client-side config:** RPC endpoints, contract addresses checked into repo at `src/front/config/*.js` (not env vars, part of built bundle)

**Bot config:** `bot-config.json` (not in repo, manual setup on bot server)

<!-- Keep .env.example updated. Comment each variable's purpose in that file. -->

---

## Deployment Triggers

**Production:** Auto-deploy on push to `master` → GitHub Actions runs `scripts/deploy` → builds mainnet bundle → pushes to `swaponline.github.io` repo

**Staging:** Not configured (testnet builds are manual: `npm run build:testnet`)

**Preview:** PR builds run in CI but don't deploy anywhere (just validation)

---

## Pre-Deploy Checklist

Fully automated via CI. Push to `master` → build → deploy → live.

**Manual verification after deploy:**
- [ ] Check https://swaponline.github.io loads
- [ ] Verify wallet creation works (testnet mode recommended first)
- [ ] Check P2P order book connects (libp2p peers visible)

---

## Rollback Procedure

**Platform rollback:** Revert commit on `master` branch → push → CI auto-deploys previous version

**Alternative:** Manually checkout previous commit in `swaponline.github.io` repo and force push

**Approximate time:** ~5 minutes (CI build + deploy)

---

## Environments

**Web App - Production:** https://swaponline.github.io - Deploys from `master` branch (mainnet config)

**Web App - Local testnet:** `npm run dev` - localhost:9001 (testnet RPC endpoints)

**Bot - Production:** Manual deployment (no CI/CD). Run via `npm run marketmaker` (mainnet) or `npm run marketmaker:testnet`

**Bot - Configuration:** Uses `bot-config.json` (not in repo). Requires market-maker wallet with funds for providing liquidity.

<!-- If single environment, only list Production -->

---

## Monitoring & Observability

<!--
SCALING HINT: If this section grows beyond ~80 lines, extract to references/monitoring.md.
If no monitoring configured, write: "Logs output to stdout only. No error tracking configured."
-->

### Logging

**Where:** Browser console only (client-side app)
**Format:** `debug` library with namespaces (`app:*`, `swap.core:*`)

### Error Tracking

**Tool:** None configured
**Config:** Client-side errors stay in browser console, no centralized error tracking

### Health Checks

**Endpoint:** None (static site)
**Checks:** Manual verification: wallet loads, P2P connects, balances fetch

### Metrics

**Analytics:** Not configured (privacy-focused wallet)
**Key metrics:** N/A

### Alerts

**Tool:** None
**Rules:** N/A
