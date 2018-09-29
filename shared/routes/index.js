import React        from 'react'
import { Route }    from 'react-router'
import { Switch }   from 'react-router-dom'
import { links }    from 'helpers'

import SwapComponent    from 'pages/Swap/Swap'
import Home             from 'pages/Home/Home'
import Wallet           from 'pages/Wallet/Wallet'
import Listing          from 'pages/Listing/Listing'
import History          from 'pages/History/History'
import NotFound         from 'pages/NotFound/NotFound'
import Affiliate        from 'pages/Affiliate/Affiliate'
import Currency         from 'pages/Currency/Currency'
import CurrencyWallet   from 'pages/CurrencyWallet/CurrencyWallet'


const routes = (
  <Switch>

    <Route path={`${links.swap}/:buy-:sell/:orderId`} component={SwapComponent} />

    <Route path={`${links.home}:buy-:sell/:orderId`} component={Home} />
    <Route path={`${links.home}:buy-:sell`} component={Home} />
    <Route path={links.exchange} component={Home} />

    <Route path={links.affiliate} component={Affiliate} />
    <Route path={links.listing} component={Listing} />
    <Route path={links.history} component={History} />

    <Route path={`${links.home}wallets/:currencyWallet`} component={CurrencyWallet} />

    <Route path={`${links.home}:currency`} component={Currency} />
    <Route exact path={links.home} component={Wallet} />


    <Route component={NotFound} />
  </Switch>
)


export default routes
