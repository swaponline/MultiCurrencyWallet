import React        from 'react'
import { Route }    from 'react-router'
import { Switch }   from 'react-router-dom'
import { links }    from 'helpers'
import { localisePrefix } from 'helpers/locale'

import SwapComponent    from 'pages/Swap/Swap'
import Home             from 'pages/Home/Home'
import Wallet           from 'pages/Wallet/Wallet'
import History          from 'pages/History/History'
import NotFound         from 'pages/NotFound/NotFound'
import About            from 'pages/About/About'
import Currency         from 'pages/Currency/Currency'
import PartialClosure   from 'pages/PartialClosure/PartialClosure'
import CurrencyWallet   from 'pages/CurrencyWallet/CurrencyWallet'

import config from 'app-config'


const routes = (
  <Switch>
    <Route path={`${localisePrefix}${links.swap}/:buy-:sell/:orderId`} component={SwapComponent} />

    <Route path={`${localisePrefix}/:fullName-wallet`} component={CurrencyWallet} />

    <Route path={`${localisePrefix}${links.home}:buy-:sell/:orderId`} component={Home} />
    <Route path={`${localisePrefix}${links.home}:buy-:sell`} component={Home} />
    <Route path={`${localisePrefix}${links.exchange}/:sell-to-:buy`} component={PartialClosure} />
    <Route path={`${localisePrefix}${links.exchange}`} component={PartialClosure} />

    <Route path={`${localisePrefix}${links.aboutus}`} component={About} />
    <Route path={`${localisePrefix}${links.history}`} component={History} />

    <Route exact path={`${localisePrefix}${links.notFound}`} component={NotFound} />
    <Route exact path={`${localisePrefix}${links.home}`} component={(config && config.isWidget) ? PartialClosure : Wallet} />
    <Route path={`${localisePrefix}${links.currencyWallet}`} component={Wallet} />
    <Route path={`${localisePrefix}${links.home}:currency`} component={Currency} />

    <Route component={NotFound} />
  </Switch>

)

export default routes
