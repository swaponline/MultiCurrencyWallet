import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { isMobile } from 'react-device-detect'
import { connect } from 'redaction'
import { constants } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import { FormattedMessage, injectIntl } from 'react-intl'
import { withRouter } from 'react-router'
import actions from 'redux/actions'
import { links }    from 'helpers'

import moment from 'moment'

import CSSModules from 'react-css-modules'
import styles from './Btc.scss'

import config from 'app-config'

@connect(({

}) => {

  return {

  }
})
@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class Btc extends PureComponent {

  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    intl: PropTypes.object.isRequired,
  };

  constructor() {
    console.log('Btc mulsign connected')
    super()
  }

  componentWillMount() {
    let { match : { params : { action, data } }, history, location: { pathname } } = this.props
    if ((action !== 'connect') && (action !== 'confirm')) {
      this.props.history.push(localisedUrl(links.notFound))
      return
    }
    console.log('Btc mulsign processor')
    console.log('action',action)
    console.log('data',data)
  }

  render() {
    return (
      <section>
      Btc mulsign links processor
      </section>
    )
  }
}
