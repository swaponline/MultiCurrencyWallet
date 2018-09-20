import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DocumentMeta from 'react-document-meta'

import JsonLd from './JsonLd'
import seo, { getSeoPage, getUrl } from 'helpers/seo'


export default class Seo extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.seoPage = getSeoPage(props.location.pathname)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.seoPage = getSeoPage(nextProps.location.pathname)
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.props.location.pathname !== nextProps.location.pathname
  }

  render() {
    if (!this.seoPage) {
      return null
    }
    const { uri, title, description } = this.seoPage

    console.log('seo', this.seoPage)
    const url = getUrl(uri)
    return (
      <DocumentMeta
        title={title}
        description={description}
        canonical={url}
        meta={{
          property: {
            'og:title': title,
            'og:description': description,
            'og:url': url,
            'og:image': seo.config.logo,
          },
        }}
      >
        <JsonLd uri={uri} title={title} description={description} />
      </DocumentMeta>
    )
  }
}
