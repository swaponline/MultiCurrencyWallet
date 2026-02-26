/* eslint-disable no-await-in-loop */
const { createBrowser, importWallet, timeOut, takeScreenshot, testWallets } = require('./utils')

jest.setTimeout(360_000) // 6 minutes

/**
 * Helper: Wait for bridge provider to become connected inside the iframe.
 * Polls iframe's window.ethereum.isConnected() every 500ms up to `timeoutMs`.
 *
 * Uses page.frames() API to access cross-origin iframe content.
 *
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @param {string} iframeUrlPattern - Substring to match in iframe URL
 * @param {number} timeoutMs - Maximum wait time in milliseconds
 * @returns {Promise<import('puppeteer').Frame>} The iframe frame handle
 */
async function waitForBridgeReady(page, iframeUrlPattern, timeoutMs = 10_000) {
  const pollInterval = 500
  const maxAttempts = Math.ceil(timeoutMs / pollInterval)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const iframeHandle = page.frames().find((f) => f.url().includes(iframeUrlPattern))

    if (iframeHandle) {
      try {
        const isConnected = await iframeHandle.evaluate(() => {
          return typeof window.ethereum !== 'undefined' && window.ethereum.isConnected()
        })

        if (isConnected) {
          return iframeHandle
        }
      } catch (e) {
        // Frame may not be ready yet or context destroyed — retry
      }
    }

    await timeOut(pollInterval)
  }

  throw new Error(`Bridge not ready after ${timeoutMs}ms: window.ethereum.isConnected() did not return true`)
}

/**
 * Helper: Find the iframe frame handle by URL pattern.
 * Waits for iframe to appear in page.frames() up to timeoutMs.
 *
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @param {string} iframeUrlPattern - Substring to match in iframe URL
 * @param {number} timeoutMs - Maximum wait time in milliseconds
 * @returns {Promise<import('puppeteer').Frame>} The iframe frame handle
 */
async function waitForIframeFrame(page, iframeUrlPattern, timeoutMs = 30_000) {
  const pollInterval = 1_000
  const maxAttempts = Math.ceil(timeoutMs / pollInterval)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const iframeHandle = page.frames().find((f) => f.url().includes(iframeUrlPattern))

    if (iframeHandle) {
      return iframeHandle
    }

    await timeOut(pollInterval)
  }

  throw new Error(`Iframe with URL pattern "${iframeUrlPattern}" not found after ${timeoutMs}ms`)
}

/**
 * Helper: Check if a wallet modal is visible inside the iframe.
 * Checks multiple possible selectors used by dApps for wallet selection modals.
 *
 * @param {import('puppeteer').Frame} iframeHandle - Puppeteer frame handle for the iframe
 * @returns {Promise<boolean>} true if any wallet modal selector is visible
 */
async function isWalletModalVisible(iframeHandle) {
  try {
    const isVisible = await iframeHandle.evaluate(() => {
      const selectors = [
        '.wallet-modal',
        '[data-testid="wallet-modal"]',
        '[class*="WalletModal"]',
        '[class*="walletModal"]',
        '[class*="wallet-modal"]',
        '[class*="ConnectModal"]',
        '[class*="connectModal"]',
      ]

      for (const selector of selectors) {
        const el = document.querySelector(selector)
        if (el) {
          const style = getComputedStyle(el)
          if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            return true
          }
        }
      }

      return false
    })

    return isVisible
  } catch (e) {
    // Frame context may be destroyed — treat as not visible
    return false
  }
}

/**
 * Helper: Extract Ethereum address from iframe body text.
 *
 * @param {import('puppeteer').Frame} iframeHandle - Puppeteer frame handle for the iframe
 * @returns {Promise<string|null>} Extracted address or null if not found
 */
async function extractAddressFromIframe(iframeHandle) {
  try {
    const address = await iframeHandle.evaluate(() => {
      const match = document.body.innerText.match(/0x[a-fA-F0-9]{40}/)
      return match ? match[0] : null
    })

    return address
  } catch (e) {
    return null
  }
}

// DEX iframe URL pattern — Onout DEX loaded via MCW Apps page
const DEX_IFRAME_PATTERN = 'onout.org'

