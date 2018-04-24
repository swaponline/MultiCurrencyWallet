import React from 'react'

import Description from './Description'
import SearchTrade from './SearchTrade'
import TradesTable from './TradesTable'

function All() {
    return(
        <main className="main">
            <Description />
            <SearchTrade />
            <TradesTable />
        </main>
    );
}

export default All