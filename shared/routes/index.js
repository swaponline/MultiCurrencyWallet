import React from 'react'
import { Route } from 'react-router'
import { Switch } from 'react-router-dom'
import { links } from 'helpers'

import Home from 'pages/Home/Home'

import Wallet from 'pages/Wallet/Wallet'
import SwapComponent from 'pages/Swap/Swap'
import History from 'pages/History/History'
import NotFound from 'pages/NotFound/NotFound'
import Affiliate from 'pages/Affiliate/Affiliate'
import Listing from 'pages/Listing/Listing'


const routes = (
  <Switch>
    <Route path={`${links.orders}/:buy-:sell`} component={Home} />
    <Route path={links.orders} component={Home} />
    <Route path={links.affiliate} component={Affiliate} />
    <Route path={links.listing} component={Listing} />
    <Route exact path={links.home} component={Wallet} />
    <Route path={links.history} component={History} />
    <Route path={`${links.swap}/:buy-:sell/:orderId`} component={SwapComponent} />
    <Route component={NotFound} />
  </Switch>
)


export default routes