/**
 * Helper: Navigate to Apps page and click the Onout DEX app.
 * Tries multiple selectors to find the DEX app button, with fallback to first app card.
 *
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 */
async function navigateToAppsAndClickDex(page) {
  const baseUrl = page.url().split('#')[0]
  await page.goto(`${baseUrl}#/apps`)
  await timeOut(5_000)

  console.log('Apps page loaded, looking for DEX app button')

  const dexClicked = await page.evaluate(() => {
    const allLinks = Array.from(document.querySelectorAll('a, button, [role="button"], [data-app]'))
    for (const el of allLinks) {
      const text = (el.textContent || '').toLowerCase()
      const href = (el.getAttribute('href') || '').toLowerCase()
      if (text.includes('dex') || text.includes('onout') || href.includes('onout') || href.includes('dex')) {
        el.click()
        return true
      }
    }
    const onoutEl = document.querySelector('[data-href*="onout"], [href*="onout"]')
    if (onoutEl) {
      onoutEl.click()
      return true
    }
    return false
  })

  if (!dexClicked) {
    const firstApp = await page.$('.appCard, [class*="appItem"], [class*="AppCard"]')
    if (firstApp) {
      await firstApp.click()
      console.log('Clicked first app card as fallback')
    } else {
      throw new Error('Could not find DEX app button on Apps page')
    }
  } else {
    console.log('DEX app button clicked')
  }

  await timeOut(3_000)
}

describe('Apps Bridge Auto-Connect', () => {

  it('Happy Path - wallet connected, auto-connect succeeds', async () => {
    const { browser, page } = await createBrowser()
    const arrOfWords = testWallets.eth.seedPhrase.split(' ')
    const expectedAddress = testWallets.eth.address

    try {
      console.log('Apps Bridge Auto-Connect: Happy Path test starting')

      // Step 1: Import test wallet
      await importWallet({
        page,
        seed: arrOfWords,
      })
      await timeOut(10_000)

      console.log('Wallet imported, navigating to Apps page')

      // Step 2-3: Navigate to #/apps and click DEX app
      await navigateToAppsAndClickDex(page)

      // Step 4: Wait for iframe to appear
      console.log('Waiting for DEX iframe to load')
      const iframeFrame = await waitForIframeFrame(page, DEX_IFRAME_PATTERN, 30_000)
      console.log(`DEX iframe found: ${iframeFrame.url()}`)

      // Step 5: Wait for bridge to become ready (poll isConnected)
      console.log('Waiting for bridge to become connected (up to 10 seconds)')
      const connectedFrame = await waitForBridgeReady(page, DEX_IFRAME_PATTERN, 10_000)
      console.log('Bridge connected successfully')

      // Step 6: Check that wallet modal is NOT visible
      const modalVisible = await isWalletModalVisible(connectedFrame)
      console.log(`Wallet modal visible: ${modalVisible}`)
      expect(modalVisible).toBe(false)

      // Step 7: Extract address from iframe body text
      const extractedAddress = await extractAddressFromIframe(connectedFrame)
      console.log(`Extracted address from iframe: ${extractedAddress}`)
      expect(extractedAddress).not.toBeNull()

      // Step 8: Compare extracted address to test wallet address (case-insensitive)
      expect(extractedAddress.toLowerCase()).toBe(expectedAddress.toLowerCase())
      console.log(`Address matches test wallet: ${expectedAddress}`)

      // Step 9: Take success screenshot
      await takeScreenshot(page, 'AppsBridgeAutoConnect_HappyPath_Success')
      console.log('Happy Path test PASSED')

    } catch (error) {
      console.error('Apps Bridge Auto-Connect Happy Path error:', error)
      await takeScreenshot(page, 'AppsBridgeAutoConnect_HappyPath_Error')
      expect(false).toBe(true)
    } finally {
      await browser.close()
    }
  })

  it('No Wallet Fallback - modal appears when no wallet connected', async () => {
    const { browser, page } = await createBrowser()

    try {
      console.log('Apps Bridge Auto-Connect: No Wallet Fallback test starting')

      // Step 1: DO NOT import wallet — skip importWallet
      // Wait for initial page load
      await timeOut(10_000)

      console.log('Navigating to Apps page without wallet')

      // Step 2-3: Navigate to #/apps and click DEX app
      await navigateToAppsAndClickDex(page)

      // Step 4: Wait for iframe to load
      console.log('Waiting for DEX iframe to load')
      const iframeFrame = await waitForIframeFrame(page, DEX_IFRAME_PATTERN, 30_000)
      console.log(`DEX iframe found: ${iframeFrame.url()}`)

      // Step 5: Wait 5 seconds for bridge ready timeout
      // Without a connected wallet, bridge should timeout and dApp should show modal
      console.log('Waiting 5 seconds for bridge timeout (no wallet connected)')
      await timeOut(5_000)

      // Step 6: Check that wallet modal IS visible
      const modalVisible = await isWalletModalVisible(iframeFrame)
      console.log(`Wallet modal visible: ${modalVisible}`)
      expect(modalVisible).toBe(true)

      // Step 7: Take screenshot
      await takeScreenshot(page, 'AppsBridgeAutoConnect_NoWalletFallback_Success')
      console.log('No Wallet Fallback test PASSED')

    } catch (error) {
      console.error('Apps Bridge Auto-Connect No Wallet Fallback error:', error)
      await takeScreenshot(page, 'AppsBridgeAutoConnect_NoWalletFallback_Error')
      expect(false).toBe(true)
    } finally {
      await browser.close()
    }
  })
})
