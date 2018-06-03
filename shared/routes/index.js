import React from 'react'
import { Route } from 'react-router'
import { Switch } from 'react-router-dom'
import { links } from 'helpers'

import Home from 'pages/Home/Home'
import Balances from 'pages/Balances/Balances'
import History from 'pages/History/History'
import NotFound from 'pages/NotFound/NotFound'
import PageSwap from 'pages/PageSwap/PageSwap'


const routes = (
  <Switch>
    <Route exact path={links.home} component={Home} />
    <Route path={links.balance} component={Balances} />
    <Route path={links.history} component={History} />
    <Route path={`${links.swap}/:orderId`} component={PageSwap} />
    <Route component={NotFound} />
  </Switch>
)


export default routes
