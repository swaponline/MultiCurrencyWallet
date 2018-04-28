import React from 'react';

import CSSModules from 'react-css-modules'
import styles from './Toolbar.scss'

import LogoSvg from './logo.svg';
import SearchSvg from './search.svg';

import ToolbarLink from './TollbarLink'

const Toolbar = () => (
    <div styleName="toolbar" >
        <h1 styleName="logo" ><img src={LogoSvg} alt="swap.online logo"/></h1>
        <div className="search-cont">
            <span styleName="search-btn"><img src={SearchSvg} alt=""/></span>
        </div>
        <div className="trades-filter">
            <ToolbarLink exact to="/"  name="All" />
            <ToolbarLink to="/balance" name="Balances" />
            <ToolbarLink to="/history" name="History" />
        </div>
    </div>
)

export default CSSModules(Toolbar, styles)