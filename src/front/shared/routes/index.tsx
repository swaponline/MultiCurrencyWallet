import React from 'react'
import { isMobile } from 'react-device-detect'

import { Switch, Route } from 'react-router-dom'

import { links } from 'helpers'
import { localisePrefix } from 'helpers/locale'
import Farm from 'pages/Farm'
import LocalStorage from 'pages/LocalStorage/LocalStorage'
import SwapComponent from 'pages/Swap/Swap'
import TurboSwap from 'pages/TurboSwap/TurboSwap'
import History from 'pages/History/History'
import CreateWallet from 'pages/CreateWallet/CreateWallet'
import NotFound from 'pages/NotFound/NotFound'
import About from 'pages/About/About'
import Wallet from 'pages/Wallet/Wallet'
import Currency from 'pages/Currency/Currency'
import Exchange from 'pages/Exchange/Exchange'
import CurrencyWallet from 'pages/CurrencyWallet/CurrencyWallet'
import Transaction from 'pages/Transaction/Transaction'
import BtcMultisignProcessor from 'pages/Multisign/Btc/Btc'

import MarketmakerPromo from 'pages/Marketmaker/MarketmakerPromo'
import MarketmakerSettings from 'pages/Marketmaker/MarketmakerSettings'

import CreateInvoice from 'pages/Invoices/CreateInvoice'
import InvoicesList from 'pages/Invoices/InvoicesList'
import Invoice from 'pages/Invoices/Invoice'

import ScrollToTop from 'components/layout/ScrollToTop/ScrollToTop'
import SaveMnemonicModal from 'components/modals/SaveMnemonicModal/SaveMnemonicModal'
import SaveKeysModal from 'components/modals/SaveKeysModal/SaveKeysModal'

import RestoryMnemonicWallet from 'components/modals/RestoryMnemonicWallet/RestoryMnemonicWallet'


const routes = (
  <ScrollToTop>
    <Switch>
      <Route exact path={`${localisePrefix}/:page(exit)`} component={Wallet} />

      <Route path={`${localisePrefix}${links.atomicSwap}/:orderId`} component={SwapComponent} />
      <Route path={`${localisePrefix}${links.turboSwap}/:orderId`} component={TurboSwap} />

      <Route path={`${localisePrefix}/:ticker(btc|eth|ghost|next)/tx/:tx?`} component={Transaction} />
      <Route path={`${localisePrefix}/:token(token)/:ticker/tx/:tx?`} component={Transaction} />

      <Route path={`${localisePrefix}/:ticker(btc|eth|ghost|next)/:address/:action(receive|send)?`} component={CurrencyWallet} />
      <Route path={`${localisePrefix}/:token(token)/:ticker/:address`} component={CurrencyWallet} />
      <Route path={`${localisePrefix}/:token(token)/:ticker/:address/withdraw`} component={CurrencyWallet} />
      <Route path={`${localisePrefix}/:fullName-wallet/:address?`} component={CurrencyWallet} />

      <Route path={`${localisePrefix}${links.exchange}/:sell-to-:buy/:linkedOrderId`} component={Exchange} />
      <Route path={`${localisePrefix}${links.exchange}/:sell-to-:buy`} component={Exchange} />
      <Route path={`${localisePrefix}${links.exchange}`} component={Exchange} />

      <Route exact path={`${localisePrefix}${links.marketmaker}`} component={MarketmakerPromo} />
      <Route exact path={`${localisePrefix}${links.marketmaker_short}`} component={MarketmakerPromo} />
      <Route path={`${localisePrefix}${links.marketmaker}/:token`} component={MarketmakerSettings} />
      <Route path={`${localisePrefix}${links.marketmaker_short}/:token`} component={MarketmakerSettings} />

      <Route path={`${localisePrefix}${links.farm}`} component={Farm} />
      <Route path={`${localisePrefix}${links.localStorage}`} component={LocalStorage} />
      <Route path={`${localisePrefix}${links.aboutUs}`} component={About} />

      <Route path={`${localisePrefix}${links.send}/:currency/:address/:amount`} component={Wallet} />
      <Route path={`${localisePrefix}${links.wallet}`} component={Wallet} />

      <Route exact path={`${localisePrefix}${links.createWallet}`} component={CreateWallet} />
      <Route path={`${localisePrefix}${links.createWallet}/:currency`} component={CreateWallet} />
      <Route path={`${localisePrefix}${links.restoreWallet}`} component={RestoryMnemonicWallet} />

      <Route path={`${localisePrefix}${links.multisign}/btc/:action/:data/:peer`} component={BtcMultisignProcessor} />
      <Route path={`${localisePrefix}${links.multisign}/btc/:action/:data`} component={BtcMultisignProcessor} />

      <Route path={`${localisePrefix}${links.createInvoice}/:type/:wallet`} component={CreateInvoice} />
      {isMobile && <Route path={`${localisePrefix}${links.invoices}/:type?/:address?`} component={InvoicesList} />}
      <Route path={`${localisePrefix}${links.invoice}/:uniqhash?/:doshare?`} component={Invoice} />

      <Route path={`${localisePrefix}${links.savePrivateSeed}`} component={SaveMnemonicModal} />
      <Route path={`${localisePrefix}${links.savePrivateKeys}`} component={SaveKeysModal} />

      <Route exact path={`${localisePrefix}${links.notFound}`} component={NotFound} />
      <Route exact path={`${localisePrefix}/`} component={Wallet} />
      <Route exact path={`${localisePrefix}${links.connectWallet}`} component={Wallet} />

      {/* In desktop mode - the history is shown in the wallet design */}
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
      <Route path={`${localisePrefix}/:currency`} component={Currency} />

      <Route component={NotFound} />
    </Switch>
  </ScrollToTop>
)

export default routes
