import React        from 'react'
import { Route }    from 'react-router'
import { Switch }   from 'react-router-dom'
import { links }    from 'helpers'

import SwapComponent    from 'pages/Swap/Swap'
import Home             from 'pages/Home/Home'
import Wallet           from 'pages/Wallet/Wallet'
import History          from 'pages/History/History'
import NotFound         from 'pages/NotFound/NotFound'
import About            from 'pages/About/About'
import Currency         from 'pages/Currency/Currency'
import PartialClosure   from 'pages/PartialClosure/PartialClosure'
import CurrencyWallet   from 'pages/CurrencyWallet/CurrencyWallet'


const routes = (
  <Switch>
    <Route path="/NotFound" component={NotFound} />

    <Route path={`${links.swap}/:buy-:sell/:orderId`} component={SwapComponent} />

    <Route path="/:fullName-wallet" component={CurrencyWallet} />

    <Route path={`${links.home}:buy-:sell/:orderId`} component={Home} />
    <Route path={`${links.home}:buy-:sell`} component={Home} />
    <Route path={links.exchange} component={PartialClosure} />

    <Route path={links.aboutus} component={About} />
    <Route path={links.history} component={History} />

    <Route path={`${links.home}:currency`} component={Currency} />
    <Route exact path={links.home} component={Wallet} />


  </Switch>
)


export default routes
