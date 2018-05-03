import React from 'react'
import { Route } from 'react-router'
import { Switch } from 'react-router-dom'

import Balances from '../pages/Balances'
import History from '../pages/History'
import Main from '../pages/Main'
import NotFound from '../pages/NotFound'

const routes = (
    <Switch>
        <Route exact path="/" component={ Main } />
        <Route path="/balance" component={ Balances } />
        <Route path="/history" component={ History } />
        <Route component={ NotFound } />
    </Switch>
)

export default routes
