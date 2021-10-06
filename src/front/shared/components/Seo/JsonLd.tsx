import seo, { getUrl } from 'helpers/seo'

const JsonLd = ({ uri, title, description }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'http://schema.org',
        '@type': 'Website',
        sameAs: [
          seo.config.medium,
          seo.config.twitter,
          seo.config.facebook,
          seo.config.telegram,
        ],
        email: seo.config.email,
        url: getUrl(uri),
        name: title,
        description,
        logo: seo.config.logo,
      }),
    }}
  />
)

export default JsonLd
