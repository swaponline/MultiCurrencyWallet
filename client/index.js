import React from 'react'
import { render } from 'react-dom'
import routes from '../shared/routes/routes'
import configureStore, { history } from '../shared/redux/store/configureStore'
import RootContainer from '../shared/containers/RootContainer'
import './scss/app.scss'

export const store = configureStore()

render(
    <RootContainer history={history} store={store}>
        { routes } 
    </RootContainer>,
    document.getElementById('root')
)