import React from 'react'
import PropTypes from 'prop-types'

import Description from '../Description/Description'
import Head from './Head/Head'
import Body from './Body/Body'

function Balances() {
    return(
        <section >
            <Description subtitle="Balances" />
            
            <div className="trades-table">
                <div className="container">
                    <table className="table">
                        <Head />
                        <Body />
                    </table>
                </div>
            </div>
        </section>
    );
}

Balances.propTypes = {

};

export default Balances

