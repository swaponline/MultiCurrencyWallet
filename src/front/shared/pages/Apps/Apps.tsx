import React, { useEffect, useMemo, useRef, useState } from 'react'
import CSSModules from 'react-css-modules'
import { withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { links, metamask } from 'helpers'
import { localisedUrl } from 'helpers/locale'

import styles from './Apps.scss'
import {
  walletAppsCatalog,
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
    if (!routeAppId) {
      return undefined
    }

    return getWalletAppById(routeAppId)
  }, [routeAppId])

  useEffect(() => {
    if (routeAppId && !getWalletAppById(routeAppId)) {
      history.replace(localisedUrl(locale, links.apps))
    }
  }, [routeAppId, history, locale])

  const appUrl = selectedApp ? resolveWalletAppUrl(selectedApp) : ''
  const isAllowedAppUrl = selectedApp ? isAllowedWalletAppUrl(appUrl) : false
  const needsBridge = selectedApp?.walletBridge === 'eip1193'

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

  const handleOpenCatalog = () => {
    history.push(localisedUrl(locale, links.apps))
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
        {!selectedApp && (
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
        )}

        {!selectedApp && (
          <section styleName="appsCatalogGrid">
            {walletAppsCatalog.map((app) => (
              <button
                key={app.id}
                type="button"
                styleName="appTile"
                onClick={() => handleOpenApp(app.id)}
              >
                <div styleName="appIconWrap">
                  <span styleName="appIconFallback">{app.iconSymbol || app.title.charAt(0)}</span>
                </div>
                <div styleName="appTileTitle">{app.title}</div>
                {app.isInternal && (
                  <span styleName="appLabel">
                    <FormattedMessage
                      id="Apps_Internal"
                      defaultMessage="Internal"
                    />
                  </span>
                )}
              </button>
            ))}
          </section>
        )}

        {selectedApp && (
          <>
            <section styleName="appsSwitchRow">
              <button
                type="button"
                styleName="appsBackButton"
                onClick={handleOpenCatalog}
              >
                <FormattedMessage
                  id="Apps_AllApps"
                  defaultMessage="All apps"
                />
              </button>
              {walletAppsCatalog.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  styleName={`appTab ${app.id === selectedApp.id ? 'isSelected' : ''}`}
                  onClick={() => handleOpenApp(app.id)}
                >
                  <span styleName="appTabIcon">
                    {app.iconSymbol || app.title.charAt(0)}
                  </span>
                  <span styleName="appTabText">{app.menuTitle || app.title}</span>
                </button>
              ))}
            </section>

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
          </>
        )}
      </section>
    </div>
  )
}

export default withRouter(injectIntl(CSSModules(Apps, styles, { allowMultiple: true })))
