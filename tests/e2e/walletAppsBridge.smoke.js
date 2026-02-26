const puppeteer = require("puppeteer")

const PREVIEW_URL = "https://c2f9e9b7.mcw-preview.pages.dev/#/apps"
const SHOT_CATALOG = "/tmp/mcw_apps_catalog.png"
const SHOT_IFRAME = "/tmp/mcw_apps_onout_iframe.png"
const WAIT_BRIDGE_MS = 20000

async function clickOnoutDex(page) {
  await page.waitForSelector("body")

  const clickByText = async (text) => {
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return page.evaluate((reSource) => {
      const re = new RegExp(reSource, "i")
      const clickable = Array.from(document.querySelectorAll("button, a, [role=\"button\"]"))
      const target = clickable.find((el) => re.test((el.textContent || "").trim()))
      if (!target) return false
      target.click()
      return true
    }, escaped)
  }

  if (await clickByText("Onout DEX")) return
  if (await clickByText("Onout")) return

  const clickedByHint = await page.evaluate(() => {
    const clickable = Array.from(document.querySelectorAll("button, a, [role=\"button\"]"))
    const target = clickable.find((el) => {
      const text = (el.textContent || "").toLowerCase()
      const attrs = `${el.getAttribute("href") || ""} ${el.getAttribute("data-testid") || ""} ${el.id || ""}`.toLowerCase()
      return text.includes("dex") || text.includes("onout") || attrs.includes("onout")
    })
    if (!target) return false
    target.click()
    return true
  })

  if (!clickedByHint) {
    const bodyText = await page.evaluate(() => (document.body && document.body.innerText) || "")
    throw new Error(`Cannot click Onout DEX app tile/tab. Body excerpt:\n${bodyText.slice(0, 1200)}`)
  }
}

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  })

  const page = await browser.newPage()
  page.setDefaultTimeout(120000)
  await page.evaluateOnNewDocument(() => {
    window.SO_WalletAppsEnabled = true
    window.SO_AppsHeaderPinned = ["onout-dex"]
    window.SO_ReplaceExchangeWithAppId = "onout-dex"
  })

  try {
    await page.goto(PREVIEW_URL, { waitUntil: "domcontentloaded" })
    await page.waitForSelector("body")
    await page.waitForFunction(() => {
      const text = (document.body && document.body.innerText) || ""
      return text.includes("Wallet Apps") && text.includes("Onout DEX") && !text.includes("Loading...")
    }, { timeout: 120000 })

    const hasWalletAppsHeader = await page.evaluate(() =>
      document.body && document.body.innerText.includes("Wallet Apps")
    )

    await page.screenshot({ path: SHOT_CATALOG, fullPage: true })
    await clickOnoutDex(page)

    await page.waitForSelector("iframe")
    await page.waitForFunction(() => {
      const frame = document.querySelector("iframe")
      return !!(frame && frame.src && frame.src.includes("dex.onout.org"))
    })

    const iframeInfo = await page.$eval("iframe", (el) => {
      const cs = window.getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      return {
        src: el.getAttribute("src"),
        borderTopWidth: cs.borderTopWidth,
        borderStyle: cs.borderStyle,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      }
    })

    await new Promise((resolve) => setTimeout(resolve, WAIT_BRIDGE_MS))

    const frame = page.frames().find((f) => f.url().includes("dex.onout.org"))
    let frameChecks = {
      frameFound: false,
      bridgeProviderExists: false,
      ethereumBridgeFlag: false,
      frameUrl: null,
      search: null,
      isConnected: null,
    }

    if (frame) {
      frameChecks.frameFound = true
      frameChecks.frameUrl = frame.url()
      await frame.waitForSelector("body", { timeout: 60000 })
      const data = await frame.evaluate(() => {
        const provider = window.swapWalletAppsBridgeProvider
        const ethereum = window.ethereum
        let connected = null
        try {
          connected = ethereum && typeof ethereum.isConnected === "function"
            ? ethereum.isConnected()
            : null
        } catch (e) {
          connected = `error:${e && e.message ? e.message : "unknown"}`
        }

        return {
          bridgeProviderExists: !!provider,
          ethereumBridgeFlag: !!(ethereum && ethereum.isSwapWalletAppsBridge),
          search: window.location.search,
          isConnected: connected,
        }
      })
      frameChecks = { ...frameChecks, ...data }
    }

    await page.screenshot({ path: SHOT_IFRAME, fullPage: true })

    const result = {
      url: PREVIEW_URL,
      hasWalletAppsHeader,
      iframeInfo,
      frameChecks,
      screenshots: [SHOT_CATALOG, SHOT_IFRAME],
      success: hasWalletAppsHeader && !!iframeInfo.src && frameChecks.frameFound,
    }

    console.log(JSON.stringify(result, null, 2))
  } finally {
    await browser.close()
  }
}

run().catch((err) => {
  console.error("E2E_FAILED", err && err.stack ? err.stack : err)
  process.exit(1)
})
