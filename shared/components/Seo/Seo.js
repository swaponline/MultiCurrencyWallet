import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DocumentMeta from 'react-document-meta'

import JsonLd from './JsonLd'
import seo, { getSeoPage, getUrl } from 'helpers/seo'


export default class Seo extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  
  state = {
    seoPage: getSeoPage(this.props.location.pathname), 
  }
  
  static getDerivedStateFromProps({ location: { pathname } }) {
    return {
      seoPage: getSeoPage(pathname)
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.props.location.pathname !== nextProps.location.pathname
  }
  
  render() {
    const { seoPage } = this.state
    if (!seoPage) {
      return null
    }
    const { uri, title, description } = seoPage

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
