import React from 'react'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'

import Header from './Header/Header'
import Loader from './Loader/Loader'

import ModalsContainer from '../containers/ModalsContainer'

class Root extends React.Component {

    componentDidMount() {
        this.props.updateLoader()
    }

    render() {
        const { history, children, store, loader } = this.props
        return(
            <Provider store={store}>
                <ConnectedRouter history={history}>
                { loader === true ? 
                    <main className="main" id="main">
                        <Header />
                        { children }
                        <ModalsContainer />
                    </main> 
                        :
                    <Loader /> 
                }
                </ConnectedRouter>
            </Provider>
        )
    }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired
}

export default Root