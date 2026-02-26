# Architecture

## Purpose
Technical architecture overview for AI agents. Helps agents understand HOW the system is built.

---

## Tech Stack

**Frontend:** React 18.3 with Webpack 5
- **Why:** Mature ecosystem for crypto UI, concurrent mode for better UX, extensive module aliases for clean imports

**Backend:** None for wallet app (client-side only). Optional market-maker bot runs on Node.js with Express.
- **Why:** Client-side execution eliminates custody risk. Bot provides optional liquidity for P2P swaps.

**Database:** None (client-side localStorage + IndexedDB for swap history)
- **Why:** Decentralized architecture — no server-side user data storage

<!-- Add other stack components if needed: Mobile, Desktop, etc -->

---

## Project Structure

```
/
├── src/
│   ├── front/              # React SPA (wallet UI)
│   │   ├── client/         # Entry point: index.tsx → createRoot()
│   │   ├── config/         # Environment configs (testnet.dev.js, mainnet.prod.js)
│   │   ├── shared/         # Main application code
│   │   │   ├── redux/      # State (redaction v5, NOT raw Redux)
│   │   │   ├── pages/      # Route components (Wallet, Exchange, Swap, Apps)
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── helpers/    # Per-currency blockchain helpers
│   │   │   └── routes/     # React Router v5 routes
│   │   └── local_modules/  # app-config, sw-valuelink
│   ├── core/               # P2P swap engine (blockchain-agnostic)
│   │   ├── swap.app/       # Central singleton (wires services, swaps, flows)
│   │   ├── swap.auth/      # Key management per blockchain
│   │   ├── swap.room/      # libp2p pubsub room
│   │   ├── swap.orders/    # P2P order book
│   │   ├── swap.swaps/     # Blockchain-specific swap implementations
│   │   └── swap.flows/     # Atomic swap protocols (BTC2ETH, ETH2BTC)
│   ├── common/             # Shared between front + bot + core
│   │   ├── web3connect/    # Wallet connection (MetaMask, WalletConnect)
│   │   ├── messaging/      # libp2p P2P node factory
│   │   └── helpers/        # bip44, ethLikeHelper, constants (ABIs, fees)
│   ├── bot/                # Market maker bot (runs via babel-node)
│   └── contracts/          # Smart contract ABIs + addresses
├── tests/                  # Jest unit + Puppeteer E2E tests
├── webpack/                # Custom Webpack configs (common, dev, prod)
└── .claude/                # AI agent context
```

---

## Key Dependencies

**Critical packages:**
- `web3@1.10` - Ethereum/EVM interaction (send transactions, contract calls)
- `bitcoinjs-lib@5.1.6` - Bitcoin transactions (UTXO management, signing)
- `libp2p@0.33` + `libp2p-gossipsub` - P2P networking for decentralized order book
- `redaction@5` - Redux wrapper (auto-generates action types from reducer names)
- `react-router-dom@5.x` - Routing (v5, NOT v6 - uses `<Switch>`/`<Route>`)
- `bignumber.js` - Precise crypto arithmetic (avoids floating-point errors)
- `@walletconnect/client@1.3` - WalletConnect v1 integration
- `bip39` + `bip32` - HD wallet key derivation from mnemonic

<!-- Add 3-5 most important dependencies. Skip obvious ones like React, Express basics -->

---

## External Integrations

**Blockchain RPC nodes**
- **Purpose:** Submit transactions and read blockchain state (balances, history)
- **Auth method:** Public RPC endpoints (Infura, Alchemy) or custom nodes, configured in `config.js`

**libp2p signaling server (star.wpmix.net)**
- **Purpose:** WebRTC STAR transport for P2P connections (NAT traversal)
- **Auth method:** None (public relay)

**itez.com**
- **Purpose:** Optional fiat gateway integration (buy crypto with USD/EUR)
- **Auth method:** Third-party redirect, no API keys in codebase

**Block explorers**
- **Purpose:** Transaction status lookups, address history
- **Auth method:** Public APIs (etherscan.io, blockchain.info)

<!-- If no external integrations, write: "None - no external API dependencies" -->

---

## Data Flow

**Wallet creation:** User enters or generates mnemonic → BIP39 seed → BIP44 derivation → private keys for BTC/ETH/etc → stored encrypted in localStorage.

**Transaction send:** User fills form → Redux action → blockchain helper (btc.ts / ethLikeAction.ts) → sign with private key → broadcast via RPC → poll for confirmation → update balance.

**Atomic swap:** User creates order → broadcast to libp2p pubsub → peer accepts → HTLC contract deployed on both chains → secret exchange → funds released.

**dApp integration:** User opens Apps page → clicks dApp card → iframe loads with `?walletBridge=swaponline` param → dApp dynamically loads bridge client from wallet host → bridge client creates EIP-1193 provider → postMessage handshake with wallet → dApp auto-connects to internal wallet → address and balance visible without modal.

**State management:** Redux (via redaction) stores user keys, balances, swap history, order book. Only `rememberedSwaps` and `user` slices persist to localStorage.

<!-- Example: "User submits form → Frontend validates with Zod → POST to /api/users → Backend validates again → Save to PostgreSQL → Return user object → Update UI." -->

---

## Data Model

<!--
This section describes database/storage architecture.
SCALING HINT: If this section grows beyond ~80 lines, extract to a separate references/database.md and link from here.
-->

**Database:** Client-side localStorage + IndexedDB (no server-side database)

### Main Storage

**localStorage (Redux persist)**
- Purpose: Encrypted private keys, wallet settings, remembered swaps
- Key data: `user` slice (mnemonic, addresses, encrypted keys), `rememberedSwaps` (swap history)
- Security: Keys stored encrypted, mnemonic derivable from password

**IndexedDB (swap state)**
- Purpose: Atomic swap state machine data (HTLC contracts, timeouts, secrets)
- Key data: Swap IDs, contract addresses, lock times, secret hashes
- Cleanup: Old completed swaps pruned after 30 days

### Key Constraints

- **localStorage quota:** Browser limit ~5-10MB, exceeded = data loss risk
- **Key uniqueness:** One wallet per mnemonic, addresses derived deterministically
- **No foreign keys:** No relational structure, flat Redux slices

### Migration Strategy

**Tool:** Manual Redux state migrations (version checks in app initialization)

**Process:** On app load, check Redux state version → run migration functions if needed → save new version. No database migrations.

### Sensitive Data

**Sensitive fields:**
- `localStorage.user.mnemonic` - 12/24-word seed phrase (encrypted)
- `localStorage.user.btcPrivateKey` - Bitcoin private key (encrypted)
- `localStorage.user.ethPrivateKey` - Ethereum private key (encrypted)

**Security notes:** All private keys encrypted with user password before localStorage storage. Never sent to server or logged.

<!-- If no sensitive data, write "No PII stored" -->
<!-- If using alternative storage (localStorage, file system, Chrome Storage API), describe it here instead of tables -->
