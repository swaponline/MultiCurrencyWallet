import PropTypes from 'prop-types'
import DocumentMeta from 'react-document-meta'

import Seo from './Seo'
import JsonLd from './JsonLd'
import seo, { getUrl } from 'helpers/seo'


export default class PageSeo extends Seo {
  static propTypes = {
    location: PropTypes.object.isRequired,
    defaultTitle: PropTypes.string,
    defaultDescription: PropTypes.string,
  }

  getValues = () => {
    if (!!this.state.seoPage) {
      return {
        ...this.state.seoPage,
        url: getUrl(this.state.seoPage.uri),
      }
    }

    const  { defaultTitle, defaultDescription } = this.props
    return {
      title: defaultTitle,
      description: defaultDescription,
      uri: null,
      url: null,
    }

  }

  render() {
    const { title, description, uri, url } = this.getValues()
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
