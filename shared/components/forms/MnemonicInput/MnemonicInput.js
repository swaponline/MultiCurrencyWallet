import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Input as ValueLinkInput } from 'sw-valuelink'
import { constants } from 'helpers'
import cx from 'classnames'
import { ignoreProps } from 'helpers'
import reducers from 'redux/core/reducers'
import { isMobile } from 'react-device-detect'

import cssModules from 'react-css-modules'
import styles from './MnemonicInput.css'



import TextArea from 'components/forms/TextArea/TextArea'


import * as bip39 from 'bip39'
import ReactTags from 'react-tag-autocomplete'

window.bip39 = bip39
const isDark = localStorage.getItem(constants.localStorage.isDark)
@cssModules(styles, { allowMultiple: true })
export default class MnemonicInput extends Component {
  static propTypes = {}

  static defaultProps = {}

  constructor (props) {
    super(props)

    const suggestions = bip39.wordlists.english.map((name, id) => { return { id, name } })

    console.log(suggestions)
    this.state = {
      tags: [],
      suggestions,
    }

    this.reactTags = React.createRef()
  }

  onDelete (i) {
    const tags = this.state.tags.slice(0)
    tags.splice(i, 1)
    this.setState({ tags })
  }

  onAddition (tag) {
    console.log('onAddition', tag)
    const tags = [].concat(this.state.tags, tag)
    this.setState({ tags })
  }


  onInput(query) {
    const isPasteWords = query.trim().split(/\s+/g)
    if (isPasteWords.length === 12) {
      /* This pasted of phrase */
      console.log('onPaste', isPasteWords, query)
    } else {
      if (!this.state.busy) {
        this.setState({ busy: true })
     
        return fetch(`query=${query}`).then((result) => {
          this.setState({ busy: false })
        })
      }
    }
  }

  render () {
    return (
      <div className="mnemonicInput">
        <ReactTags
          ref={this.reactTags}
          tags={this.state.tags}
          autoresize={false}
          suggestions={this.state.suggestions}
          onDelete={this.onDelete.bind(this)}
          onAddition={this.onAddition.bind(this)}
          onInput={this.onInput.bind(this)}
        />
      </div>
    )
  }
}
