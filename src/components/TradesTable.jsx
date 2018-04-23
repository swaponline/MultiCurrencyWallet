import React, {Component} from 'react';
import Coin1Svg from './../img/coin-1.svg';
import Coin2Svg from './../img/coin-2.svg';

class TradesTable extends Component {
    render() {
        return (
            <div className="trades-table">
                <div className="container">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>
                                <div className="table__headers"><span className="table__titles">Exchange</span></div>
                            </th>
                            <th>
                                <div className="table__headers"><span className="table__titles">Price</span> <span
                                    className="question">?</span></div>
                            </th>
                            <th>
                                <div className="table__headers"><span className="table__titles">Limits</span></div>
                            </th>
                            <th>
                                <div className="table__headers"><span className="table__titles">Rating</span> <span
                                    className="question">?</span></div>
                            </th>
                            <th> </th>
                        </tr>
                        </thead>

                        <tbody>
                        <tr>
                            <td>
                                <div className="table__coins">
                                    <span className="table__coin-left coin-btc"><img src={Coin1Svg} alt="" /> </span>
                                    <span className="table__coin-right coin-eth"><img src={Coin2Svg} alt="" /> </span>
                                </div>
                            </td>

                            <td>
                                <div className="table__price">0.055777 <span className="table__currency">eth</span>
                                </div>
                            </td>

                            <td>
                                <div className="table__limits">21,400 - 22,051 <span
                                    className="table__currency">btc</span></div>
                            </td>

                            <td>
                                <div className="table__rating">98% <span className="table__currency">10 000+</span>
                                </div>
                            </td>

                            <td>
                                <a href="#" className="table__link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="7" height="10" viewBox="0 0 7 10">
                                        <path className="table__link-arrow" fill="none" fill-rule="evenodd"
                                              stroke="#7c1de9" stroke-linecap="round" stroke-width="2"
                                              d="M1 9l4-4-4-4"/>
                                    </svg>
                                </a>
                            </td>
                        </tr>

                        <tr className="active">
                            <td>
                                <div className="table__coins">
                                    <span className="table__coin-left coin-btc"><img src={Coin1Svg} alt="" /></span>
                                    <span className="table__coin-right coin-eth"><img src={Coin2Svg} alt="" /></span>
                                </div>
                            </td>

                            <td>
                                <div className="table__price">0.055777 <span className="table__currency">eth</span>
                                </div>
                            </td>

                            <td>
                                <div className="table__limits">21,400 - 22,051 <span
                                    className="table__currency">btc</span></div>
                            </td>

                            <td>
                                <div className="table__rating">98% <span className="table__currency">10 000+</span>
                                </div>
                            </td>

                            <td>
                                <a href="#" className="table__link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="7" height="10" viewBox="0 0 7 10">
                                        <path className="table__link-arrow" fill="none" fill-rule="evenodd"
                                              stroke="#7c1de9" stroke-linecap="round" stroke-width="2"
                                              d="M1 9l4-4-4-4"/>
                                    </svg>
                                </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="table__coins">
                                    <span className="table__coin-left coin-btc"><img src={Coin1Svg} alt="" /></span>
                                    <span className="table__coin-right coin-eth"><img src={Coin2Svg}
                                                                                      alt="" /></span>
                                </div>
                            </td>

                            <td>
                                <div className="table__price">0.055777 <span className="table__currency">eth</span>
                                </div>
                            </td>

                            <td>
                                <div className="table__limits">21,400 - 22,051 <span
                                    className="table__currency">btc</span></div>
                            </td>

                            <td>
                                <div className="table__rating">98% <span className="table__currency">10 000+</span>
                                </div>
                            </td>

                            <td>
                                <a href="#" className="table__link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="7" height="10" viewBox="0 0 7 10">
                                        <path className="table__link-arrow" fill="none" fill-rule="evenodd"
                                              stroke="#7c1de9" stroke-linecap="round" stroke-width="2"
                                              d="M1 9l4-4-4-4"/>
                                    </svg>
                                </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="table__coins">
                                    <span className="table__coin-left coin-btc"><img src={Coin1Svg} alt="" /></span>
                                    <span className="table__coin-right coin-eth"><img src={Coin2Svg}
                                                                                      alt="" /></span>
                                </div>
                            </td>

                            <td>
                                <div className="table__price">0.055777 <span className="table__currency">eth</span>
                                </div>
                            </td>

                            <td>
                                <div className="table__limits">21,400 - 22,051 <span
                                    className="table__currency">btc</span></div>
                            </td>

                            <td>
                                <div className="table__rating">98% <span className="table__currency">10 000+</span>
                                </div>
                            </td>

                            <td>
                                <a href="#" className="table__link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="7" height="10" viewBox="0 0 7 10">
                                        <path className="table__link-arrow" fill="none" fill-rule="evenodd"
                                              stroke="#7c1de9" stroke-linecap="round" stroke-width="2"
                                              d="M1 9l4-4-4-4"/>
                                    </svg>
                                </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="table__coins">
                                    <span className="table__coin-left coin-btc"><img src={Coin1Svg} alt="" /></span>
                                    <span className="table__coin-right coin-eth"><img src={Coin2Svg}
                                                                                      alt="" /></span>
                                </div>
                            </td>

                            <td>
                                <div className="table__price">0.055777 <span className="table__currency">eth</span>
                                </div>
                            </td>

                            <td>
                                <div className="table__limits">21,400 - 22,051 <span
                                    className="table__currency">btc</span></div>
                            </td>

                            <td>
                                <div className="table__rating">98% <span className="table__currency">10 000+</span>
                                </div>
                            </td>

                            <td>
                                <a href="#" className="table__link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="7" height="10" viewBox="0 0 7 10">
                                        <path className="table__link-arrow" fill="none" fill-rule="evenodd"
                                              stroke="#7c1de9" stroke-linecap="round" stroke-width="2"
                                              d="M1 9l4-4-4-4"/>
                                    </svg>
                                </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="table__coins">
                                    <span className="table__coin-left coin-btc"><img src={Coin1Svg} alt="" /></span>
                                    <span className="table__coin-right coin-eth"><img src={Coin2Svg} alt="" /></span>
                                </div>
                            </td>

                            <td>
                                <div className="table__price">0.055777 <span className="table__currency">eth</span>
                                </div>
                            </td>

                            <td>
                                <div className="table__limits">21,400 - 22,051 <span
                                    className="table__currency">btc</span></div>
                            </td>

                            <td>
                                <div className="table__rating">98% <span className="table__currency">10 000+</span>
                                </div>
                            </td>

                            <td>
                                <a href="#" className="table__link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="7" height="10" viewBox="0 0 7 10">
                                        <path className="table__link-arrow" fill="none" fill-rule="evenodd"
                                              stroke="#7c1de9" stroke-linecap="round" stroke-width="2"
                                              d="M1 9l4-4-4-4"/>
                                    </svg>
                                </a>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default TradesTable