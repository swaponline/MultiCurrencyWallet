import React, { useEffect, useMemo, useRef, useState } from 'react'
import CSSModules from 'react-css-modules'
import { withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { links } from 'helpers'
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
  const [bridgeEnabled, setBridgeEnabled] = useState(false)

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
  const hasProvider = hasExternalEip1193Provider()

  useEffect(() => {
    if (bridgeRef.current) {
      bridgeRef.current.destroy()
      bridgeRef.current = null
    }

    if (!needsBridge || !isAllowedAppUrl || !iframeRef.current) {
      setBridgeEnabled(false)
      return
    }

    bridgeRef.current = createWalletAppsBridge({
      iframe: iframeRef.current,
      appUrl,
    })
    bridgeRef.current.sendReady()
    setBridgeEnabled(true)

    return () => {
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
                {needsBridge && hasProvider && bridgeEnabled && (
                  <div styleName="bridgeNotice success">
                    <FormattedMessage
                      id="Apps_BridgeEnabled"
                      defaultMessage="Wallet bridge is enabled (MVP protocol)."
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
