import React from 'react';
import './Filter.scss'

function FilterLink({ name, active, onClick }) {

    function click(event) {
        event.preventDefault()
        onClick()
    }

    return (
        <a href="" 
        className={ active ? 
            'history-filter__item  history-filter__item_active' 
            : 
            'history-filter__item' }
        onClick={click}
        >{name}</a>
    );
}

export default FilterLink;