import React from 'react'

import Header from './Header'
import Footer from './Footer'
import Address from './Address'
import Amount from './Amount'

const BalanceCard = ({ open, isClose, wallet }) => (open === true ? 
    <div className="modal"  tabIndex="-1" >
        <div className="modal-dialog">
            <form action="" >
                <div className="modal-content">
                    <Header currency={wallet.currency} isClose={isClose}/>

                    <div className="modal-body">
                        <div className="text-danger" />
                        <Address />
                        <Amount currency={wallet.currency} balance={wallet.balance}/>
                    </div>
                    
                    <Footer isClose={isClose}/>
                </div>
            </form>
        </div>
    </div> : '' 
)

export default BalanceCard