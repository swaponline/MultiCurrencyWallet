## Wallet Apps Bridge (EIP-1193 over postMessage)

For full dApp integration guide (Safe Apps comparison, Uniswap notes, security checklist), see:

- `/docs/WALLET_APPS_DAPP_GUIDE.md`

This project includes host-side Wallet Apps bridge for `#/apps/:appId` and a client-side shim script:

- Host bridge: `src/front/shared/pages/Apps/walletBridge.ts`
- dApp client shim (public build file): `/wallet-apps-bridge-client.js`

### Why this is needed

External cross-origin iframe cannot directly access host `window.ethereum`.
To reuse the same wallet inside embedded dApp, dApp must include bridge client shim.

### Feature flag

Wallet Apps UI is disabled by default.

- Host flag: `config.opts.ui.apps.enabled = false` (default)
- Runtime override: `window.SO_WalletAppsEnabled = true`

### dApp integration steps (required on dApp side)

1. Include bridge client script before app bundle:

```html
<script src="https://<wallet-host>/wallet-apps-bridge-client.js"></script>
```

2. Keep using standard injected wallet flow (`window.ethereum` / EIP-1193).

3. Open dApp in wallet with query flag (already set for Onout DEX in catalog):

```text
?walletBridge=swaponline
```

### Message protocol

- Client -> Host:
  - `WALLET_APPS_BRIDGE_HELLO`
  - `WALLET_APPS_BRIDGE_REQUEST` (`{ requestId, method, params }`)
- Host -> Client:
  - `WALLET_APPS_BRIDGE_READY`
  - `WALLET_APPS_BRIDGE_RESPONSE` (`{ requestId, result|error }`)
  - `WALLET_APPS_BRIDGE_EVENT` (`accountsChanged`, `chainChanged`)

### Current limits

- Methods are filtered by host policy (`eth_*`, `wallet_*`, `personal_*`, plus `net_version` / `web3_clientVersion`; `eth_subscribe` disabled).
- Bridge forwards to active host EIP-1193 provider (connected `web3connect` provider first, then injected `window.ethereum` fallback).
- If dApp does not include shim, connect inside iframe will not pick host wallet.
