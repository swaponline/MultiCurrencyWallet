---
# Creation date (YYYY-MM-DD)
created: 2026-02-26

# Status: draft | approved
status: draft

# Work type: feature | bug | refactoring
type: feature

# Feature size: S (1-3 files, local fix) | M (several components) | L (new architecture) | XL (new product)
size: XL
---

# User Spec: Native Mobile Wallet (Android)

## Что делаем

Создаём нативное Android приложение (Kotlin + Jetpack Compose) — крипто-кошелек с встроенным dApp браузером. Приложение поддерживает BTC + EVM сети (ETH/BSC/Polygon) + токены, работает как Web3 provider (инъекция window.ethereum в WebView), поддерживает WalletConnect v2 для подключения к внешним dApps. iOS версия "существует" но развертывается под конкретного клиента (out of scope для MVP).

## Зачем

**Для кого:** B2B decision makers (компании покупающие white-label решения), end users (держатели крипто-активов на мобильных устройствах).

**Проблема:** Мобильная веб-версия не поддерживает биометрическую разблокировку (FaceID/TouchID), что снижает trust factor для end users. B2B клиенты отклоняют сделки (lost revenue) из-за отсутствия нативного мобильного приложения — веб-версия воспринимается ненадёжной для хранения средств.

**Решение:** Нативное Android приложение с биометрической разблокировкой увеличивает trust factor для end users (безопасное хранение seed phrase в encrypted storage), снимает blocker для B2B сделок (клиенты получают white-label nativeapp для брендирования), увеличивает стоимость продукта.

## Как должно работать

### Создание кошелька
1. Пользователь открывает приложение → нажимает "Create Wallet"
2. Система генерирует 12 слов (BIP39 mnemonic), показывает на экране с предупреждением "Write down and save"
3. Пользователь подтверждает что записал (checkbox "I saved my seed phrase")
4. Система показывает проверку: "Enter word #3, #7, #11" (3 случайных позиции из 12)
5. Если пользователь ввёл правильно → система запрашивает создать app password (6+ characters alphanumeric, для fallback когда biometrics unavailable), затем деривирует BTC/ETH/BSC/Polygon адреса (BIP44), шифрует ключи в EncryptedSharedPreferences, показывает Wallet screen
6. Если неправильно → "Incorrect words, try again" (до 3 попыток, потом заново показать 12 слов)

**Edge cases:**
- User backs out during seed phrase confirmation → return to seed display screen, words remain the same (no re-generation)
- App killed during key derivation → on restart, no wallet created, user starts from beginning
- User enters extra whitespace in word confirmation → system trims whitespace before validation
- Device runs out of entropy → fallback to SecureRandom (Android default), log warning

### Импорт кошелька
1. Пользователь нажимает "Import Wallet" → вводит 12 слов
2. Система валидирует: длина = 12, слова из BIP39 wordlist, checksum корректный
3. Если валидация прошла → система запрашивает создать app password, затем деривация адресов, шифрование, показ Wallet screen
4. Если ошибка → конкретное сообщение: "Invalid word at position [N]: [word]" / "Invalid seed phrase checksum" / "Must be 12 words, you entered [X]"

**Edge cases:**
- User pastes seed with extra whitespace between words → system trims and normalizes whitespace
- User pastes seed with newlines → system splits by whitespace and newlines, validates word count
- User enters seed in different BIP39 language (e.g., Spanish wordlist) → validation fails with "Invalid word" (only English wordlist supported for MVP)
- Partial paste (6 words instead of 12) → show "Must be 12 words, you entered 6"

### Отправка транзакции
1. Пользователь в Wallet tab → выбирает валюту (BTC/ETH/BSC/Polygon) → нажимает Send
2. Вводит адрес получателя + сумму
3. Система показывает fee options: для BTC (Slow/Normal/Fast sat/byte), для EVM (Gas Price Low/Normal/High)
4. Пользователь выбирает fee → нажимает "Send"
5. Система показывает Biometric Prompt (FaceID/Fingerprint) → "Confirm transaction: send [amount] to [address]"
6. После биометрического подтверждения → система подписывает транзакцию приватным ключом, broadcast в сеть, показывает tx hash

