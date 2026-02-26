# Decisions Log: native-mobile-wallet

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

## Task 1: Android Project Setup

**Status:** Done
**Commit:** 7450be9f0, 268eca7c6
**Agent:** project-setup-android
**Summary:** Created multi-module Android Gradle project in android/ with 9 modules (:app, :core:crypto, :core:storage, :core:auth, :core:network, :core:btc, :core:evm, :feature:dapp-browser, :feature:walletconnect). Configured Hilt DI, Jetpack Compose BOM 2024.02.00, all dependencies from tech-spec, network_security_config.xml with cleartextTrafficPermitted=false, GitHub Actions CI, and BouncyCastle resolution strategy (bcprov-jdk18on:1.77) to resolve bitcoinj/web3j conflict.
**Deviations:** WalletConnect sign version changed from spec 2.28.0 to 2.31.0 because 2.28.0 does not exist on Maven Central. Closest compatible version used.

**Reviews:**

*Round 1:*
- code-reviewer: 4 findings (2 low, 2 info) → [logs/working/task-1/code-reviewer-round1.json]
- security-auditor: 5 findings (all positive/info) → [logs/working/task-1/security-auditor-round1.json]
- infrastructure-reviewer: 5 findings (1 medium accepted, 2 low, 2 info) → [logs/working/task-1/infrastructure-reviewer-round1.json]

*Round 2 (after fixes):*
- code-reviewer: OK → [logs/working/task-1/code-reviewer-round2.json]
- security-auditor: OK → [logs/working/task-1/security-auditor-round2.json]
- infrastructure-reviewer: OK → [logs/working/task-1/infrastructure-reviewer-round2.json]

**Verification:**
- `./gradlew assembleDebug` → BUILD SUCCESSFUL, APK produced (67MB)
- network_security_config.xml present with cleartextTrafficPermitted=false
- All 9 modules defined in settings.gradle.kts
- AndroidManifest.xml references networkSecurityConfig

## Task 3: Secure Storage + App Password

**Status:** Done
**Commit:** 5c357ef08, e83d6f5b9
**Agent:** storage-engineer
**Summary:** Implemented SecureStorage class in :core:storage wrapping EncryptedSharedPreferences (AES256-GCM values, AES256-SIV keys, Android KeyStore MasterKey). Stores mnemonic (space-separated), BTC/ETH private keys, bcrypt password hash, WalletConnect sessions, and active chain ID. KeyStore corruption detected via dual SecurityException/GeneralSecurityException catch, clears all storage and throws KeyStoreCorruptionException. Used private primary constructor + @Inject secondary constructor pattern for Hilt DI with internal createForTesting() factory for unit test access.
**Deviations:** None. All 6 storage keys and corruption handling match task spec exactly.

**Reviews:**

*Round 1:*
- code-reviewer: 1 low finding (unused import, fixed) → [logs/working/task-3/code-reviewer-task3-round1.json]
- security-auditor: OK (all positive/info) → [logs/working/task-3/security-auditor-task3-round1.json]
- test-reviewer: OK (22/22 tests, all TDD anchors present) → [logs/working/task-3/test-reviewer-task3-round1.json]

**Verification:**
- `./gradlew :core:storage:test` → BUILD SUCCESSFUL, 22 tests passed (debug + release)
- KeyStore corruption tests pass with "Wallet data corrupted, please reimport your seed phrase" message verified
- Password hash test verifies $2a$12$ prefix
