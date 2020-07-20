import React, { Component } from 'react'
import { constants } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './MnemonicInput.css'

import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import { isMobile } from 'react-device-detect'

import * as bip39 from 'bip39'
import ReactTags from 'react-tag-autocomplete'



const langPrefix = `MnemonicInputComponent`
const langLabels = defineMessages({
  placeholder: {
    id: `${langPrefix}_Placeholder`,
    defaultMessage: `Начните вводить секретную фразу`,
  },
  deleteText: {
    id: `${langPrefix}_DeleteText`,
    defaultMessage: `Нажмите, чтобы удалить слово`,
  },
})

const isDark = localStorage.getItem(constants.localStorage.isDark)

@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class MnemonicInput extends Component {
  constructor (props) {
    super(props)

    const suggestions = bip39.wordlists.english.map((name, id) => { return { id, name } })

    this.state = {
      tags: [],
      suggestions,
    }

    this.reactTags = React.createRef()
  }

  onChangeCallback () {
    const {
      props: {
        onChange,
      },
      state: {
        tags,
      },
    } = this

    const mnemonic = tags.map((tagData) => { return tagData.name }).join(` `)

    if (onChange instanceof Function) {
      onChange(mnemonic)
    }
  }

  onDelete (i) {
    const tags = this.state.tags.slice(0)
    tags.splice(i, 1)
    this.setState({ tags }, this.onChangeCallback )
  }

  onAddition (tag) {
    const tags = [].concat(this.state.tags, tag)
    this.setState({ tags }, this.onChangeCallback )
  }


  onInput(query) {
    const isPasteWords = query.trim().split(/\s+/g)
    if (isPasteWords.length === 12) {
      /* This pasted of phrase */
      const tags = isPasteWords.map((name, id) => { return { id, name } })
      this.setState({ tags }, () => {
        this.reactTags.current.clearInput()
        this.onChangeCallback()
      })
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
    const {
      props: {
        intl,
        fullWidth,
      },
      state: {
        tags,
        suggestions,
      },
      reactTags,
    } = this

    return (
      <div className={`mnemonicInput ${(isDark) ? '--is-dark' : ''} ${(isMobile) ? '--is-mobile' : ''} ${(fullWidth) ? '--full-width' : ''}`}>
        <ReactTags
          ref={reactTags}
          tags={tags}
          autoresize={true}
          suggestions={suggestions}
          onDelete={this.onDelete.bind(this)}
          onAddition={this.onAddition.bind(this)}
          onInput={this.onInput.bind(this)}
          placeholderText={`${intl.formatMessage(langLabels.placeholder)}`} 
          removeButtonText={`${intl.formatMessage(langLabels.deleteText)}`}
          delimiters={[`Enter`, `Tab`, ` `, `,`]}
        />
      </div>
    )
  }
}