**Edge cases:**
- Amount > balance → show error "Insufficient balance"
- Amount = 0 → show error "Amount must be greater than zero"
- Amount + fee > balance → show error "Insufficient balance to cover amount + fee"
- User pastes BTC address in ETH send flow → validate address format per chain, show error "Invalid ETH address format"
- User pastes own wallet address as recipient → allow (no warning, user may want to consolidate UTXOs or test)
- Gas estimation fails (EVM) → show error "Gas estimation failed: [RPC error message]", allow user to manually set gas limit
- Fee exceeds balance (BTC) → show error "Selected fee exceeds available balance"
- RPC timeout during broadcast → show error "Transaction failed: Network timeout" with Retry button
- Duplicate transaction submission (user taps Send twice) → disable Send button after first tap until broadcast completes or fails
- Invalid address checksum (ETH EIP-55) → show warning "Address checksum invalid, proceed anyway?" (lowercase addresses allowed but warn user)
- Address = empty → disable Send button (validation before allowing Send tap)

### dApp Browser
1. Пользователь переключается на dApps tab → видит карточки: dex.onout.org, app.aave.com
2. Нажимает на dex.onout.org → WebView загружает dApp
3. Нативное приложение инъецирует window.ethereum (реализует все методы: eth_requestAccounts, eth_accounts, eth_chainId, eth_sendTransaction, personal_sign, eth_signTypedData_v4, wallet_switchEthereumChain, wallet_addEthereumChain, события accountsChanged/chainChanged)
4. dApp запрашивает `ethereum.request({ method: 'eth_requestAccounts' })` → нативное приложение показывает "Connect to dex.onout.org?" → пользователь подтверждает
5. dApp запрашивает `eth_sendTransaction` → нативное приложение показывает confirmation dialog с деталями транзакции → после подтверждения подписывает + возвращает tx hash в WebView
6. Пользователь видит текущий подключенный сайт + network icon + favicon + кнопку смены сети (wallet_switchEthereumChain)

