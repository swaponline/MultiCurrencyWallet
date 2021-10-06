import { Component } from 'react'
import DocumentMeta from 'react-document-meta'
import JsonLd from './JsonLd'
import seo, { getSeoPage, getUrl } from 'helpers/seo'

export default class Seo extends Component<any, any> {
  constructor(props) {
    super(props)

    this.state = {
      seoPage: getSeoPage(props.location.pathname)
    }
  }

  componentDidUpdate(prevProps) {
    const { location: prevLocation } = prevProps
    const { location } = this.props

    if (location.pathname !== prevLocation.pathname) {
      const seoPage = getSeoPage(location.pathname)

      this.setState(() => ({
        seoPage,
      }))
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
