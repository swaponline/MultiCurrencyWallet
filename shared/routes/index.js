import React from 'react'
import { Route } from 'react-router'
import { Switch } from 'react-router-dom'
import { links } from 'helpers'
import { localisePrefix } from 'helpers/locale'

import SwapComponent from 'pages/Swap/Swap'
import Home from 'pages/Home/Home'
import OldWallet from 'pages/OldWallet/Wallet'
import History from 'pages/History/History'
import CreateWallet from 'pages/CreateWallet/CreateWallet'
import NotFound from 'pages/NotFound/NotFound'
import About from 'pages/About/About'
import Wallet from 'pages/Wallet/Wallet'
import Currency from 'pages/Currency/Currency'
import PartialClosure from 'pages/PartialClosure/PartialClosure'
import CurrencyWallet from 'pages/CurrencyWallet/CurrencyWallet'
import IEO from 'pages/IEO/IEO'

import config from 'app-config'

import ScrollToTop from '../components/layout/ScrollToTop/ScrollToTop'


const routes = (
  <ScrollToTop>
    <Switch>
      <Route path={`${localisePrefix}${links.swap}/:buy-:sell/:orderId`} component={SwapComponent} />

      <Route path={`${localisePrefix}/:fullName-wallet`} component={CurrencyWallet} />

      <Route path={`${localisePrefix}${links.home}:buy-:sell/:orderId`} component={Home} />
      <Route path={`${localisePrefix}${links.home}:buy-:sell`} component={Home} />
      <Route path={`${localisePrefix}${links.exchange}/:sell-to-:buy`} component={PartialClosure} />
      <Route path={`${localisePrefix}${links.exchange}`} component={PartialClosure} />

      <Route path={`${localisePrefix}${links.aboutUs}`} component={About} />
      <Route path={`${localisePrefix}${links.wallet}`} component={Wallet} />
      <Route path={`${localisePrefix}${links.history}`} component={History} />
      <Route path={`${localisePrefix}${links.createWallet}`} component={CreateWallet} />
      <Route path={`${localisePrefix}${links.createWallet}${links.home}:currency`} component={CreateWallet} />


      <Route path={`${localisePrefix}${links.ieo}`} component={IEO} />
      <Route exact path={`${localisePrefix}${links.notFound}`} component={NotFound} />
      <Route exact path={`${localisePrefix}${links.home}`} component={PartialClosure} />

      <Route path={`${localisePrefix}${links.currencyWallet}`} component={Wallet} />
      <Route path={`${localisePrefix}${links.oldWallet}`} component={OldWallet} />
      <Route path={`${localisePrefix}${links.home}:currency`} component={Currency} />


      <Route component={NotFound} />
    </Switch>
  </ScrollToTop>
)

export default routes
