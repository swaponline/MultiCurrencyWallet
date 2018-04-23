import React, { Component } from 'react';
import LogoSvg from './../img/logo.svg';
import SearchSvg from './../img/search.svg';
import AddSvg from './../img/add.svg';
import UserTooltip from './UserTooltip';

class Header extends Component {
    render() {
        return (
            <div className="header">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="logo"><img src={LogoSvg} alt="swap.online logo"/></h1>

                        <div className="search-cont">
                            <span className="search-btn"><img src={SearchSvg} alt=""/></span>
                        </div>

                        <div className="trades-filter">
                            <a href="#" className="trades-filter__link trades-filter__link_active">All</a>
                            <a href="#" className="trades-filter__link">Balances</a>
                            <a href="#" className="trades-filter__link">History</a>
                        </div>
                    </div>

                    <div className="user-cont">
                        <a href="#" className="user-cont__help">?</a>
                        <a href="#" className="user-cont__add-user"><img src={AddSvg} alt=""/></a>

                        <div className="users">
                            <div className="users__user">
                                <span className="users__user-letter">K</span>
                                <span className="users__user-status"> </span>
                            </div>
                        </div>

                       <UserTooltip/>

                    </div>
                </div>
            </div>
        );
    };
}

export default Header