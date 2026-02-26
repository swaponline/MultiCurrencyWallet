/**
 * Unit tests for MCW wallet-apps-bridge-client.js
 *
 * Tests the EIP-1193 bridge provider that communicates with the MCW wallet
 * host via postMessage. The bridge client is an IIFE that only runs inside
 * an iframe (window.parent !== window), so we mock the iframe context and
 * re-evaluate the script for each test to get a clean provider instance.
 */
import * as fs from 'fs'
import * as path from 'path'

const BRIDGE_SOURCE_HOST = 'swap.wallet.apps.bridge.host'
const BRIDGE_SOURCE_CLIENT = 'swap.wallet.apps.bridge.client'

// Read the bridge client source once (from the feature branch file on disk)
const bridgeClientPath = path.resolve(
  __dirname,
  '../../src/front/client/wallet-apps-bridge-client.js'
)
const bridgeClientSource = fs.readFileSync(bridgeClientPath, 'utf-8')

/**
 * Helper: set up iframe context mocks and evaluate bridge client IIFE.
 * Returns the mocked postMessage spy for assertions.
 */
function initBridgeClient(): jest.Mock {
  // Mock window.parent to simulate iframe context
  const postMessageMock = jest.fn()
  const fakeParent = { postMessage: postMessageMock } as unknown as Window

  Object.defineProperty(window, 'parent', {
    value: fakeParent,
    writable: true,
    configurable: true,
  })

  // Ensure window.ethereum is absent so injectProvider() injects unconditionally
  // (the bridge client injects when !window.ethereum OR forceBridge query param)
  delete (window as any).ethereum

  // Evaluate the IIFE — it will inject window.ethereum
  // eslint-disable-next-line no-eval
  eval(bridgeClientSource)

  return postMessageMock
}

/**
 * Helper: simulate a message from the host (parent window) to the bridge client.
 */
function sendHostMessage(
  type: string,
  payload: Record<string, unknown>,
  source?: Window
) {
  const event = new MessageEvent('message', {
    data: {
      source: BRIDGE_SOURCE_HOST,
      type,
      payload,
    },
    source: source || window.parent,
    origin: 'https://swaponline.github.io',
  })

  window.dispatchEvent(event)
}

