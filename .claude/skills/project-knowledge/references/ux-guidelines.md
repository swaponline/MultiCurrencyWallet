# UX Guidelines

<!--
OPTIONAL FILE — DELETE if project has no significant UI (CLI tools, bots with minimal text, backend-only).
For projects with minimal UI, add a brief "UX" section in patterns.md instead.
-->

## Purpose
UX standards and user-facing communication for AI agents. Helps agents write consistent UI text and follow design patterns.

---

## Interface Language

**Primary language:** English (EN)

**Localization:** Multi-language support via `react-intl`. Translations in `src/front/shared/localisation/*.json`. Supported: EN, RU, NL, ES, PL, PT, AR, DE, FA, KO.

<!-- If multilingual, specify which language is default and where translation files are -->

---

## Tone of Voice

**Overall tone:** Professional and technical, but accessible

**Writing style:** Clear, direct, crypto-focused. Assume users understand basic crypto concepts (wallet, seed phrase, private key). Explain complex operations (atomic swaps, HTLC). Prioritize security warnings. Never downplay risks.

**Voice characteristics:**
- **Formality level:** Professional - use "you" for user, avoid slang, technical terms are OK
- **Emotional tone:** Confident and authoritative - security-first, no fluff
- **Technical complexity:** Balanced - simple for sends/receives, detailed for swaps and advanced features
- **Humor:** None - crypto wallet is serious business, security is critical

**Example phrases by context:**

- ✅ Good: "Save your 12-word seed phrase. You'll need it to restore your wallet."
- ❌ Avoid: "Don't lose this! It's super important! 😱"

- ✅ Good: "Atomic swap in progress. Do not close this window."
- ❌ Avoid: "Hang tight! Your swap is happening..."


---

## Domain Glossary

- **Wallet** — User's crypto storage (NOT "account"). Contains addresses for multiple currencies.
  *UI example: "Create Wallet", "Import Wallet"*

- **Seed phrase / Mnemonic** — 12-word recovery phrase (NOT "password"). Used interchangeably.
  *UI example: "Save your seed phrase", "Enter mnemonic to restore"*

- **Address** — Public blockchain address for receiving funds (NOT "wallet address" - wallet has multiple addresses).
  *UI example: "Your BTC address: bc1q..."*

- **Atomic swap** — P2P trustless exchange via HTLC contracts (NOT "trade" or "exchange").
  *UI example: "Start atomic swap", "Swap BTC for ETH"*

- **Order** — P2P swap offer in decentralized order book (NOT "deal" or "trade offer").
  *UI example: "Create order", "Accept order"*

- **Turbo swap** — Centralized exchange integration (vs atomic swap which is P2P).
  *UI example: "Quick Swap (centralized)" vs "Atomic Swap (P2P)"*

---

## Text Patterns

[How we write specific UI elements - keep examples SHORT]

### Buttons
**Style:** Action verb + object: "Send BTC", "Create Wallet", "Accept Order"

**Examples:**
- Primary actions: "Create Wallet", "Start Swap", "Send"
- Secondary actions: "Cancel", "Back to Wallet"
- Destructive actions: "Delete Wallet" (rare - wallets aren't deleted, keys are)

### Error Messages
**Format:** Problem + what to do: "Insufficient balance. Add more funds or reduce amount."

**Examples:**
- Validation: "Invalid address. Please check and try again."
- Transaction errors: "Transaction failed. Check gas fee and try again."
- Network errors: "Unable to connect to blockchain. Check your connection."

### Success Messages
**Format:** Confirmation + next step or just confirmation for obvious flows

**Examples:**
- "Transaction sent! View in explorer: [link]"
- "Wallet created successfully. Save your seed phrase now."
- "Order created. Waiting for peer to accept."

### Loading States
**Style:** Present continuous: "Loading...", "Sending transaction...", "Waiting for confirmation..."

**Examples:**
- "Loading balance..."
- "Broadcasting transaction..."
- "Connecting to P2P network..."

---

## Copy Reference

**Location:** All UI text in `src/front/shared/localisation/en.json` (and other language files). Extract messages via `npm run messages:extract`.

<!-- If no separate file, write: "N/A - UI copy defined inline in components" -->

---

## Design System

**Design files:** No centralized design system. Custom React components + CSS Modules (SCSS).

**Color palette:**
- Primary: Brand-specific (varies by deployment - white-label capable)
- Secondary: N/A
- Error/Warning/Success: Standard red/yellow/green

**Key components:**
- Custom modal system
- Crypto-specific components: CurrencyIcon, AddressDisplay, BalanceCard
- Form components with validation
- QR code scanner for addresses

<!-- Only include if there are custom visual elements. If using standard framework components, write: "Standard [framework name] components with default theme" -->

---

## Accessibility

**Requirements:**
- Forms use explicit `<label>` elements
- Icon-only buttons have aria-labels
- Critical actions (send, swap) require explicit confirmation
- Security warnings use high-contrast colors
- Seed phrase display uses monospace font for readability

<!-- If following standard a11y practices with no special requirements, write: "Follow standard WCAG 2.1 AA guidelines" -->
