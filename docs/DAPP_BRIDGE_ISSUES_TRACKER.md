## dApp Bridge Rollout Tracker

Created: 2026-02-26
Related wallet host issue: https://github.com/swaponline/MultiCurrencyWallet/issues/5268

Scope was expanded using `~/onout.org/CLAUDE.md` product/repository list.

| Product | Repository | Issue |
|---|---|---|
| Unifactory (DEX) | `noxonsu/unifactory` | https://github.com/noxonsu/unifactory/issues/242 |
| FarmFactory | `noxonsu/farmfactory` | https://github.com/noxonsu/farmfactory/issues/36 |
| LotteryFactory | `noxonsu/LotteryFactory` | https://github.com/noxonsu/LotteryFactory/issues/71 |
| DAOwidget | `noxonsu/DAOwidget` | https://github.com/noxonsu/DAOwidget/issues/29 |
| CrossChain / AnySwapDashboard | `noxonsu/AnySwapDashboard` | https://github.com/noxonsu/AnySwapDashboard/issues/1 |
| NFTsy | `noxonsu/NFTsy` | https://github.com/noxonsu/NFTsy/issues/10 |
| DeFinance | `noxonsu/definance` | https://github.com/noxonsu/definance/issues/79 |
| IDOFactory / Launchpad | `noxonsu/launchpad` | https://github.com/noxonsu/launchpad/issues/19 |
| White-label DEX | `appsource/dex` | https://github.com/appsource/dex/issues/32 |
| White-label Launchpad | `appsource/launchpad` | https://github.com/appsource/launchpad/issues/16 |
| White-label DAO | `appsource/dao` | https://github.com/appsource/dao/issues/1 |
| White-label CrossChain | `appsource/crosschain` | https://github.com/appsource/crosschain/issues/15 |

Repositories with disabled issues:
- `noxonsu/Lenda` (cannot open issue via GitHub UI/API)
- `appsource/lottery` (cannot open issue via GitHub UI/API)

Common requirements included in every created issue:
- Wallet Apps bridge compatibility in iframe (`#/apps`) with EIP-1193 flow.
- No hard dependency on `isMetaMask`; support standard provider shape.
- Bridge event protocol support (`HELLO`, `REQUEST`, `RESPONSE`, `READY`, `EVENT`).
- Multi-domain wallet-host support (no single hardcoded host).
- Android/iOS webview compatibility checks.
- Mandatory final report with deployed **mainnet URL** for QA.

## Current Progress

- DeFinance dApp bridge implementation PR: https://github.com/noxonsu/definance/pull/80
- Wallet host DeFinance-only scope PR: https://github.com/swaponline/MultiCurrencyWallet/pull/5271
