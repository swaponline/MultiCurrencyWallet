# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project

**MultiCurrencyWallet (MCW)** — Open-source, client-side crypto wallet with P2P atomic swap exchange.

Live: https://swaponline.github.io

## Documentation

**Full project documentation:** `.claude/skills/project-knowledge/references/`
- `project.md` — Overview, features, scope
- `architecture.md` — Tech stack, structure, dependencies
- `patterns.md` — Git workflow, code conventions, testing
- `deployment.md` — GitHub Pages deployment, bot deployment
- `ux-guidelines.md` — UI/UX standards, tone, glossary

## Key Commands

- `npm run dev` — Dev server (testnet, localhost:9001)
- `npm run build:mainnet` — Production build
- `npm run test:unit` — Unit tests
- See `package.json` for all commands

## Default Branch

`master`

## 🧠 Project Learnings

Уроки из деплой-сессий, чтобы не повторять:

- **Деплой не считается успешным, пока пользователь не увидел результат.** После SCP/copy и bump `MCWALLET_VER` обязательно открыть live-страницу в браузере и пройти целевой user-flow (Add asset → выбрать монету → Continue → проверить таблицу). `app.js` дошёл и хеш сменился ≠ работает.
- **CDP-тест на чистой вкладке ≠ воспроизведение реальной сессии пользователя.** У пользователя живёт `localStorage.redux-store` от старых билдов с зомби-валютами и SES-локдауном. После каждого деплоя проверять и в инкогнито (чистый state), и в существующей сессии (миграция).
- **Не списывать ошибки в console на «не наша зона».** `pubsubRoom: SwapRoom not ready` оказался не «star.wpmix.net тухлый», а отсутствием `Upgrade`-заголовков в catch-all nginx vhost VM104. До отказа от диагноза — пройти всю цепочку: бандл → nginx VM104 → nginx VM100 → процесс на 127.0.0.1:3000.
- **Перед «всё работает» — спросить у пользователя «что именно не работает»**: какая кнопка, что видно/не видно, какой экран, есть ли ошибки в console. Без этого свой headless-успех ≠ доказательство.
- **WebSocket через nginx требует Upgrade-заголовков.** Catch-all `proxy_pass` ломает WSS. Для любого WSS-эндпоинта — выделенный server-block с `proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection $connection_upgrade; proxy_http_version 1.1`.
- **`curl` для теста WS handshake врёт.** Возвращает 400 даже когда WS работает — потому что не делает реальный handshake. Использовать `node -e "new (require('ws'))(URL)"` или `wscat`.
- **Bundle hash из `ls *.js | head -1` не равен «свежий».** В `vendors/swap/` валяются старые хеши (`0d824a`, `64c3cd`), они отсортируются раньше нового. Для unhashed `app.js`/`vendor.js` копий — брать хеш из свежего `build-mainnet-widget/`, не угадывать grep'ом по продовой директории.
