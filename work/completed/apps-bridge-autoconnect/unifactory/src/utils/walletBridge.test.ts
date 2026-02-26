import { detectBridgeMode, loadBridgeClient, waitForBridgeReady } from './walletBridge'

describe('walletBridge', () => {
  const originalLocation = window.location
  const originalParent = window.parent
  const originalEthereum = (window as any).ethereum

  beforeEach(() => {
    // Reset mocks between tests
    jest.restoreAllMocks()
    ;(window as any).ethereum = undefined

    // Reset document head (remove any injected script tags from previous tests)
    document.head.querySelectorAll('script[data-wallet-bridge]').forEach((el) => el.remove())
  })

  afterAll(() => {
    // Restore original values
    Object.defineProperty(window, 'location', { value: originalLocation, writable: true })
    Object.defineProperty(window, 'parent', { value: originalParent, writable: true })
    ;(window as any).ethereum = originalEthereum
  })

  describe('detectBridgeMode', () => {
    function mockLocationSearch(search: string) {
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, search },
        writable: true,
      })
    }

    function mockParent(isIframe: boolean) {
      if (isIframe) {
        // In iframe: window.parent !== window
        Object.defineProperty(window, 'parent', {
          value: {} as Window, // different object than window
          writable: true,
          configurable: true,
        })
      } else {
        // Not in iframe: window.parent === window
        Object.defineProperty(window, 'parent', {
          value: window,
          writable: true,
          configurable: true,
        })
      }
    }

    it('returns isBridgeMode true when URL has walletBridge=swaponline AND in iframe', () => {
      mockLocationSearch('?walletBridge=swaponline')
      mockParent(true)

      const result = detectBridgeMode()
      expect(result.isBridgeMode).toBe(true)
    })

    it('returns isBridgeMode false when URL has param but NOT in iframe', () => {
      mockLocationSearch('?walletBridge=swaponline')
      mockParent(false)

      const result = detectBridgeMode()
      expect(result.isBridgeMode).toBe(false)
    })

    it('returns isBridgeMode false when in iframe but URL has no param', () => {
      mockLocationSearch('')
      mockParent(true)

      const result = detectBridgeMode()
      expect(result.isBridgeMode).toBe(false)
    })

    it('returns isBridgeMode false in standalone mode (no iframe, no param)', () => {
      mockLocationSearch('')
      mockParent(false)

      const result = detectBridgeMode()
      expect(result.isBridgeMode).toBe(false)
    })

    it('returns isBridgeMode false when URL has different walletBridge value', () => {
      mockLocationSearch('?walletBridge=other')
      mockParent(true)

      const result = detectBridgeMode()
      expect(result.isBridgeMode).toBe(false)
    })

    it('handles walletBridge param among other params', () => {
      mockLocationSearch('?foo=bar&walletBridge=swaponline&baz=qux')
      mockParent(true)

      const result = detectBridgeMode()
      expect(result.isBridgeMode).toBe(true)
    })
  })

  describe('loadBridgeClient', () => {
    let appendChildSpy: jest.SpyInstance

    beforeEach(() => {
      appendChildSpy = jest.spyOn(document.head, 'appendChild').mockImplementation((node) => node)
    })

    it('creates script tag with src extracted from referrer host', async () => {
      const promise = loadBridgeClient('https://swaponline.github.io/index.html?foo=bar')

      // Get the script element that was appended
      const scriptEl = appendChildSpy.mock.calls[0][0] as HTMLScriptElement
      expect(scriptEl.tagName).toBe('SCRIPT')
      expect(scriptEl.src).toBe('https://swaponline.github.io/wallet-apps-bridge-client.js')
      expect(scriptEl.getAttribute('data-wallet-bridge')).toBe('true')

      // Simulate script load
      scriptEl.onload?.(new Event('load'))
      await promise
    })

    it('uses fallback URL when referrer is empty', async () => {
      const promise = loadBridgeClient('')

      const scriptEl = appendChildSpy.mock.calls[0][0] as HTMLScriptElement
      expect(scriptEl.src).toBe('https://swaponline.github.io/wallet-apps-bridge-client.js')

      scriptEl.onload?.(new Event('load'))
      await promise
    })

    it('uses fallback URL when referrer is invalid', async () => {
      const promise = loadBridgeClient('not-a-valid-url')

      const scriptEl = appendChildSpy.mock.calls[0][0] as HTMLScriptElement
      expect(scriptEl.src).toBe('https://swaponline.github.io/wallet-apps-bridge-client.js')

      scriptEl.onload?.(new Event('load'))
      await promise
    })

    it('extracts origin from localhost referrer', async () => {
      const promise = loadBridgeClient('http://localhost:9001/some/path')

      const scriptEl = appendChildSpy.mock.calls[0][0] as HTMLScriptElement
      expect(scriptEl.src).toBe('http://localhost:9001/wallet-apps-bridge-client.js')

      scriptEl.onload?.(new Event('load'))
      await promise
    })

    it('rejects when script fails to load', async () => {
      const promise = loadBridgeClient('https://swaponline.github.io')

      const scriptEl = appendChildSpy.mock.calls[0][0] as HTMLScriptElement
      scriptEl.onerror?.(new Event('error'))

      await expect(promise).rejects.toThrow('Failed to load bridge client script')
    })

    it('is idempotent - does not add script if already loaded', async () => {
      // Add a script with data-wallet-bridge attribute to simulate already loaded
      const existingScript = document.createElement('script')
      existingScript.setAttribute('data-wallet-bridge', 'true')
      // Use real appendChild for this setup
      appendChildSpy.mockRestore()
      document.head.appendChild(existingScript)

      // Re-spy after setup
      appendChildSpy = jest.spyOn(document.head, 'appendChild').mockImplementation((node) => node)

      await loadBridgeClient('https://swaponline.github.io')

      // Should not have appended another script
      expect(appendChildSpy).not.toHaveBeenCalled()
    })
  })

  describe('waitForBridgeReady', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('resolves true when window.ethereum.isConnected() returns true immediately', async () => {
      ;(window as any).ethereum = {
        isConnected: () => true,
      }

      const promise = waitForBridgeReady(5000)

      // Advance past the first poll interval
      jest.advanceTimersByTime(100)

      await expect(promise).resolves.toBe(true)
    })

    it('resolves true when bridge becomes ready after polling', async () => {
      let pollCount = 0
      ;(window as any).ethereum = {
        isConnected: () => {
          pollCount++
          return pollCount >= 3 // Ready on 3rd poll
        },
      }

      const promise = waitForBridgeReady(5000)

      // Advance through polls: 100ms * 3 = 300ms
      jest.advanceTimersByTime(100)
      jest.advanceTimersByTime(100)
      jest.advanceTimersByTime(100)

      await expect(promise).resolves.toBe(true)
      expect(pollCount).toBe(3)
    })

    it('rejects after timeout if bridge never becomes ready', async () => {
      ;(window as any).ethereum = {
        isConnected: () => false,
      }

      const promise = waitForBridgeReady(500)

      // Advance past timeout
      jest.advanceTimersByTime(600)

      await expect(promise).rejects.toThrow('Bridge ready timeout after 500ms')
    })

    it('handles window.ethereum not existing gracefully', async () => {
      ;(window as any).ethereum = undefined

      const promise = waitForBridgeReady(300)

      // Advance past timeout
      jest.advanceTimersByTime(400)

      await expect(promise).rejects.toThrow('Bridge ready timeout after 300ms')
    })

    it('handles window.ethereum without isConnected method', async () => {
      ;(window as any).ethereum = {}

      const promise = waitForBridgeReady(300)

      jest.advanceTimersByTime(400)

      await expect(promise).rejects.toThrow('Bridge ready timeout after 300ms')
    })

    it('does not interfere with multiple concurrent calls', async () => {
      let connected = false
      ;(window as any).ethereum = {
        isConnected: () => connected,
      }

      const promise1 = waitForBridgeReady(5000)
      const promise2 = waitForBridgeReady(5000)

      // Make bridge ready after 200ms
      jest.advanceTimersByTime(200)
      connected = true
      jest.advanceTimersByTime(100)

      await expect(promise1).resolves.toBe(true)
      await expect(promise2).resolves.toBe(true)
    })
  })
})
