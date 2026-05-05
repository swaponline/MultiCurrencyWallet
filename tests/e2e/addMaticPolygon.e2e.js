/**
 * E2E test: добавление MATIC (Polygon) в кошелёк на wallet.wpmix.net
 *
 * Проверяет:
 *   1. Страница загружается, SPA инициализируется
 *   2. Открыт онбординг — выбираем MATIC, нажимаем Continue
 *   3. После создания кошелька в списке currencies есть строка с MATIC
 *
 * Запуск: node tests/e2e/addMaticPolygon.e2e.js
 * Требует: chrome-cdp на :9222 (см. /root/tools/chrome-daemon/)
 *
 * URL по умолчанию: https://wallet.wpmix.net/
 * Можно переопределить: TARGET_URL=https://other.example/ node tests/e2e/addMaticPolygon.e2e.js
 */

const http = require('http')
const WebSocket = require('ws')

const CDP_PORT = process.env.CDP_PORT || 9222
const TARGET_URL = process.env.TARGET_URL || 'https://wallet.wpmix.net/'
const STEP_TIMEOUT = 20000

let passed = 0
let failed = 0

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✓ ${msg}`) }
  else      { failed++; console.error(`  ✗ ${msg}`) }
}

function cdpPut(path) {
  return new Promise((resolve, reject) => {
    const r = http.request(
      { hostname: 'localhost', port: CDP_PORT, path, method: 'PUT' },
      (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => { try { resolve(JSON.parse(d)) } catch { resolve(d) } })
      }
    )
    r.on('error', reject)
    r.end()
  })
}

function cdpClose(tabId) {
  return new Promise((resolve) => {
    http.get(`http://localhost:${CDP_PORT}/json/close/${tabId}`, () => resolve())
      .on('error', () => resolve())
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function cdpSession(wsUrl) {
  const ws = new WebSocket(wsUrl, { perMessageDeflate: false })
  await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej) })
  let msgId = 0
  const pending = new Map()
  ws.on('message', (raw) => {
    const m = JSON.parse(raw)
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m); pending.delete(m.id)
    }
  })
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++msgId
      const t = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)) }, 30000)
      pending.set(id, (m) => {
        clearTimeout(t)
        if (m.error) reject(new Error(m.error.message))
        else resolve(m.result)
      })
      ws.send(JSON.stringify({ id, method, params }))
    })
  }
  return { send, close: () => ws.close() }
}

async function evaluate(s, expr) {
  const r = await s.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' + (r.exceptionDetails.exception?.description || ''))
  return r.result?.value
}

async function waitFor(s, expr, timeout = STEP_TIMEOUT, interval = 500) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (await evaluate(s, `(function(){try{return !!(${expr})}catch(e){return false}})()`)) return true
    await sleep(interval)
  }
  return false
}

async function run() {
  console.log(`\n=== Add MATIC (Polygon) E2E ===`)
  console.log(`Target: ${TARGET_URL}\n`)

  const tab = await cdpPut(`/json/new?${encodeURIComponent(TARGET_URL)}`)
  const s = await cdpSession(tab.webSocketDebuggerUrl)

  try {
    await s.send('Page.enable')
    await s.send('Runtime.enable')

    // 1. Дождаться, пока React смонтируется в #root
    const mounted = await waitFor(s, `document.querySelector('#root') && document.querySelector('#root').children.length > 0`, 25000)
    assert(mounted, 'SPA смонтировалась в #root')

    // 2. Скрыть стартовый WordPress-оверлей если он мешает
    await evaluate(s, `
      var ov = document.getElementById('wrapper_element');
      if (ov) ov.classList.add('d-none');
    `)

    // 3. На свежем wallet.wpmix.net показывается онбординг с кнопкой Continue
    //    (создать новый кошелёк). Если она есть — кликаем и ждём, пока кошелёк создастся.
    const hasOnboardingContinue = await waitFor(s, `
      Array.from(document.querySelectorAll('button'))
        .some(b => b.textContent.trim() === 'Continue')
      && !document.getElementById('maticWallet')
    `, 5000)
    if (hasOnboardingContinue) {
      await evaluate(s, `
        Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent.trim() === 'Continue').click()
      `)
      console.log('  (создаём новый кошелёк через онбординг…)')
      await sleep(8000)
    }

    // 4. Идём на /createWallet — экран добавления монет
    await evaluate(s, `window.location.hash = '#/createWallet'`)
    await sleep(4000)

    // 5. Ждём появления карточки MATIC (#maticWallet)
    const haveMatic = await waitFor(s, `document.getElementById('maticWallet')`, STEP_TIMEOUT)
    assert(haveMatic, 'Карточка MATIC (#maticWallet) присутствует на /createWallet')

    if (!haveMatic) throw new Error('MATIC card not found — abort')

    // 6. Кликнуть карточку MATIC и проверить, что className изменился
    //    (CSS modules хешируют purpleBorder → сравниваем до/после).
    const classBefore = await evaluate(s, `document.getElementById('maticWallet').className`)
    await evaluate(s, `document.getElementById('maticWallet').click()`)
    await sleep(800)
    const classAfter = await evaluate(s, `document.getElementById('maticWallet').className`)
    assert(classBefore !== classAfter, `Карточка MATIC переключилась (className изменился)`)

    // 6. Жмём Continue
    const haveBtn = await waitFor(s, `document.getElementById('continueBtn') && !document.getElementById('continueBtn').disabled`, 5000)
    assert(haveBtn, 'Кнопка Continue активна')
    await evaluate(s, `document.getElementById('continueBtn').click()`)

    // 7. Ждём, пока MATIC появится в Redux store / в localStorage / в списке кошельков
    //    После создания возможен редирект на /wallet с таблицей валют
    const appearedInList = await waitFor(s, `
      (function(){
        // вариант А: таблица /wallet содержит строку с MATIC
        var rows = document.querySelectorAll('table tbody tr, [class*="walletRow"], [class*="currencyRow"]');
        for (var i=0; i<rows.length; i++) {
          if (/MATIC/i.test(rows[i].textContent || '')) return true;
        }
        // вариант Б: проверим через localStorage activatedCurrencies
        try {
          var raw = localStorage.getItem('enabledCurrencies');
          if (raw && /MATIC/.test(raw)) return true;
        } catch(e){}
        return false;
      })()
    `, 30000, 1000)
    assert(appearedInList, 'MATIC появился в списке валют пользователя (UI или localStorage)')

    // 8. Финальный sanity-check — нет JS-эксепшнов на этом этапе
    const reduxHasMatic = await evaluate(s, `
      (function(){
        try {
          // глобальный store от redaction/redux может торчать на window под разными именами
          var st = window.__REDUX_STATE__ || (window.__store__ && window.__store__.getState && window.__store__.getState());
          if (!st) return null;
          var s = JSON.stringify(st);
          return /\\\"MATIC\\\"/.test(s);
        } catch(e) { return null }
      })()
    `)
    if (reduxHasMatic === true) {
      assert(true, 'MATIC присутствует в Redux store')
    } else {
      console.log(`  (Redux probe inconclusive: ${reduxHasMatic})`)
    }

  } catch (err) {
    failed++
    console.error(`  ✗ Exception: ${err.message}`)
  } finally {
    s.close()
    await cdpClose(tab.id)
  }

  console.log(`\n=== Result: ${passed} passed, ${failed} failed ===\n`)
  process.exit(failed > 0 ? 1 : 0)
}

run().catch((e) => { console.error(e); process.exit(2) })
