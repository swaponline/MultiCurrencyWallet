import React, { useEffect, useMemo, useRef, useState } from 'react'
import CSSModules from 'react-css-modules'
import { withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { links, metamask } from 'helpers'
import { localisedUrl } from 'helpers/locale'

import styles from './Apps.scss'
import {
  walletAppsCatalog,
  defaultWalletAppId,
  getWalletAppById,
  isAllowedWalletAppUrl,
  resolveWalletAppUrl,
} from './appsCatalog'
import { createWalletAppsBridge, hasExternalEip1193Provider } from './walletBridge'

type AppsProps = {
  history: any
  match: {
    params: {
      appId?: string
    }
  }
  intl: any
}

const Apps = (props: AppsProps) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const bridgeRef = useRef<any>(null)
  const bridgeHelloTimeoutRef = useRef<any>(null)
  const providerSyncTimerRef = useRef<any>(null)
  const [bridgeEnabled, setBridgeEnabled] = useState(false)
  const [bridgeClientConnected, setBridgeClientConnected] = useState(false)
  const [bridgeHandshakeTimedOut, setBridgeHandshakeTimedOut] = useState(false)
  const [hasProvider, setHasProvider] = useState(hasExternalEip1193Provider())

  const {
    history,
    intl: {
      locale,
    },
    match: {
      params: {
        appId: routeAppId,
      },
    },
  } = props

  const selectedApp = useMemo(() => {
    return getWalletAppById(routeAppId || defaultWalletAppId)
  }, [routeAppId])

  useEffect(() => {
    if (!defaultWalletAppId) {
      return
    }

    if (!routeAppId || !getWalletAppById(routeAppId)) {
      history.replace(localisedUrl(locale, `${links.apps}/${defaultWalletAppId}`))
    }
  }, [routeAppId, history, locale])

  if (!selectedApp) {
    return null
  }

  const appUrl = resolveWalletAppUrl(selectedApp)
  const isAllowedAppUrl = isAllowedWalletAppUrl(appUrl)
  const needsBridge = selectedApp.walletBridge === 'eip1193'

  useEffect(() => {
    const syncProviderState = () => {
      setHasProvider(hasExternalEip1193Provider())
    }

    syncProviderState()

    if (providerSyncTimerRef.current) {
      clearInterval(providerSyncTimerRef.current)
      providerSyncTimerRef.current = null
    }

    providerSyncTimerRef.current = setInterval(syncProviderState, 2000)
    window.addEventListener('focus', syncProviderState)

    if (metamask?.web3connect?.on) {
      metamask.web3connect.on('connected', syncProviderState)
      metamask.web3connect.on('disconnect', syncProviderState)
      metamask.web3connect.on('updated', syncProviderState)
      metamask.web3connect.on('accountChange', syncProviderState)
      metamask.web3connect.on('chainChanged', syncProviderState)
    }

    return () => {
      if (providerSyncTimerRef.current) {
        clearInterval(providerSyncTimerRef.current)
        providerSyncTimerRef.current = null
      }
      window.removeEventListener('focus', syncProviderState)
      if (metamask?.web3connect?.removeListener) {
        metamask.web3connect.removeListener('connected', syncProviderState)
        metamask.web3connect.removeListener('disconnect', syncProviderState)
        metamask.web3connect.removeListener('updated', syncProviderState)
        metamask.web3connect.removeListener('accountChange', syncProviderState)
        metamask.web3connect.removeListener('chainChanged', syncProviderState)
      } else if (metamask?.web3connect?.off) {
        metamask.web3connect.off('connected', syncProviderState)
        metamask.web3connect.off('disconnect', syncProviderState)
        metamask.web3connect.off('updated', syncProviderState)
        metamask.web3connect.off('accountChange', syncProviderState)
        metamask.web3connect.off('chainChanged', syncProviderState)
      }
    }
  }, [])

  useEffect(() => {
    if (bridgeHelloTimeoutRef.current) {
      clearTimeout(bridgeHelloTimeoutRef.current)
      bridgeHelloTimeoutRef.current = null
    }

    if (bridgeRef.current) {
      bridgeRef.current.destroy()
      bridgeRef.current = null
    }

    if (!needsBridge || !isAllowedAppUrl || !iframeRef.current) {
      setBridgeEnabled(false)
      setBridgeClientConnected(false)
      setBridgeHandshakeTimedOut(false)
      return
    }

    bridgeRef.current = createWalletAppsBridge({
      iframe: iframeRef.current,
      appUrl,
      onClientHello: () => {
        setBridgeClientConnected(true)
        setBridgeHandshakeTimedOut(false)
        if (bridgeHelloTimeoutRef.current) {
          clearTimeout(bridgeHelloTimeoutRef.current)
          bridgeHelloTimeoutRef.current = null
        }
      },
    })
    bridgeRef.current.sendReady()
    setBridgeEnabled(true)
    setBridgeClientConnected(false)
    setBridgeHandshakeTimedOut(false)

    bridgeHelloTimeoutRef.current = setTimeout(() => {
      if (bridgeRef.current && !bridgeRef.current.isClientConnected()) {
        setBridgeHandshakeTimedOut(true)
      }
    }, 7000)

    return () => {
      if (bridgeHelloTimeoutRef.current) {
        clearTimeout(bridgeHelloTimeoutRef.current)
        bridgeHelloTimeoutRef.current = null
      }
      if (bridgeRef.current) {
        bridgeRef.current.destroy()
        bridgeRef.current = null
      }
    }
  }, [needsBridge, appUrl, isAllowedAppUrl])

  const handleOpenApp = (id: string) => {
    history.push(localisedUrl(locale, `${links.apps}/${id}`))
  }

  const handleAppFrameLoad = () => {
    if (bridgeRef.current) {
      bridgeRef.current.sendReady()
    }
  }

  useEffect(() => {
    if (bridgeRef.current) {
      bridgeRef.current.sendReady()
    }
  }, [hasProvider])

  return (
    <div className="container">
      <section styleName="appsPage">
        <header styleName="header">
          <h1 styleName="title">
            <FormattedMessage
              id="Apps_Title"
              defaultMessage="Wallet Apps"
            />
          </h1>
          <p styleName="description">
            <FormattedMessage
              id="Apps_Description"
              defaultMessage="Open integrated dApps inside wallet UI for seamless flow."
            />
          </p>
        </header>

        <div styleName="layout">
          <aside styleName="appsCatalog">
            {walletAppsCatalog.map((app) => {
              const isSelected = app.id === selectedApp.id

              return (
                <button
                  key={app.id}
                  type="button"
                  styleName={`appCard ${isSelected ? 'isSelected' : ''}`}
                  onClick={() => handleOpenApp(app.id)}
                >
                  <div styleName="appCardHeader">
                    <h2 styleName="appTitle">{app.title}</h2>
                    {app.isInternal && (
                      <span styleName="appLabel">
                        <FormattedMessage
                          id="Apps_Internal"
                          defaultMessage="Internal"
                        />
                      </span>
                    )}
                  </div>
                  <p styleName="appDescription">{app.description}</p>
                  <div styleName="chains">
                    {app.supportedChains.map((chain) => (
                      <span key={`${app.id}-${chain}`} styleName="chainTag">
                        {chain}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </aside>

          <section styleName="viewer">
            <div styleName="viewerToolbar">
              <div styleName="viewerMeta">
                <h3 styleName="viewerTitle">{selectedApp.title}</h3>
                <a
                  styleName="viewerUrl"
                  href={appUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {appUrl}
                </a>
              </div>
              <a
                styleName="openExternal"
                href={appUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                <FormattedMessage
                  id="Apps_OpenExternal"
                  defaultMessage="Open in new tab"
                />
              </a>
            </div>

            {!isAllowedAppUrl && (
              <div styleName="securityNotice">
                <FormattedMessage
                  id="Apps_SecurityNotice"
                  defaultMessage="Blocked by allowlist policy. Add app host to allowlist before embedding."
                />
              </div>
            )}

            {isAllowedAppUrl && (
              <>
                {needsBridge && !hasProvider && (
                  <div styleName="bridgeNotice warning">
                    <FormattedMessage
                      id="Apps_BridgeExternalWalletRequired"
                      defaultMessage="This app expects wallet bridge. Connect an external EIP-1193 wallet (e.g. MetaMask) in host page."
                    />
                  </div>
                )}
                {needsBridge && hasProvider && bridgeEnabled && !bridgeClientConnected && !bridgeHandshakeTimedOut && (
                  <div styleName="bridgeNotice info">
                    <FormattedMessage
                      id="Apps_BridgeWaitingHandshake"
                      defaultMessage="Waiting dApp bridge handshake..."
                    />
                  </div>
                )}
                {needsBridge && hasProvider && bridgeEnabled && !bridgeClientConnected && bridgeHandshakeTimedOut && (
                  <div styleName="bridgeNotice warning">
                    <FormattedMessage
                      id="Apps_BridgeClientMissing"
                      defaultMessage="Host wallet bridge is ready, but dApp has no client adapter yet. Add wallet-apps bridge client script on dApp side."
                    />
                    {' '}
                    <a href="/wallet-apps-bridge-client.js" target="_blank" rel="noreferrer noopener">
                      /wallet-apps-bridge-client.js
                    </a>
                  </div>
                )}
                {needsBridge && hasProvider && bridgeEnabled && bridgeClientConnected && (
                  <div styleName="bridgeNotice success">
                    <FormattedMessage
                      id="Apps_BridgeEnabled"
                      defaultMessage="Wallet bridge is active. dApp can request accounts/chain/sign via host wallet."
                    />
                  </div>
                )}
                <iframe
                  key={selectedApp.id}
                  ref={iframeRef}
                  title={selectedApp.title}
                  src={appUrl}
                  onLoad={handleAppFrameLoad}
                  styleName="appFrame"
                  sandbox="allow-forms allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                  allow="clipboard-read; clipboard-write"
                />
              </>
            )}
          </section>
        </div>
      </section>
    </div>
  )
}

export default withRouter(injectIntl(CSSModules(Apps, styles, { allowMultiple: true })))
