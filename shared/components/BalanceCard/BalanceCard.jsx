import React from 'react'

class BalanceCard extends React.Component{

    render() {
        const { open, isClose, wallet } = this.props
        console.log(wallet)
        return(open === true ? 
            <div className="modal"  tabIndex="-1" >
            <div className="modal-dialog">
                <form action="" >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title" >{ wallet.currency.toUpperCase() }</h4>
                            <button type="button" className="close" >&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="text-danger" />
                            <div className="form-group">
                                <label>Address</label>
                                <div className="input-group mb-3">
                                    <input className="form-control" defaultValue="" required=""   type="text" placeholder="Address" />
                                </div>
                            </div>
        
                            <div className="form-group">
                                <label>Amount</label>
                                <div className="input-group mb-3">
                                <input className="form-control" defaultValue="0"  required=""   type="text"  />
                                <div className="input-group-append">
                                    <span className="input-group-text">{ wallet.currency }</span>
                                </div>
        
                                </div>
                                <p className="list-text">min: <a href="">min_amount</a>, max <a href="" >{ wallet.balance }</a>
                                </p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" onClick={ () => isClose('CARD') }className="btn btn-secondary" >Close</button>
                            <button type="submit" className="btn btn-primary">Transfer</button>
                        </div>
                    </div>
                </form>
            </div>
            </div> : '' 
        ) 
        
    }
} 

export default BalanceCard