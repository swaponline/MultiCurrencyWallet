import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import ClickOutside from 'react-click-outside'
import Link from 'sw-valuelink'

import cssModules from 'react-css-modules'

import toggle from 'decorators/toggle'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import Input from 'components/forms/Input/Input'

import styles from './DropDown.scss'

import closeBtn from './images/close.svg'

@toggle()
@cssModules(styles, { allowMultiple: true })
export default class DropDown extends Component {
  static propTypes = {
    initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    selectedValue: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.any).isRequired,
    selectedItemRender: PropTypes.func,
    itemRender: PropTypes.func,
    onSelect: PropTypes.func,
    isToggleActive: PropTypes.bool.isRequired, // @toggle
    toggleOpen: PropTypes.func.isRequired, // @toggle
    toggleClose: PropTypes.func.isRequired, // @toggle
    notIteractable: PropTypes.bool
  }

  constructor({ initialValue, selectedValue }) {
    super()
    this.state = {
      selectedValue: initialValue || selectedValue || 0,
      inputValue: '',
      infoAboutCurrency: '',
      error: false
    }
  }

  componentDidUpdate(prevProps) {
    const { isToggleActive } = this.props
  }

  toggle = () => {
    const { isToggleActive, toggleOpen, toggleClose } = this.props

    console.log(isToggleActive)

    if (isToggleActive) {
      toggleClose()
    } else {
      toggleOpen()
    }
  }

  handleOptionClick = item => {
    const { toggleClose, selectedValue, onSelect } = this.props

    // if there is no passed `selectedValue` then change it
    if (typeof selectedValue === 'undefined') {
      this.setState({ selectedValue: item.value })
    }

    // for example we'd like to change `selectedValue` manually
    if (typeof onSelect === 'function') {
      onSelect(item)
      this.setState({ selectedValue: item.value })
    }
    toggleClose()
  }

  renderSelectedItem = () => {
    const { items, selectedItemRender } = this.props

    const selectedValue = this.props.selectedValue || this.state.selectedValue
    const selectedItem = items.find(({ value }) => value === selectedValue)

    if (selectedItem !== undefined) {
      if (typeof selectedItemRender !== 'function') {
        return (selectedItem.title || selectedItem.fullTitle)
      } else {
        return selectedItemRender(selectedItem)
      }
    }
  }

  renderItem = item => {
    const { itemRender } = this.props

    if (typeof itemRender === 'function') {
      return itemRender(item)
    }
    return item.title
  }

  render() {
    const {
      className,
      items,
      isToggleActive,
      selectedValue,
      name,
      placeholder,
      label,
      tooltip,
      id,
      notIteractable,
      disableSearch,  // Отключить поиск
      dontScroll, // Отключить вертикальный скрол - показывать все элементы (для небольших фиксированных списоков)
    } = this.props

    const {
      inputValue,
      infoAboutCurrency,
      error,
    } = this.state

    const dropDownStyleName = cx('dropDown', { active: isToggleActive })
    const linkedValue = Link.all(this, 'inputValue')

    let itemsFiltered = items
    if (inputValue) {
      itemsFiltered = items
        .filter(item => item.name.includes(inputValue.toUpperCase()))
        .filter(item => item.value !== selectedValue)
    }

    const dropDownListStyles = [`select`]
    if (dontScroll) dropDownListStyles.push(`dontscroll`)

    return (
      <ClickOutside
        onClickOutside={
          isToggleActive
            ? () => {
                if (!disableSearch) {
                  this.refs.searchInput.handleBlur()
                  linkedValue.inputValue.set('')
                }
                this.toggle()
              }
            : () => {}
        }
      >
        <div styleName={dropDownStyleName} className={className}>
          <div
            styleName={notIteractable ? 'selectedItem selectedItem_disableIteract' : 'selectedItem'}
            onClick={notIteractable ? () => null : this.toggle}
          >
            {!notIteractable && <div styleName="arrow arrowDropDown" />}
            {isToggleActive && !disableSearch ? (
              <Input
                styleName="searchInput"
                placeholder={placeholder}
                focusOnInit
                valueLink={linkedValue.inputValue}
                ref="searchInput"
              />
            ) : (
              this.renderSelectedItem()
            )}
          </div>
          {isToggleActive && (
            <div styleName={dropDownListStyles.join(` `)}>
              {name ? <span styleName="listName">{name}</span> : ''}
              {itemsFiltered.map(item => {
                let inneedData = null
                if (infoAboutCurrency) {
                  inneedData = infoAboutCurrency.find(el => el.name === item.name)
                }
                return (
                  <div
                    key={item.value}
                    styleName="option"
                    onClick={() => {
                      linkedValue.inputValue.set('')
                      this.handleOptionClick(item)
                    }}
                  >
                    <span styleName="shortTitle">{this.renderItem(item)}</span>
                    <span styleName="fullTitle">{item.fullTitle}</span>
                    {inneedData && (
                      <span styleName={`range ${+inneedData.change > 0 ? 'rangeUp' : 'rangeDown'}`}>
                        {inneedData.change} %
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          <button styleName="closeBtn" onClick={this.toggle}>
            <img src={closeBtn} alt="" />
          </button>
          <div styleName="dropDownLabel">
            <FieldLabel inRow inDropDown>
              <strong>{label}</strong>
              &nbsp;
              <div styleName="smallTooltip">
                <Tooltip id={id}>{tooltip}</Tooltip>
              </div>
            </FieldLabel>
          </div>
        </div>
      </ClickOutside>
    )
  }
}
