/* eslint-disable quotes */
import React from 'react'
import { Route } from 'react-router'
import { Switch } from 'react-router-dom'
import { links } from 'helpers'
import { localisePrefix } from 'helpers/locale'

import ScrollToTop from '../components/layout/ScrollToTop/ScrollToTop'

import { isMobile } from 'react-device-detect'

import loadableComponents from "./loadableComponents"

const routes = (
  <ScrollToTop>
    <Switch>
      <Route path={`${localisePrefix}${links.swap}/:buy-:sell/:orderId`} component={loadableComponents.SwapComponent} />

      <Route path={`${localisePrefix}/:ticker(btc|eth)/tx/:tx?`} component={loadableComponents.Transaction} />
      <Route path={`${localisePrefix}/:token(token)/:ticker/tx/:tx?`} component={loadableComponents.Transaction} />
      <Route path={`${localisePrefix}/:ticker(btc|eth)/:address/:action(receive|send)?`} component={loadableComponents.CurrencyWallet} />
      <Route path={`${localisePrefix}/:token(token)/:ticker/:address`} component={loadableComponents.CurrencyWallet} />
      <Route path={`${localisePrefix}/:fullName-wallet/:address?`} component={loadableComponents.CurrencyWallet} />


      <Route path={`${localisePrefix}${links.home}:buy-:sell/:orderId`} component={loadableComponents.Home} />
      <Route path={`${localisePrefix}${links.home}:buy-:sell`} component={loadableComponents.Home} />

      <Route path={`${localisePrefix}${links.exchange}/:sell-to-:buy`} component={loadableComponents.PartialClosure} />
      <Route path={`${localisePrefix}${links.exchange}`} component={loadableComponents.PartialClosure} />

      <Route path={`${localisePrefix}${links.pointOfSell}/:sell-to-:buy`} component={loadableComponents.PointOfSell} />
      <Route path={`${localisePrefix}${links.pointOfSell}`} component={loadableComponents.PointOfSell} />

      <Route path={`${localisePrefix}${links.aboutUs}`} component={loadableComponents.About} />

      <Route path={`${localisePrefix}${links.send}/:currency/:address/:amount`} component={loadableComponents.Wallet} />
      <Route path={`${localisePrefix}${links.wallet}`} component={loadableComponents.Wallet} />


      <Route exact path={`${localisePrefix}${links.createWallet}`} component={loadableComponents.CreateWallet} />
      <Route path={`${localisePrefix}${links.createWallet}${links.home}:currency`} component={loadableComponents.CreateWallet} />

      <Route path={`${localisePrefix}${links.multisign}/btc/:action/:data/:peer`} component={loadableComponents.BtcMultisignProcessor} />
      <Route path={`${localisePrefix}${links.multisign}/btc/:action/:data`} component={loadableComponents.BtcMultisignProcessor} />

      <Route path={`${localisePrefix}${links.createInvoice}/:type/:wallet`} component={loadableComponents.CreateInvoice} />
      {isMobile && (<Route path={`${localisePrefix}${links.invoices}/:type?/:address?`} component={loadableComponents.InvoicesList} />)}
      <Route path={`${localisePrefix}${links.invoice}/:uniqhash?/:doshare?`} component={loadableComponents.Invoice} />

      <Route path={`${localisePrefix}${links.ieo}`} component={loadableComponents.IEO} />
      <Route exact path={`${localisePrefix}${links.notFound}`} component={loadableComponents.NotFound} />
      <Route exact path={`${localisePrefix}${links.home}`} component={loadableComponents.Wallet} />
      {/* В десктоп режиме - история показывается в дизайне кошелька */}
      {!isMobile && (
        <>
          <Route exact path={`${localisePrefix}/:page(invoices)/:type?/:address?`} component={loadableComponents.Wallet} />
          <Route exact path={`${localisePrefix}/:page(history)`} component={loadableComponents.Wallet} />
        </>
      )}
      {isMobile && (
        <>
          <Route exact path={`${localisePrefix}${links.history}/(btc)?/:address?`} component={loadableComponents.History} />
          <Route exact path={`${localisePrefix}/:page(invoices)/:type?/:address?`} component={loadableComponents.History} />
        </>
      )}

      <Route path={`${localisePrefix}${links.currencyWallet}`} component={loadableComponents.Wallet} />
      <Route path={`${localisePrefix}${links.home}:currency`} component={loadableComponents.Currency} />

      <Route component={loadableComponents.NotFound} />
    </Switch>
  </ScrollToTop>
)

export default routes
