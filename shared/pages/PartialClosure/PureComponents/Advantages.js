import React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './Advantages.scss'


const Advantages = (props) => (
  <div styleName="advantages">
    {/* <div styleName="advantages__content">

      <article styleName="advantage">
        <img src="https://exchange.swap.online/images/advantages/1.png" alt="0% commission" />
        <div styleName="advantage__title">
          <h5>
            <FormattedMessage id="advantagesTitle1" defaultMessage="0% commission" />
          </h5>
        </div>
        <div styleName="advantage__txt">
          <p>
            <FormattedMessage
              id="advantagesTxt1"
              defaultMessage="The exchange is happening between you and other crypto holders (peer-2-peer). No percentage charged of the transaction."
            />
          </p>
        </div>
      </article>

      <article styleName="advantage">
        <img src="https://exchange.swap.online/images/advantages/2.png" alt="No KYC" />
        <div styleName="advantage__title">
          <h5>
            <FormattedMessage id="advantagesTitle2" defaultMessage="No KYC" />
          </h5>
        </div>
        <div styleName="advantage__txt">
          <p>
            <FormattedMessage
              id="advantagesTxt2"
              defaultMessage="We do not require any registration or personal authentication. (we don’t collect any data about the users)"
            />
          </p>
        </div>
      </article>

      <article styleName="advantage">
        <img src="https://exchange.swap.online/images/advantages/3.png" alt="No 3d party" />
        <div styleName="advantage__title">
          <h5>
            <FormattedMessage id="advantagesTitle3" defaultMessage="No 3d party" />
          </h5>
        </div>
        <div styleName="advantage__txt">
          <p>
            <FormattedMessage
              id="advantagesTxt3"
              defaultMessage="No-one can interfere with the exchange process."
            />
          </p>
        </div>
      </article>

      <article styleName="advantage">
        <img src="https://exchange.swap.online/images/advantages/4.png" alt="Super fast" />
        <div styleName="advantage__title">
          <h5>
            <FormattedMessage id="advantagesTitle4" defaultMessage="Super fast" />
          </h5>
        </div>
        <div styleName="advantage__txt">
          <p>
            <FormattedMessage
              id="advantagesTxt4"
              defaultMessage="You can exchange right now. The transaction is direct and within 2 minutes."
            />
          </p>
        </div>
      </article>

      <article styleName="advantage">
        <img src="https://exchange.swap.online/images/advantages/5.png" alt="High security" />
        <div styleName="advantage__title">
          <h5>
            <FormattedMessage id="advantagesTitle5" defaultMessage="High security" />
          </h5>
        </div>
        <div styleName="advantage__txt">
          <p>
            <FormattedMessage
              id="advantagesTxt5"
              defaultMessage="We don’t store your funds or keys so no-one can still your money from us."
            />
          </p>
        </div>
      </article>

      <article styleName="advantage">
        <img src="https://exchange.swap.online/images/advantages/6.png" alt="True anonymity" />
        <div styleName="advantage__title">
          <h5>
            <FormattedMessage id="advantagesTitle6" defaultMessage="True anonymity" />
          </h5>
        </div>
        <div styleName="advantage__txt">
          <p>
            <FormattedMessage
              id="advantagesTxt6"
              defaultMessage="No personal data is required, no tracing. Everything works on full anonymity."
            />
          </p>
        </div>
      </article>

    </div> */}

    <div styleName="advFooter">
      <button
        onClick={() => window.open(props.intl.formatMessage({ id: 'advVidLink', defaultMessage: 'https://youtu.be/Jhrb7xOT_7s' }), '_blank')}
        styleName="advFooter__btn"
      >
        <img src="https://exchange.swap.online/images/icons/video-play.png" alt="Play the video" />
        <div>
          <h4>
            <FormattedMessage
              id="advantagesButtonTitle"
              defaultMessage="How it works?"
            />
          </h4>
          <FormattedMessage
            id="advantagesButtonTxt"
            defaultMessage="(Watch a video)"
          />
        </div>
      </button>
    </div>
  </div>
)

export default injectIntl(CSSModules(Advantages, styles, { allowMultiple: true }))
