import React from 'react'
import { Route } from 'react-router'
import { Switch } from 'react-router-dom'

import Balances from '../components/Pages/Balances'
import History from '../components/Pages/History'
import Main from '../components/Pages/Main'
import NotFound from '../components/Pages/NotFound'

const routes = (
    <Switch>
        <Route exact path="/" component={ Main } />
        <Route path="/balance" component={ Balances } />
        <Route path="/history" component={ History } />
        <Route component={ NotFound } />
    </Switch>
)

export default routes
