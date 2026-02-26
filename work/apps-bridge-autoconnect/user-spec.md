---
created: 2026-02-26
status: draft
type: feature
size: M
---

# User Spec: Apps Bridge Auto-Connect

## Что делаем
Когда пользователь открывает dApp (Onout DEX) через страницу Apps кошелька (#/apps), dApp должен автоматически подключиться к кошельку через EIP-1193 bridge provider — без модалки выбора кошелька. Сейчас bridge инжектит `window.ethereum` в iframe, но dApp его не использует и показывает стандартную модалку wallet selection. Нужны изменения на обеих сторонах: MCW bridge-client (эмуляция MetaMask) и dApp unifactory (динамическая загрузка bridge-клиента и auto-connect логика).

## Зачем
Пользователь уже подключил кошелёк в MCW. Когда он открывает dApp внутри кошелька, повторный запрос подключения — бессмысленное трение. Auto-connect создаёт seamless опыт: открыл dApp → сразу видишь свой адрес и баланс → можно торговать. Это критично для UX встроенных dApps в странице Apps.

## Как должно работать

### Сценарий 1: Happy path (MetaMask подключён в MCW)
1. Пользователь открывает `#/apps` в кошельке
2. Кликает на Onout DEX
3. Открывается iframe с `dex.onout.org?walletBridge=swaponline`
4. dApp обнаруживает `?walletBridge` параметр + контекст iframe
5. dApp динамически загружает `wallet-apps-bridge-client.js` с wallet-хоста (URL из `document.referrer`)
6. Bridge-клиент создаёт `window.ethereum` provider и выполняет handshake с хостом (HELLO → READY)
7. dApp вызывает `useEagerConnect()` → `eth_requestAccounts` → получает адрес от MCW хоста
8. DEX показывает подключённый адрес и баланс — без модалок

### Сценарий 2: MetaMask не подключён в MCW
1. Пользователь открывает DEX через `#/apps`
2. Bridge handshake выполняется, но `eth_accounts` возвращает пустой массив (нет подключённого провайдера на хосте)
3. dApp fallback на стандартный flow — показывает wallet selection modal как обычно

### Сценарий 3: Standalone режим (без iframe)
1. Пользователь открывает `dex.onout.org` напрямую в браузере
2. URL не содержит `?walletBridge` и страница не в iframe
3. Bridge-код не активируется, dApp работает как обычно

### Сценарий 4: Disconnect во время работы
1. Пользователь использует DEX через `#/apps` (подключён)
2. Отключает MetaMask в MCW
3. Bridge хост прокидывает `accountsChanged([])` в iframe
4. DEX обновляет UI — убирает адрес, показывает кнопку Connect

### Сценарий 5: Смена сети
1. Пользователь переключает сеть в MCW (ETH → BSC)
2. Bridge хост прокидывает `chainChanged` event в iframe
3. DEX обновляет контекст сети

## Критерии приёмки
- [ ] AC1: Открыть `#/apps` → Onout DEX → DEX показывает подключённый адрес кошелька без модалок и кнопок подключения
- [ ] AC2: Баланс в DEX соответствует балансу ETH кошелька в MCW
- [ ] AC3: `dex.onout.org` в standalone режиме (без iframe) работает как раньше — стандартный wallet selection flow
- [ ] AC4: Когда MetaMask не подключён в MCW, DEX показывает стандартную модалку выбора кошелька
- [ ] AC5: Смена сети в MCW (chainChanged) отражается в DEX iframe
- [ ] AC6: E2E smoke тест проходит: iframe открывается, bridge detected, адрес отображается

## Ограничения
- **Cross-origin iframe:** postMessage — единственный способ коммуникации между хостом и dApp. Bridge уже использует этот механизм.
- **Standalone совместимость:** Все изменения в dApp (unifactory) не должны ломать работу без iframe. Bridge-код активируется только при наличии `?walletBridge` параметра И контекста iframe (`window !== window.parent`).
- **Свободная модификация dApp:** Код unifactory можно менять свободно. Definance/dex и appsource/dex обновлять не нужно.
- **Безопасность:** Host-side allowlist (EXTERNAL_ALLOWED_HOSTS) ограничивает допустимые URL для iframe. На dApp стороне — проверка iframe контекста + URL параметра. Дополнительная валидация origin хоста не требуется.

## Риски
- **Timing race:** dApp может вызвать `useEagerConnect()` до завершения bridge handshake (HELLO → READY), и `eth_accounts` вернёт пустой массив. **Митигация:** dApp ждёт bridge READY до 5 секунд перед вызовом eager connect. Если таймаут — fallback на стандартный flow.
- **Поломка standalone режима:** Bridge-код может случайно активироваться вне iframe. **Митигация:** Строгая проверка: `?walletBridge` в URL И `window !== window.parent` — оба условия обязательны.
- **Безопасность auto-connect:** Вредоносный iframe может получить доступ к кошельку. **Митигация:** Host-side allowlist разрешает только конкретные домены. Bridge активируется только с явным URL-параметром.

## Технические решения
- Мы решили **загружать bridge-client.js динамически с wallet-хоста** (через `document.referrer`), потому что это не требует копирования кода в dApp репо и всегда использует актуальную версию bridge протокола.
- Мы решили **ставить `isMetaMask: true` на bridge provider**, потому что dApp (unifactory) и web3-react используют этот флаг для определения типа провайдера и отображения MetaMask UI.
- Мы решили **ждать bridge READY до 5 секунд перед eager connect**, потому что postMessage handshake асинхронный и может занять время. 5 секунд — достаточный баланс между UX и надёжностью.
- Мы решили **менять код в обоих репозиториях** (MCW + unifactory), потому что bridge-клиент на MCW стороне нуждается в `isMetaMask: true`, а dApp нуждается в логике загрузки и auto-connect.
- Мы решили **не обновлять definance/dex и appsource/dex**, потому что достаточно unifactory — основного источника кода dApp.
- Мы решили **при отсутствии подключённого кошелька в MCW показывать стандартную DEX модалку**, потому что bridge не может дать accounts без подключённого провайдера на хосте.

## Тестирование

**Unit-тесты:** делаются всегда, не обсуждаются. Покрывают bridge protocol: postMessage handshake, ответ на `eth_requestAccounts`, формат `send()`/`request()`.

**Интеграционные тесты:** не делаем — cross-origin iframe невозможно протестировать через integration tests, только через E2E.

**E2E тесты:** делаем — расширяем существующий Puppeteer smoke (`tests/e2e/walletAppsBridge.smoke.js`). Проверяем: после открытия `#/apps` внутри iframe нет wallet-модалки и есть подключённый адрес.

## Как проверить

### Агент проверяет

| Шаг | Инструмент | Ожидаемый результат |
|-----|-----------|-------------------|
| Запустить E2E smoke тест на PR preview | puppeteer | iframe открывается, bridge provider обнаружен, `isSwapWalletAppsBridge === true` |
| Проверить что `isMetaMask` на bridge provider | puppeteer | `window.ethereum.isMetaMask === true` внутри iframe |
| Запустить unit тесты bridge protocol | jest | Все тесты проходят |

### Пользователь проверяет
- Открыть PR preview `#/apps` → кликнуть Onout DEX → убедиться что кошелёк подключён автоматически (адрес виден, баланс отображается)
- Открыть `dex.onout.org` напрямую (без iframe) → убедиться что работает как раньше (стандартная модалка)
- Переключить сеть в MCW → убедиться что DEX в iframe обновил сеть