describe('WalletAppsBridge Client', () => {
  let postMessageMock: jest.Mock

  beforeEach(() => {
    jest.useFakeTimers()

    // Clean up any previous provider
    delete (window as any).ethereum
    delete (window as any).swapWalletAppsBridgeProvider

    postMessageMock = initBridgeClient()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()

    // Restore window.parent to self (default JSDOM behavior)
    Object.defineProperty(window, 'parent', {
      value: window,
      writable: true,
      configurable: true,
    })

    delete (window as any).ethereum
    delete (window as any).swapWalletAppsBridgeProvider
  })

  describe('Provider Properties', () => {
    it('sets isSwapWalletAppsBridge to true', () => {
      expect(window.ethereum!.isSwapWalletAppsBridge).toBe(true)
    })

    it('sets isMetaMask to true for dApp wallet UI recognition', () => {
      expect(window.ethereum!.isMetaMask).toBe(true)
    })

    it('initializes chainId as null before READY', () => {
      expect(window.ethereum!.chainId).toBeNull()
    })

    it('initializes selectedAddress as null before READY', () => {
      expect(window.ethereum!.selectedAddress).toBeNull()
    })

    it('isConnected returns false before READY', () => {
      expect(window.ethereum!.isConnected()).toBe(false)
    })

    it('exposes provider on window.swapWalletAppsBridgeProvider', () => {
      expect((window as any).swapWalletAppsBridgeProvider).toBe(
        window.ethereum
      )
    })
  })

  describe('HELLO -> READY Handshake', () => {
    it('sends BRIDGE_HELLO immediately on initialization', () => {
      // The IIFE sends HELLO right away, before the interval kicks in
      const helloCalls = postMessageMock.mock.calls.filter(
        (call: unknown[]) =>
          (call[0] as Record<string, unknown>).type === 'WALLET_APPS_BRIDGE_HELLO'
      )
      expect(helloCalls.length).toBeGreaterThanOrEqual(1)

      const helloMsg = helloCalls[0][0] as Record<string, unknown>
      expect(helloMsg.source).toBe(BRIDGE_SOURCE_CLIENT)
      expect(helloMsg.type).toBe('WALLET_APPS_BRIDGE_HELLO')
      expect((helloMsg.payload as Record<string, unknown>).version).toBe('1.0.0')
    })

    it('retries HELLO on interval until READY received', () => {
      // Clear initial call count
      const initialCount = postMessageMock.mock.calls.filter(
        (call: unknown[]) =>
          (call[0] as Record<string, unknown>).type === 'WALLET_APPS_BRIDGE_HELLO'
      ).length

      // Advance timer by 750ms (one interval)
      jest.advanceTimersByTime(750)

      const afterOneInterval = postMessageMock.mock.calls.filter(
        (call: unknown[]) =>
          (call[0] as Record<string, unknown>).type === 'WALLET_APPS_BRIDGE_HELLO'
      ).length

      expect(afterOneInterval).toBeGreaterThan(initialCount)
    })

    it('stops HELLO retries after READY message', () => {
      sendHostMessage('WALLET_APPS_BRIDGE_READY', {
        providerAvailable: true,
        chainId: '0x1',
        accounts: ['0xabcdef1234567890abcdef1234567890abcdef12'],
        methods: [],
        methodPrefixes: [],
      })

      postMessageMock.mockClear()

      // Advance several intervals — no more HELLO should be sent
      jest.advanceTimersByTime(750 * 5)

      const helloCalls = postMessageMock.mock.calls.filter(
        (call: unknown[]) =>
          (call[0] as Record<string, unknown>).type === 'WALLET_APPS_BRIDGE_HELLO'
      )
      expect(helloCalls.length).toBe(0)
    })

    it('updates provider properties from READY payload', () => {
      const testAddress = '0x1234567890abcdef1234567890abcdef12345678'
      const testChainId = '0x38'

      sendHostMessage('WALLET_APPS_BRIDGE_READY', {
        providerAvailable: true,
        chainId: testChainId,
        accounts: [testAddress],
        methods: ['eth_accounts'],
        methodPrefixes: ['eth_'],
      })

      expect(window.ethereum!.chainId).toBe(testChainId)
      expect(window.ethereum!.selectedAddress).toBe(testAddress)
      expect(window.ethereum!.isConnected()).toBe(true)
    })

    it('emits connect event with chainId on READY', () => {
      const connectHandler = jest.fn()
      window.ethereum!.on('connect', connectHandler)

      sendHostMessage('WALLET_APPS_BRIDGE_READY', {
        providerAvailable: true,
        chainId: '0x1',
        accounts: ['0xabc0000000000000000000000000000000000001'],
        methods: [],
        methodPrefixes: [],
      })

      expect(connectHandler).toHaveBeenCalledWith({ chainId: '0x1' })
    })

    it('emits accountsChanged and chainChanged on READY', () => {
      const accountsHandler = jest.fn()
      const chainHandler = jest.fn()

      window.ethereum!.on('accountsChanged', accountsHandler)
      window.ethereum!.on('chainChanged', chainHandler)

      const accounts = ['0xabc0000000000000000000000000000000000002']

      sendHostMessage('WALLET_APPS_BRIDGE_READY', {
        providerAvailable: true,
        chainId: '0x5',
        accounts,
        methods: [],
        methodPrefixes: [],
      })

      expect(accountsHandler).toHaveBeenCalledWith(accounts)
      expect(chainHandler).toHaveBeenCalledWith('0x5')
    })
  })

  describe('Request Forwarding', () => {
    beforeEach(() => {
      // Complete handshake first
      sendHostMessage('WALLET_APPS_BRIDGE_READY', {
        providerAvailable: true,
        chainId: '0x1',
        accounts: ['0xabc0000000000000000000000000000000000003'],
        methods: [],
        methodPrefixes: [],
      })
      postMessageMock.mockClear()
    })

    it('forwards eth_accounts request via postMessage and resolves with result', async () => {
      const expectedAccounts = ['0xabc0000000000000000000000000000000000003']

      const requestPromise = window.ethereum!.request({
        method: 'eth_accounts',
      })

      // Find the request message
      const requestCall = postMessageMock.mock.calls.find(
        (call: unknown[]) =>
          (call[0] as Record<string, unknown>).type === 'WALLET_APPS_BRIDGE_REQUEST'
      )
      expect(requestCall).toBeDefined()

      const requestMsg = requestCall![0] as Record<string, unknown>
      expect(requestMsg.source).toBe(BRIDGE_SOURCE_CLIENT)
      const reqPayload = requestMsg.payload as Record<string, unknown>
      expect(reqPayload.method).toBe('eth_accounts')
      expect(reqPayload.requestId).toBeDefined()

      // Simulate host response
      sendHostMessage('WALLET_APPS_BRIDGE_RESPONSE', {
        requestId: reqPayload.requestId,
        result: expectedAccounts,
      })

      const result = await requestPromise
      expect(result).toEqual(expectedAccounts)
    })

    it('forwards eth_requestAccounts via enable() method', async () => {
      const expectedAccounts = ['0xabc0000000000000000000000000000000000004']

      const enablePromise = window.ethereum!.enable()

      const requestCall = postMessageMock.mock.calls.find(
        (call: unknown[]) =>
          (call[0] as Record<string, unknown>).type === 'WALLET_APPS_BRIDGE_REQUEST'
      )
      expect(requestCall).toBeDefined()

      const reqPayload = (requestCall![0] as Record<string, unknown>)
        .payload as Record<string, unknown>
      expect(reqPayload.method).toBe('eth_requestAccounts')

      sendHostMessage('WALLET_APPS_BRIDGE_RESPONSE', {
        requestId: reqPayload.requestId,
        result: expectedAccounts,
      })

      const result = await enablePromise
      expect(result).toEqual(expectedAccounts)
    })

    it('forwards request via legacy send() method', async () => {
      const sendPromise = window.ethereum!.send('eth_chainId')

      const requestCall = postMessageMock.mock.calls.find(
        (call: unknown[]) =>
          (call[0] as Record<string, unknown>).type === 'WALLET_APPS_BRIDGE_REQUEST'
      )
      expect(requestCall).toBeDefined()

      const reqPayload = (requestCall![0] as Record<string, unknown>)
        .payload as Record<string, unknown>
      expect(reqPayload.method).toBe('eth_chainId')

      sendHostMessage('WALLET_APPS_BRIDGE_RESPONSE', {
        requestId: reqPayload.requestId,
        result: '0x1',
      })

      const result = await sendPromise
      expect(result).toBe('0x1')
    })

    it('forwards request via sendAsync() with callback', (done) => {
      window.ethereum!.sendAsync(
        { method: 'eth_blockNumber', id: 42 },
        (err: Error | null, response: Record<string, unknown>) => {
          expect(err).toBeNull()
          expect(response.jsonrpc).toBe('2.0')
          expect(response.id).toBe(42)
          expect(response.result).toBe('0xff')
          done()
        }
      )

      const requestCall = postMessageMock.mock.calls.find(
        (call: unknown[]) =>
          (call[0] as Record<string, unknown>).type === 'WALLET_APPS_BRIDGE_REQUEST'
      )

      const reqPayload = (requestCall![0] as Record<string, unknown>)
        .payload as Record<string, unknown>

      sendHostMessage('WALLET_APPS_BRIDGE_RESPONSE', {
        requestId: reqPayload.requestId,
        result: '0xff',
      })
    })

    it('rejects request when method is missing', async () => {
      await expect(
        window.ethereum!.request({})
      ).rejects.toThrow('WalletAppsBridge request requires method')
    })
  })

  describe('Event Forwarding', () => {
    beforeEach(() => {
      sendHostMessage('WALLET_APPS_BRIDGE_READY', {
        providerAvailable: true,
        chainId: '0x1',
        accounts: ['0xabc0000000000000000000000000000000000005'],
        methods: [],
        methodPrefixes: [],
      })
    })

    it('forwards accountsChanged event and updates selectedAddress', () => {
      const handler = jest.fn()
      window.ethereum!.on('accountsChanged', handler)

      const newAccounts = ['0xnew0000000000000000000000000000000000001']
      sendHostMessage('WALLET_APPS_BRIDGE_EVENT', {
        eventName: 'accountsChanged',
        data: newAccounts,
      })

      expect(handler).toHaveBeenCalledWith(newAccounts)
      expect(window.ethereum!.selectedAddress).toBe(newAccounts[0])
    })

    it('forwards chainChanged event and updates chainId', () => {
      const handler = jest.fn()
      window.ethereum!.on('chainChanged', handler)

      sendHostMessage('WALLET_APPS_BRIDGE_EVENT', {
        eventName: 'chainChanged',
        data: '0x38',
      })

      expect(handler).toHaveBeenCalledWith('0x38')
      expect(window.ethereum!.chainId).toBe('0x38')
    })

    it('emits disconnect when accountsChanged receives empty array', () => {
      const disconnectHandler = jest.fn()
      const accountsHandler = jest.fn()

      window.ethereum!.on('disconnect', disconnectHandler)
      window.ethereum!.on('accountsChanged', accountsHandler)

      sendHostMessage('WALLET_APPS_BRIDGE_EVENT', {
        eventName: 'accountsChanged',
        data: [],
      })

      expect(accountsHandler).toHaveBeenCalledWith([])
      expect(disconnectHandler).toHaveBeenCalledWith({
        code: 4900,
        message: 'Wallet disconnected',
      })
      expect(window.ethereum!.selectedAddress).toBeNull()
    })

    it('calls all registered listeners for the same event', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()

      window.ethereum!.on('chainChanged', handler1)
      window.ethereum!.on('chainChanged', handler2)

      sendHostMessage('WALLET_APPS_BRIDGE_EVENT', {
        eventName: 'chainChanged',
        data: '0xa',
      })

      expect(handler1).toHaveBeenCalledWith('0xa')
      expect(handler2).toHaveBeenCalledWith('0xa')
    })

    it('removeListener removes only the specified listener', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()

      window.ethereum!.on('chainChanged', handler1)
      window.ethereum!.on('chainChanged', handler2)
      window.ethereum!.removeListener('chainChanged', handler1)

      sendHostMessage('WALLET_APPS_BRIDGE_EVENT', {
        eventName: 'chainChanged',
        data: '0xb',
      })

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledWith('0xb')
    })

    it('removeAllListeners removes all listeners for given event', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()

      window.ethereum!.on('chainChanged', handler1)
      window.ethereum!.on('chainChanged', handler2)
      window.ethereum!.removeAllListeners('chainChanged')

      sendHostMessage('WALLET_APPS_BRIDGE_EVENT', {
        eventName: 'chainChanged',
        data: '0xc',
      })

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      sendHostMessage('WALLET_APPS_BRIDGE_READY', {
        providerAvailable: true,
        chainId: '0x1',
        accounts: ['0xabc0000000000000000000000000000000000006'],
        methods: [],
        methodPrefixes: [],
      })
      postMessageMock.mockClear()
    })

    it('rejects with error when host sends error response', async () => {
      const requestPromise = window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [{ to: '0x0', value: '0x0' }],
      })

      const requestCall = postMessageMock.mock.calls.find(
        (call: unknown[]) =>
          (call[0] as Record<string, unknown>).type === 'WALLET_APPS_BRIDGE_REQUEST'
      )
      const reqPayload = (requestCall![0] as Record<string, unknown>)
        .payload as Record<string, unknown>

      sendHostMessage('WALLET_APPS_BRIDGE_RESPONSE', {
        requestId: reqPayload.requestId,
        error: {
          code: 4001,
          message: 'User rejected the request',
        },
      })

      try {
        await requestPromise
        // Should not reach here
        expect(true).toBe(false)
      } catch (err: any) {
        expect(err.message).toBe('User rejected the request')
        expect(err.code).toBe(4001)
      }
    })

    it('rejects with timeout after 30 seconds if host never responds', async () => {
      const requestPromise = window.ethereum!.request({
        method: 'eth_getBalance',
        params: ['0x0', 'latest'],
      })

      // Advance past the 30-second timeout
      jest.advanceTimersByTime(30001)

      await expect(requestPromise).rejects.toThrow('WalletAppsBridge timeout')
    })

    it('ignores messages from non-parent sources', () => {
      const handler = jest.fn()
      window.ethereum!.on('chainChanged', handler)

      // Simulate message from a different source (not parent window)
      const event = new MessageEvent('message', {
        data: {
          source: BRIDGE_SOURCE_HOST,
          type: 'WALLET_APPS_BRIDGE_EVENT',
          payload: { eventName: 'chainChanged', data: '0x99' },
        },
        source: window, // self, not parent
        origin: 'https://swaponline.github.io',
      })

      window.dispatchEvent(event)

      expect(handler).not.toHaveBeenCalled()
    })

    it('ignores messages with wrong bridge source identifier', () => {
      const handler = jest.fn()
      window.ethereum!.on('chainChanged', handler)

      const event = new MessageEvent('message', {
        data: {
          source: 'some.other.source',
          type: 'WALLET_APPS_BRIDGE_EVENT',
          payload: { eventName: 'chainChanged', data: '0x99' },
        },
        source: window.parent,
        origin: 'https://swaponline.github.io',
      })

      window.dispatchEvent(event)

      expect(handler).not.toHaveBeenCalled()
    })
  })
})
