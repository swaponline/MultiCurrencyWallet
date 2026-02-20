# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MultiCurrencyWallet (MCW) is an open-source, client-side crypto wallet with P2P atomic swap exchange. It supports BTC, ETH, BSC, Polygon, Arbitrum, and ERC20/BEP20 tokens. The app runs as a web SPA, Chrome extension, or WordPress widget. A market-maker bot runs server-side via Node.js.

Live demo: https://swaponline.github.io

## Build & Development Commands

```bash
# Development (starts webpack-dev-server via nodemon)
npm run dev                  # testnet, localhost:9001
npm run prod                 # mainnet dev mode

# Production builds (output to build-*/  directories)
npm run build:testnet        # testnet bundle
npm run build:mainnet        # mainnet bundle (NODE_ENV=production)
npm run build:chrome-extension-eth-mainnet  # Chrome extension + zip

# Bot / Market Maker
npm start                    # run bot (mainnet, uses babel-node)
npm run marketmaker          # run as market maker (mainnet)
npm run marketmaker:testnet  # market maker (testnet)

# Core library
npm run core:dev             # watch + transpile swap core
npm run core:build           # one-time transpile swap core

# Type checking
npx tsc --noEmit             # full project type check (tsconfig has noEmit: true)

# Linting
npm run eslint               # ESLint on shared/ (JS only, airbnb rules)
npm run prettier             # format all files

# Testing
npm run test:unit            # Jest unit tests (tests/unit/)
npm run core:test            # Core library tests (src/core/tests/)
npm run test:e2e_swap        # E2E swap tests (Puppeteer)
npm run test:e2e_quick_swap  # E2E quick swap tests

# i18n
npm run messages:extract     # extract react-intl messages
```

## Architecture

### Source Layout

```
src/
├── front/          # React SPA (webpack-built)
│   ├── client/     # Entry point: index.tsx → createRoot() (React 18)
│   ├── config/     # Environment configs (testnet.dev.js, mainnet.prod.js, etc.)
│   ├── shared/     # Main application code
│   │   ├── redux/  # State management (redaction + Redux)
│   │   ├── pages/  # Route-level components (Wallet, Exchange, Swap, etc.)
│   │   ├── components/  # Reusable UI components
│   │   ├── helpers/     # Per-currency helpers + metamask + web3
│   │   └── routes/      # React Router v5 route definitions
│   └── local_modules/   # app-config (env-based config loader), sw-valuelink
├── core/           # P2P swap engine (swap.* modules)
│   ├── swap.app/   # Central singleton wiring env, services, swaps, flows
│   ├── swap.auth/  # Key management per blockchain
│   ├── swap.room/  # libp2p pubsub messaging room
│   ├── swap.orders/ # P2P order book
│   ├── swap.swap/  # Swap state machine (Flow, Steps)
│   ├── swap.swaps/ # Blockchain-specific swap implementations
│   ├── swap.flows/ # Atomic swap flow protocols (BTC2ETH, ETH2BTC, etc.)
│   └── simple/     # High-level API wrapper
├── common/         # Shared between front + bot + core
│   ├── web3connect/     # Wallet connection (MetaMask, WalletConnect)
│   ├── messaging/pubsubRoom/  # libp2p P2P node factory
│   ├── helpers/    # bip44, ethLikeHelper, constants (ABIs, fees)
│   └── utils/      # request, mnemonic, apiLooper
├── bot/            # Market maker bot (runs via babel-node)
└── contracts/      # Smart contract ABIs and addresses
```

### Key Architectural Patterns

**Config system**: `CONFIG` env var (e.g., `testnet.dev`) selects a config file from `src/front/config/` which is deep-merged with `default.js`. The merged config is available as `import config from 'app-config'`.

**State management**: Uses `redaction` (v5), a wrapper around Redux that generates action types from reducer function names. Store created via `createStore`/`combineReducers` from `redaction`, not raw Redux. Only `rememberedSwaps` and `user` slices persist to localStorage.

**Routing**: React Router v5 (`<Switch>`/`<Route>`) with `redux-first-history` syncing browser history to Redux state.

**Module aliases**: Webpack and tsconfig define extensive path aliases — `swap.app`, `swap.flows`, `helpers`, `redux/*`, `components`, `common/*`, etc. Always use aliases, not relative paths to cross boundaries.

**Swap flows**: Atomic swaps are defined as flow classes in `src/core/swap.flows/`. Each flow (e.g., `BTC2ETH`) extends a base atomic flow from `swap.flows/atomic/` and implements step-by-step HTLC exchange logic.

**Web3 providers**: `src/common/web3connect/` manages wallet connections. `InjectedProvider` extends `AbstractConnector` from `@web3-react/abstract-connector` and uses modern `ethereum.request()` API. The `Web3Connect` class in `index.ts` wraps provider lifecycle with events (`connected`, `disconnect`, `accountChange`, `chainChanged`).

**Per-currency actions**: `src/front/shared/redux/actions/` has `ethLikeAction.ts` (base class for all EVM chains) and `erc20LikeAction.ts` (base for all ERC20-like tokens). Individual chain helpers (`btc.ts`, `ghost.ts`, `next.ts`) handle UTXO-based currencies.

### Build System

Custom webpack setup in `webpack/`:
- `common.js` — entry, resolve aliases, polyfills (Buffer, crypto, stream for browser), ProvidePlugin for swap modules
- `development.js` / `production.js` — env-specific (source maps, minification, chunk splitting)
- Build runs via `node src/front/bin/compile` which calls `webpack()` directly
- `ForkTsCheckerWebpackPlugin` runs TS checking as warnings (non-blocking)
- Node.js modules polyfilled for browser: `http`, `https`, `stream`, `assert`, `crypto`, `buffer`

## Code Style

- **No semicolons** (`semi: never`)
- **Single quotes** (`quotes: single`)
- **2-space indent**
- **180 char max line length**
- **Trailing commas** in multiline (`comma-dangle: always-multiline`)
- CSS uses **CSS Modules** via `react-css-modules` with SCSS
- TypeScript: `noImplicitAny: false`, `strictNullChecks: true`, `experimentalDecorators: true`

## Key Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| React | 18.3 | UI (createRoot, concurrent mode) |
| web3 | 1.10 | Ethereum/EVM interaction |
| bitcoinjs-lib | 5.1.6 | Bitcoin transactions |
| libp2p | 0.33 | P2P networking for swap messaging |
| libp2p-gossipsub | | Pubsub for order book |
| redaction | 5 | Redux wrapper (auto action types) |
| react-router-dom | 5.x | Routing (NOT v6) |
| bignumber.js | | Precise crypto arithmetic |
| @walletconnect | 1.3 | WalletConnect v1 |
| patch-package | | Patches applied on `npm install` (see `patches/`) |

## Important Notes

- The `@web3-react/injected-connector` package (v6) is still in devDependencies but **not used** — `InjectedProvider.ts` extends `AbstractConnector` directly to avoid deprecated MetaMask APIs.
- P2P signaling server: `star.wpmix.net` (WebRTC star transport for libp2p).
- The bot uses a separate babel config (`babel.bot.config.js`) and runs via `babel-node`.
- `postinstall` runs `patch-package` — check `patches/` directory for any applied fixes.
- External partner configs live in `src/front/externalConfigs/` and are copied by webpack's `CopyWebpackPlugin`.