**Edge cases:**
- dApp sends unsupported RPC method (e.g., eth_subscribe) → return JSON-RPC error {code: -32601, message: "Method not supported"}
- dApp sends rapid successive eth_sendTransaction requests → queue requests, show confirmation dialogs one by one (no concurrent approvals)
- WebView crashes during dApp interaction → catch exception, log error to crashlytics, show "dApp crashed" dialog with Reload button
- User navigates away from dApp during pending transaction approval → cancel pending approval, return error to dApp
- dApp sends malicious eth_sendTransaction with extremely high gas (> 1M gas) → show warning in confirmation dialog "High gas limit: [value], proceed?"
- User switches networks (wallet_switchEthereumChain) while dApp transaction pending → cancel pending transaction, emit chainChanged event to dApp
- WebView JavaScript bridge message is malformed JSON → log error, ignore message (don't crash app)
- dApp navigation to external domain (e.g., redirect to phishing site) → block navigation, show "External navigation blocked" or whitelist only dex.onout.org and app.aave.com domains

### WalletConnect
1. Пользователь открывает desktop dApp (например, opensea.io) → выбирает "Connect Wallet" → WalletConnect → показывается QR код
2. В mobile app пользователь нажимает "Scan QR" (кнопка в main Wallet screen)
3. Открывается камера → сканирует QR код
4. Система показывает "Connect to opensea.io?" с деталями (site URL, permissions) → пользователь подтверждает
5. WalletConnect v2 session установлен → desktop dApp может отправлять запросы на подпись транзакций → mobile показывает confirmation dialogs

**Edge cases:**
- QR code contains invalid WalletConnect URI → show error "Invalid QR code, please scan a WalletConnect QR"
- Session dropped mid-transaction (network disconnect) → show error "WalletConnect session lost", allow user to reconnect by scanning QR again
- Multiple simultaneous session requests (user scans two QR codes quickly) → queue session approvals, show confirmation dialogs one by one
- WalletConnect relay server unavailable → show error "Failed to connect to WalletConnect relay", retry button
- User rejects connection request → send rejection to dApp, no session created
- Session expires (WalletConnect timeout) → notify user "WalletConnect session expired", remove session from persisted storage

## Критерии приёмки

### Core Wallet
- [ ] Create wallet генерирует валидный BIP39 mnemonic (12 слов)
- [ ] Seed phrase confirmation работает: проверка 3 случайных слов из 12
- [ ] App password creation: user sets password during wallet creation/import (minimum 6 characters alphanumeric), password stored as bcrypt hash in EncryptedSharedPreferences
- [ ] Import wallet валидирует: длину (12 слов), BIP39 wordlist, checksum
- [ ] BIP44 derivation корректный: BTC (m/44'/0'/0'/0/0), ETH (m/44'/60'/0'/0/0), адреса совпадают с веб-версией для того же mnemonic
- [ ] Encrypted storage: mnemonic + private keys зашифрованы в EncryptedSharedPreferences (AES-256-GCM via Android KeyStore)
- [ ] Biometric unlock работает (FaceID/Fingerprint via BiometricPrompt API), fallback to app password if biometric fails 3 times OR device has no biometric hardware

### Balances & Transactions
- [ ] Balances display with correct decimal precision for each currency: BTC (8 decimals), ETH/BSC/Polygon (18 decimals), tokens (per token decimals). Zero balances show as "0.00" not empty. Values match RPC getBalance calls. Fetched from RPC on pull-to-refresh, no persistent caching.
- [ ] Pull-to-refresh обновляет балансы из RPC
- [ ] Send transaction: fee estimation (BTC: sat/byte, EVM: gas price), tx building, signing, broadcast
- [ ] Transaction показывает tx hash после отправки
- [ ] Tx history отображается (fetched from block explorer APIs on-demand, no caching)

### dApp Browser
- [ ] WebView загружает dex.onout.org и app.aave.com
- [ ] window.ethereum injected with methods: eth_requestAccounts returns array with wallet address after user confirms, eth_accounts returns cached address array, eth_chainId returns correct hex chain ID (0x1 for ETH mainnet, 0x38 for BSC, 0x89 for Polygon), eth_sendTransaction shows native confirmation dialog with transaction details (to/value/data) and returns tx hash after signing, personal_sign shows message text and returns signature in 0x... format
- [ ] eth_signTypedData_v4, wallet_switchEthereumChain, wallet_addEthereumChain реализованы
- [ ] Events accountsChanged, chainChanged работают (хотя у нас один адрес и фиксированные сети, dApps могут подписаться)
- [ ] Native confirmation dialog показывается при eth_sendTransaction из dApp
- [ ] Транзакция подписывается нативным кодом (WebView не имеет доступа к приватным ключам)
- [ ] Результат (tx hash или error) возвращается в WebView
- [ ] UI показывает подключенный сайт + network icon + favicon + switcher для chainId

### WalletConnect v2
- [ ] QR scanner открывается по кнопке "Scan QR" в main screen
- [ ] Scan QR код → парсинг WalletConnect URI
- [ ] Connection request показывает site URL + permissions → пользователь подтверждает
- [ ] WalletConnect v2 session устанавливается через public relay servers
- [ ] External dApp может запросить sign transaction → mobile показывает confirmation → подписывает
- [ ] Session persists в EncryptedSharedPreferences

### Settings & Configuration
- [ ] RPC endpoints можно менять в settings (custom RPC URL, chain ID, network name)
- [ ] Fiat currency display (USD only): fetch prices from CoinGecko free API, refresh every 60 seconds while app active, show "N/A" if API unavailable

### White-label
- [ ] App name настраивается через build config (CI/CD env var), application ID может быть изменен
- [ ] Нет хардкода названия "MultiCurrencyWallet" в коде (параметризовано)

### Security & Error Handling

**Positive criteria:**
- [ ] Offline mode: show last known balances (in-memory from previous fetch, NOT persistent cache) with "Last updated" timestamp, disable Send button, show "No internet connection" error when user tries to refresh or send
- [ ] Invalid seed import: shows specific error messages — When seed length != 12: "Must be exactly 12 words, you entered [X]". When word not in BIP39 wordlist: "Invalid word at position [N]: [word]". When checksum fails: "Invalid seed phrase checksum"
- [ ] RPC node unavailable: show error "RPC node unavailable", retry button
- [ ] Transaction broadcast fail: show error message, retry option
- [ ] Biometric fail after 3 attempts OR device has no biometric hardware: fallback to app password (user sets password during wallet creation/import, minimum 6 characters alphanumeric). Password stored as bcrypt hash in EncryptedSharedPreferences.
- [ ] WebView crash: catch exception, log to crashlytics, show "dApp crashed" dialog with Reload button
- [ ] WalletConnect session expire: notify user, allow reconnect

**Negative criteria (failure scenarios):**
- [ ] When user enters incorrect seed word confirmation 3 times: system shows all 12 words again and resets confirmation flow (user must re-confirm from beginning)
- [ ] When transaction broadcast fails due to network error: show error "Transaction failed: [RPC error message]" with Retry button, do NOT mark transaction as sent
- [ ] When WalletConnect QR is invalid (not a valid wc: URI): show error "Invalid QR code, please scan a WalletConnect QR" and return to scanner
- [ ] When RPC returns error for balance fetch: show "Failed to load balance: [error message]" with Retry button, do NOT show stale/cached balance as fresh
- [ ] When user enters wrong app password 5 times: lock app for 60 seconds, show countdown timer "Too many attempts, try again in [X] seconds"
- [ ] When dApp sends malicious transaction with gas > 1M: show warning in confirmation dialog "High gas limit: [value], proceed?" (allow user to review before approving)
- [ ] When EncryptedSharedPreferences decryption fails (corrupted data or KeyStore wiped): show "Wallet data corrupted, please reimport your seed phrase" and clear encrypted storage (force re-import)

### Deployment
- [ ] APK генерируется (debug + release builds)
- [ ] Документация создана: "How to install APK on device" + "How to upload to Google Play Internal Testing"
- [ ] NO auto-upload to Play Console (manual process)

### Observability
- [ ] Crash reporting: Firebase Crashlytics integrated (free tier), catches uncaught exceptions and native crashes
- [ ] Transaction lifecycle logging: structured logs for transaction events (created, signed, broadcast, confirmed/failed) written to logcat + Crashlytics custom logs
- [ ] WebView bridge error logging: log all JS-to-Native communication failures to Crashlytics (malformed JSON, unsupported methods, timeout errors)

## Ограничения

**Платформа:** Android only для MVP. iOS версия "существует" но деплоится под конкретного клиента — это означает что iOS app компилируется и публикуется отдельно для specific B2B client requests (not in public App Store), iOS код и документация остаются в репозитории но не поддерживаются в рамках этого MVP (out of active development scope).

**Сети:** BTC + ETH/BSC/Polygon только. NO Solana, TON, Arbitrum, другие EVM chains out of scope.

**Функциональность:**
- NO atomic swaps (P2P обмен через HTLC) — слишком сложно для MVP
- NO multisig — только single-key wallets
- NO 2FA backend mode — client-side only
- Single wallet: walletNumber=0 hardcoded, пользователь не может создать несколько кошельков из одного seed

**Безопасность (MVP limitations):**
- NO root detection (accepted risk)
- NO screenshot blocking на sensitive screens
- NO clipboard clearing после копирования seed phrase
- NO jailbreak detection

**Data:**
- NO caching балансов и tx history (fetch on-demand to avoid bugs)
- NO cloud backup (пользователь самостоятельно сохраняет seed phrase)

**Budget:** Минимальный бюджет, AI/LLM agents будут поддерживать код (нет dedicated mobile team).

**Deployment:** Google Play Internal Testing only (no public store release в MVP).

**Phasing:** Feature разбит на 3 логические фазы для implementation, но все фазы включены в этот user-spec (shipped together):
- Phase 1 (Core Wallet): create/import wallet, encrypted storage, biometric unlock, balances, send transactions, tx history
- Phase 2 (dApp Browser): WebView с window.ethereum provider, native confirmation dialogs, dex.onout.org + app.aave.com integration
- Phase 3 (WalletConnect v2): QR scanner, WalletConnect wallet SDK, session management, external dApp support

## Риски

- **Риск 1: BIP44 derivation mismatch.** Адреса, сгенерированные в mobile app, не совпадают с адресами из веб-версии для того же mnemonic → пользователь импортирует wallet и не видит свои средства. **Митигация:** Unit tests сравнивающие mobile-generated addresses с web wallet output для одного и того же test mnemonic (BTC/ETH/BSC/Polygon). Cross-platform validation: generate wallet in web → import в mobile → verify addresses match.

- **Риск 2: window.ethereum implementation bugs.** Сложная интеграция JS-to-Native bridge, dApps могут не работать если методы реализованы неправильно. **Митигация:** Reference implementation — изучить MetaMask mobile source code. Тестировать с известными dApps (dex.onout.org, app.aave.com). Unit tests для каждого window.ethereum метода.

- **Риск 3: WalletConnect v2 SDK complexity.** Wallet role отличается от dApp role, документация может быть неполной. **Митигация:** Следовать официальной WalletConnect Kotlin SDK документации для wallet implementation. Тестировать с несколькими external dApps (desktop Uniswap, OpenSea).

- **Риск 4: AI maintenance сложного крипто-кода.** LLM агенты могут вносить баги в критичные части (key derivation, signing). **Митигация:** Extensive unit tests (особенно для crypto logic), clear code comments с ссылками на reference implementations, NO caching (упрощение архитектуры для избежания cache invalidation bugs).

- **Риск 5: Security на rooted devices.** EncryptedSharedPreferences может быть прочитан при root access. **Митигация:** Out of scope для MVP, документировать риск в README, пользователь ответственен за безопасность устройства.

## Технические решения

- Мы решили делать **full native Android rewrite** вместо WebView wrapper, потому что native app "быстрее и круче звучит" (marketing value), даёт возможность сделать native dApp browser с window.ethereum provider, и позволяет добавить WalletConnect wallet integration.

- Мы решили делать **Android only для MVP**, потому что это минимизирует scope и бюджет. iOS "существует" но деплоится под клиента.

- Мы решили **писать код с нуля**, потому что существующий Android код на ветке `feat/android-ci-workflow` содержит критичный баг (неправильный BIP44 derivation, адреса не совпадут с web версией).

- Мы решили поддерживать **single wallet (walletNumber=0)**, потому что это упрощает UX и архитектуру для MVP.

- Мы решили **НЕ кешировать балансы и tx history**, потому что это избегает cache invalidation bugs, упрощает архитектуру для AI maintenance. Fetch from RPC/APIs on-demand (pull-to-refresh).

- Мы решили **НЕ делать advanced security** (root detection, screenshot blocking, clipboard clearing), потому что это MVP focus на функциональность, а не hardening.

- Мы решили **генерировать APK + docs** (no auto-upload to Play Console), потому что минимальный бюджет, manual deployment достаточен для Internal Testing.

## Тестирование

**Unit-тесты:** делаются всегда. Критичные модули:
- BIP44 derivation: unit test с known mnemonic, сравнить mobile-generated addresses с web wallet output для BTC/ETH/BSC/Polygon
- Encryption/decryption: validate EncryptedSharedPreferences работает корректно
- Transaction signing: unit tests для BTC PSBT signing, EVM transaction signing
- window.ethereum methods: mock WebView, unit test каждого метода

**Интеграционные тесты:** делаем. Критичны для crypto wallet.
- Per network: send transaction on testnet (BTC testnet, Goerli/Sepolia for EVM chains)
- Balance fetching: call real RPC nodes, verify response parsing
- Tx history: call block explorer APIs, verify data parsing
- WalletConnect: mock external dApp session (если возможно), или skip integration для WC (только E2E)

**E2E тесты:** делаем smoke tests. Минимальный набор для release:
- Create wallet flow: tap Create → see 12 words → confirm → test 3 random words → success
- Import wallet flow: tap Import → enter 12 words → verify addresses generated
- Send testnet transaction: BTC testnet send → verify tx hash returned, check on explorer
- dApp browser: load dex.onout.org → trigger eth_sendTransaction → confirm → verify tx signed
- WalletConnect: scan test QR (with desktop dApp) → verify connection → sign transaction
- Pull-to-refresh: swipe down → verify balances update

**Cross-platform validation:** Generate wallet in web version → import same mnemonic in mobile → verify all addresses (BTC/ETH/BSC/Polygon) match exactly.

## Как проверить

### Пользователь проверяет

**1. Install APK**
- Download APK на Android device
- Enable "Install from unknown sources" в settings
- Install APK
- Verify app launches

**2. Create wallet flow**
- Tap "Create Wallet"
- Verify 12 words shown
- Save words on paper
- Tap "I saved my seed phrase"
- Enter 3 random words correctly
- Verify Wallet screen appears with BTC/ETH/BSC/Polygon addresses

**3. Import wallet flow (cross-platform validation)**
- In web version: create new wallet, copy 12-word mnemonic
- In mobile app: tap "Import Wallet", paste 12 words
- Verify addresses in mobile app EXACTLY match web version addresses (BTC/ETH/BSC/Polygon)

**4. Send testnet transaction**
- In Wallet tab, select BTC testnet (or Goerli ETH)
- Tap Send, enter test address + small amount
- Select fee (Normal)
- Biometric confirm
- Verify tx hash shown
- Check tx on block explorer (blockcypher.com for BTC, etherscan.io for ETH) — verify tx appears

**5. dApp browser**
- Switch to dApps tab
- Tap dex.onout.org card
- Wait for dApp to load in WebView
- Verify dApp shows "Connect Wallet" button
- Connect wallet, confirm permission
- Try to swap tokens or perform transaction
- Verify native confirmation dialog appears (not dApp's dialog — native Android dialog with tx details)
- Confirm → verify transaction signed + tx hash returned to dApp

**6. WalletConnect**
- On desktop: open https://example.walletconnect.org (test dApp) or opensea.io
- Click "Connect Wallet" → WalletConnect → show QR code
- In mobile app (Wallet tab): tap "Scan QR" button
- Scan QR code with camera
- Verify connection request dialog shows site URL
- Confirm connection
- On desktop dApp: trigger transaction
- Verify mobile app shows confirmation dialog
- Confirm → verify transaction signed

**7. Pull-to-refresh balances**
- In Wallet tab, pull down screen
- Verify balances update (loading indicator appears, then balances refresh)
- Turn on airplane mode → pull to refresh → verify "No internet connection" error shown

**8. Offline mode**
- Enable airplane mode
- Open app → verify last known balances shown (if app already had balances in memory)
- Try to send transaction → verify "No internet" error, Send button disabled

**9. RPC error handling**
- Go to Settings → RPC configuration
- Enter invalid RPC URL (e.g., http://invalid.rpc)
- Try to refresh balances → verify "RPC node unavailable" error shown with retry button

**10. Biometric unlock**
- Close app completely
- Reopen app
- Verify Biometric Prompt appears (FaceID / Fingerprint)
- Confirm with biometrics → app unlocks

**Итог:** Все core flows работают, адреса совпадают с web версией, dApp browser подписывает транзакции, WalletConnect подключается к external dApps.
