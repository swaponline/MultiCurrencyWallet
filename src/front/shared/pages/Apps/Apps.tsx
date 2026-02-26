import React, { useEffect, useMemo, useRef } from 'react'
import CSSModules from 'react-css-modules'
import { withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { links } from 'helpers'
import { localisedUrl } from 'helpers/locale'

import styles from './Apps.scss'
import {
  walletAppsCatalog,
  getWalletAppById,
  isAllowedWalletAppUrl,
  resolveWalletAppUrl,
} from './appsCatalog'
import { createWalletAppsBridge } from './walletBridge'

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
    if (bridgeRef.current) {
      bridgeRef.current.destroy()
      bridgeRef.current = null
    }

    if (!needsBridge || !isAllowedAppUrl || !iframeRef.current) {
      return
    }

    bridgeRef.current = createWalletAppsBridge({
      iframe: iframeRef.current,
      appUrl,
    })
    bridgeRef.current.sendReady()

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

  const handleOpenCatalog = () => {
    history.push(localisedUrl(locale, links.apps))
  }

  const handleAppFrameLoad = () => {
    if (bridgeRef.current) {
      bridgeRef.current.sendReady()
    }
  }

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
            {!isAllowedAppUrl && (
              <div styleName="securityNotice">
                <FormattedMessage
                  id="Apps_SecurityNotice"
                  defaultMessage="Blocked by allowlist policy. Add app host to allowlist before embedding."
                />
              </div>
            )}

            {isAllowedAppUrl && (
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
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default withRouter(injectIntl(CSSModules(Apps, styles, { allowMultiple: true })))
