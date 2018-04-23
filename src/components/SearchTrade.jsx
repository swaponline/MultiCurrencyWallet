import React, { Component } from 'react';
import FlipSvg from './../img/flip.svg';

class SearchTrade extends Component {
    render() {
        return (
            <div className="search-trade">
                <div className="container">
                    <div className="trade-panel">
                        <div className="trade-panel__want">
                            <div className="trade-panel__title"><span>You want</span> <span className="question"
                                                                                            data-toggle="tooltip"
                                                                                            data-placement="top"
                                                                                            title="Enter the amount and the address. Transfer your coins and let the magic happen.">?</span>
                            </div>

                            <div className="trade-panel__group">
                                <input type="number" placeholder="0" className="trade-panel__input" />

                                    <label htmlFor="want" className="trade-panel__label">
                                        <select
                                            className="js-example-basic-single js-states form-control js-example-responsive"
                                            id="want">
                                            <option value=""> </option>
                                            <option value="coin-1">BTC</option>
                                            <option value="coin-2">ETH</option>
                                        </select>
                                    </label>
                            </div>
                        </div>

                        <a href="#" className="trade-panel__change"><img src={FlipSvg} alt="" /></a>

                        <div className="trade-panel__have">
                            <div className="trade-panel__title"><span>You have</span> <span className="question"
                                                                                            data-toggle="tooltip"
                                                                                            data-placement="top"
                                                                                            title="Enter the amount and the address. Transfer your coins and let the magic happen.">?</span>
                            </div>

                            <div className="trade-panel__group">
                                <input type="number" placeholder="0" className="trade-panel__input" />

                                    <label htmlFor="have" className="trade-panel__label">
                                        <select
                                            className="js-example-basic-single js-states form-control js-example-responsive"
                                            id="have">
                                            <option value=""> </option>
                                            <option value="coin-1">BTC</option>
                                            <option value="coin-2">ETH</option>
                                        </select>
                                    </label>
                            </div>
                        </div>

                        <a href="#" className="trade-panel__search">Search</a>
                    </div>
                </div>
            </div>
        )
    }
}

export default SearchTrade