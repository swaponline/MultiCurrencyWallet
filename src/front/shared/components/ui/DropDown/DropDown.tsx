import React, { Component } from 'react'
import cx from 'classnames'
import cssModules from 'react-css-modules'
import styles from './DropDown.scss'
import Link from 'local_modules/sw-valuelink'
import { constants } from 'helpers'

import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import Input from 'components/forms/Input/Input'
import OutsideClick from './OutsideClick'
import closeBtn from './images/close.svg'

const isDark = localStorage.getItem(constants.localStorage.isDark)

type DropDownProps = {
  initialValue?: string | number
  selectedValue: string
  items: IUniversalObj[]
  selectedItemRender?: (item) => void
  itemRender?: (item) => JSX.Element
  onSelect?: (item) => void
  notIteractable?: boolean
  className?: string
  name?: string
  placeholder?: string
  label?: string
  tooltip?: string
  arrowSide?: string
  id?: string
  disableSearch?: boolean
  dontScroll?: boolean
}

type DropDownState = {
  error: boolean
  isToggleActive: boolean
  inputValue: string
  selectedValue: number
}

@cssModules(styles, { allowMultiple: true })
export default class DropDown extends Component<DropDownProps, DropDownState> {
  constructor(props) {
    super(props)

    const { initialValue, selectedValue } = props

    this.state = {
      isToggleActive: false,
      selectedValue: initialValue || selectedValue || 0,
      inputValue: '',
      error: false,
    }
  }

  toggleClose = () => {
    this.setState({
      isToggleActive: false,
    })
  }

  toggleOpen = () => {
    const { isToggleActive } = this.state

    if (isToggleActive) {
      return
    }

    this.setState({
      isToggleActive: true,
    })
  }

  toggle = () => {
    if (this.state.isToggleActive) {
      this.toggleClose()
    } else {
      this.toggleOpen()
    }
  }

  handleOptionClick = (item) => {
    const { selectedValue, onSelect } = this.props

    // if there is no passed `selectedValue` then change it
    if (typeof selectedValue === 'undefined') {
      this.setState({ selectedValue: item.value })
    }

    // for example we'd like to change `selectedValue` manually
    if (typeof onSelect === 'function' && !item.disabled) {
      onSelect(item)
      this.setState({ selectedValue: item.value })
    }
    this.toggleClose()
  }

  renderItem = (item) => {
    const { itemRender } = this.props

    if (typeof itemRender === 'function') {
      return itemRender(item)
    }
    return <span>item.title</span>
  }

  renderSelectedItem = () => {
    const { items, selectedItemRender } = this.props

    const selectedValue = this.props.selectedValue || this.state.selectedValue
    const selectedItem = items.find(({ value }) => value === selectedValue)

    if (selectedItem !== undefined) {
      if (typeof selectedItemRender !== 'function') {
        const textToShow = selectedItem.title || selectedItem.fullTitle
        return (
          <div
            styleName={`selectedItemInner ${selectedItem.disabled ? 'disabled' : ''} ${
              selectedItem.reduceSelectedItemText ? 'reducedLength' : ''
            }`}
          >
            {textToShow}
          </div>
        )
      } else {
        return selectedItemRender(selectedItem)
      }
    }
  }

  handleClickOutside = () => {
    const { disableSearch } = this.props
    const { isToggleActive } = this.state
    const linkedValue = Link.all(this, 'inputValue')
    
    if (isToggleActive) {
      // cleanup the search field
      if (!disableSearch) {
        linkedValue.inputValue.set('')
      }

      this.toggle()
    }
  }

  render() {
    const {
      className,
      items,
      selectedValue,
      name,
      placeholder,
      label,
      tooltip,
      id,
      notIteractable,
      disableSearch,
      dontScroll, // Show all items, for small lists
      arrowSide,
    } = this.props

    const { inputValue, isToggleActive } = this.state

    const dropDownStyleName = cx('dropDown', { active: isToggleActive })
    const linkedValue = Link.all(this, 'inputValue')

    let itemsFiltered = items
    if (inputValue) {
      itemsFiltered = items
        .filter((item) => item.name.includes(inputValue.toUpperCase()))
        .filter((item) => item.value !== selectedValue)
    }

    return (
      <OutsideClick outsideAction={this.handleClickOutside}>
        <div styleName={`${dropDownStyleName} ${isDark ? 'dark' : ''}`} className={className}>
          <div
            styleName={`
              selectedItem
              ${notIteractable ? ' selectedItem_disableIteract' : ''}
              ${arrowSide === 'left' ? 'left' : ''}
            `}
            onClick={notIteractable ? () => null : this.toggle}
          >
            {!notIteractable && <div styleName={`arrow ${arrowSide === 'left' ? 'left' : ''}`} />}
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
            <div styleName={`select ${dontScroll ? 'dontscroll' : ''}`}>
              {name ? <span styleName="listName">{name}</span> : ''}

              {/* Do not show drop-down for once element */}
              {itemsFiltered.length > 1 ? (
                  itemsFiltered.map((item, index) => {
                    if (!item.hidden) {
                      return (
                        <div
                          key={index}
                          styleName="dropDownItem"
                          onClick={() => {
                            linkedValue.inputValue.set('')
                            this.handleOptionClick(item)
                          }}
                        >
                          {this.renderItem(item)}
                        </div>
                      )
                    }

                    return null
                  })
                ) : (
                  <div
                    styleName="dropDownItem"
                    onClick={() => {
                      linkedValue.inputValue.set('')
                      this.handleOptionClick(itemsFiltered[0])
                    }}
                  >
                    {this.renderItem(itemsFiltered[0])}
                  </div>
                )
              }
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
      </OutsideClick>
    )
  }
}
