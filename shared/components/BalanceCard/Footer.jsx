import React from 'react'

const Footer = ({ isClose, withdraw }) => (
    <div className="modal-footer">
        <button type="button" onClick={ () => isClose() }className="btn btn-secondary" >Close</button>
        <button type="submit" onClick={ event => {
            event.preventDefault()
            withdraw()
        }  } className="btn btn-primary">Transfer</button>
    </div>
)

export default Footer