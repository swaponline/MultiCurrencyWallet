import React from 'react';

import './Toolbar.scss'

import LogoSvg from './logo.svg';
import SearchSvg from './search.svg';
import Button from '../controls/Button/Button'
import ToolbarLink from './TollbarLink'

const Toolbar = () => (
    <div className="toolbar" >
        <h1 className="logo" ><img src={LogoSvg} alt="swap.online logo"/></h1>
        <div className="search-cont">
            <span className="search-btn"><img src={SearchSvg} alt=""/></span>
        </div>
        <div className="trades-filter">
            <ToolbarLink exact to="/"  name="All" />
            <ToolbarLink to="/balance" name="Balances" />
            <ToolbarLink to="/history" name="History" />
            <Button text="Get demo ETH" />
        </div>
    </div>
)

export default Toolbar