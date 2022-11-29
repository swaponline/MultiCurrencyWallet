import CSSModules from 'react-css-modules'
import config from 'helpers/externalConfig'
import styles from '../Footer.scss'

type ServiceLinksProps = {
  versionName: string | null
  versionLink: string | null
}

function ServiceLinks({ versionName, versionLink }: ServiceLinksProps) {
  const serviceLink = config?.opts?.ui?.serviceLink || 'https://onout.org/wallet'

  return (
    <div styleName="serviceLinks">
      {versionName && versionLink && (
        <span>
          <a href={versionLink} target="_blank" rel="noreferrer">
            {versionName}
          </a>
        </span>
      )}
      <span>
        Powered by
        {' '}
        <a href={serviceLink} target="_blank" rel="noreferrer">OnOut - no-code tool to create Wallet</a>
      </span>
    </div>
  )
}

export default CSSModules(ServiceLinks, styles, { allowMultiple: true })
