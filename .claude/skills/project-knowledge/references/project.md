# Project Context

## Purpose
This file provides high-level project overview for AI agents. Helps agents understand WHAT we're building and WHY.

---

## Project Overview

**Name:** MultiCurrencyWallet (MCW)

**Description:** Open-source, client-side crypto wallet with P2P atomic swap exchange for BTC, ETH, BSC, Polygon, Arbitrum, and ERC20/BEP20 tokens.

Runs as a web SPA, Chrome extension, or WordPress widget. Includes a server-side market-maker bot. All keys and sensitive data stay client-side — no backend custody.

---

## Target Audience

**Primary users:** Crypto users who need multi-currency storage and trustless P2P exchange. Integrators (developers/projects) who want to embed a white-label crypto wallet into their product.

**Use case:** Store BTC + EVM assets in one wallet, trade peer-to-peer via atomic swaps without centralized exchange, integrate wallet functionality into WordPress sites or custom applications.

---

## Core Problem

Centralized exchanges require users to deposit funds (custody risk), pay high fees, and trust intermediaries with KYC data. Existing wallets either support limited currencies or require users to trust a backend service with private keys.

We solve this by providing a client-side wallet supporting multiple blockchains + P2P atomic swaps — users retain full control of keys, trade directly peer-to-peer via HTLC smart contracts, and pay only blockchain fees.

---

## Key Features

- **Multi-currency wallet** - BTC, ETH, BSC, Polygon, Arbitrum + ERC20/BEP20 tokens with unified interface
- **Atomic swaps** - Trustless P2P exchange via HTLC smart contracts (BTC ↔ ETH, ETH ↔ ERC20, etc.)
- **P2P order book** - Decentralized order matching via libp2p gossipsub, no central server
- **Wallet Apps** - Integrated dApps (DEX, DeFi protocols) in iframe with EIP-1193 bridge for seamless wallet connection, no modal popups
- **Client-side keys** - Private keys never leave the browser/extension, derived from mnemonic phrase
- **Multiple deployment modes** - Web SPA (GitHub Pages), Chrome extension, WordPress widget, embeddable iframe

<!--
Feature backlog, detailed roadmap, and development phases live in the project backlog
(see CLAUDE.md for backlog path), not here. This file is a stable overview.
-->

---

## Out of Scope

- **Native mobile apps** - Currently web/extension only (mobile support via responsive web). Native iOS/Android apps are planned (see Issue #5270) but not yet implemented
- **Centralized order matching** - No server-side order book or matching engine, only P2P via libp2p
- **Fiat on/off ramps** - Third-party integration (itez.com) exists but not built-in
- **Account/user system** - No backend accounts or authentication, wallet-only (keys are identity)
- **Real-time price feeds** - Market data fetched from external APIs, no internal price oracle

<!-- Add more items as needed -->
