/* eslint-disable quotes */
import React from 'react'
import { Route } from 'react-router'
import { Switch } from 'react-router-dom'
import { links } from 'helpers'
import { localisePrefix } from 'helpers/locale'

import SwapComponent from 'pages/Swap/Swap'
import Home from 'pages/Home/Home'
import History from 'pages/History/History'
import CreateWallet from 'pages/CreateWallet/CreateWallet'
import NotFound from 'pages/NotFound/NotFound'
import About from 'pages/About/About'
import Wallet from 'pages/Wallet/Wallet'
import Currency from 'pages/Currency/Currency'
import PartialClosure from 'pages/PartialClosure/PartialClosure'
import PointOfSell from 'pages/PointOfSell/PointOfSell'
import CurrencyWallet from 'pages/CurrencyWallet/CurrencyWallet'
import Transaction from 'pages/Transaction/Transaction'
import IEO from 'pages/IEO/IEO'
import BtcMultisignProcessor from 'pages/Multisign/Btc/Btc'

import CreateInvoice from 'pages/Invoices/CreateInvoice'
import InvoicesList from 'pages/Invoices/InvoicesList'
import Invoice from 'pages/Invoices/Invoice'

import config from 'helpers/externalConfig'

import ScrollToTop from '../components/layout/ScrollToTop/ScrollToTop'
import SaveMnemonicModal from "components/modals/SaveMnemonicModal/SaveMnemonicModal"
import SaveKeysModal from "components/modals/SaveKeysModal/SaveKeysModal"
import CreditCardDeposit from "components/modals/CreditCardDeposit/CreditCardDeposit"
import { isMobile } from 'react-device-detect'


const routes = (
  <ScrollToTop>
    <Switch>
      <Route path={`${localisePrefix}${links.swap}/:buy-:sell/:orderId`} component={SwapComponent} />

      <Route path={`${localisePrefix}/:ticker(btc|eth)/tx/:tx?`} component={Transaction} />
      <Route path={`${localisePrefix}/:token(token)/:ticker/tx/:tx?`} component={Transaction} />
      <Route path={`${localisePrefix}/:ticker(btc|eth)/:address/:action(receive|send)?`} component={CurrencyWallet} />
      <Route path={`${localisePrefix}/:token(token)/:ticker/:address`} component={CurrencyWallet} />
      <Route path={`${localisePrefix}/:token(token)/:ticker/:address/withdraw`} component={CurrencyWallet} />
      <Route path={`${localisePrefix}/:fullName-wallet/:address?`} component={CurrencyWallet} />

      <Route path={`${localisePrefix}${links.home}:buy-:sell/:orderId`} component={Home} />
      <Route path={`${localisePrefix}${links.home}:buy-:sell`} component={Home} />

      <Route path={`${localisePrefix}${links.exchange}/:sell-to-:buy`} component={PartialClosure} />
      <Route path={`${localisePrefix}${links.exchange}`} component={PartialClosure} />

      <Route path={`${localisePrefix}${links.pointOfSell}/:sell-to-:buy`} component={PointOfSell} />
      <Route path={`${localisePrefix}${links.pointOfSell}`} component={PointOfSell} />

      <Route path={`${localisePrefix}${links.aboutUs}`} component={About} />

      <Route path={`${localisePrefix}${links.send}/:currency/:address/:amount`} component={Wallet} />
      <Route path={`${localisePrefix}${links.wallet}`} component={Wallet} />

      <Route exact path={`${localisePrefix}${links.createWallet}`} component={CreateWallet} />
      <Route path={`${localisePrefix}${links.createWallet}${links.home}:currency`} component={CreateWallet} />

      <Route path={`${localisePrefix}${links.multisign}/btc/:action/:data/:peer`} component={BtcMultisignProcessor} />
      <Route path={`${localisePrefix}${links.multisign}/btc/:action/:data`} component={BtcMultisignProcessor} />

      <Route path={`${localisePrefix}${links.createInvoice}/:type/:wallet`} component={CreateInvoice} />
      {isMobile && <Route path={`${localisePrefix}${links.invoices}/:type?/:address?`} component={InvoicesList} />}
      <Route path={`${localisePrefix}${links.invoice}/:uniqhash?/:doshare?`} component={Invoice} />
      <Route path={`${localisePrefix}${links.creditCardDeposit}/:address?`} component={CreditCardDeposit} />

      <Route path={`${localisePrefix}${links.savePrivateSeed}`} component={SaveMnemonicModal} />
      <Route path={`${localisePrefix}${links.savePrivateKeys}`} component={SaveKeysModal} />

      <Route path={`${localisePrefix}${links.ieo}`} component={IEO} />
      <Route exact path={`${localisePrefix}${links.notFound}`} component={NotFound} />
      <Route exact path={`${localisePrefix}${links.home}`} component={Wallet} />
      {/* В десктоп режиме - история показывается в дизайне кошелька */}
      {!isMobile && (
        <>
          <Route exact path={`${localisePrefix}/:page(invoices)/:type?/:address?`} component={Wallet} />
          <Route exact path={`${localisePrefix}/:page(history)`} component={Wallet} />
        </>
      )}
      {isMobile && (
        <>
          <Route exact path={`${localisePrefix}${links.history}/(btc)?/:address?`} component={History} />
          <Route exact path={`${localisePrefix}/:page(invoices)/:type?/:address?`} component={History} />
        </>
      )}
      <Route path={`${localisePrefix}${links.currencyWallet}`} component={Wallet} />
      <Route path={`${localisePrefix}${links.home}:currency`} component={Currency} />

      <Route component={NotFound} />
    </Switch>
  </ScrollToTop>
)

export default routes
