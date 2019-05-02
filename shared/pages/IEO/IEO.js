import React from 'react'
import CSSModules from 'react-css-modules'
import { FormattedMessage, injectIntl } from 'react-intl'
import Link from 'sw-valuelink'

import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Table from 'components/tables/Table/Table'

import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'

import { constants } from 'helpers'
import firestore from 'helpers/firebase/firestore'

import styles from './IEO.scss'


@injectIntl
@CSSModules(styles, { allowMultiple: true })
class IEO extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isSaved: localStorage.getItem(constants.localStorage.IEO_signed) !== null,
      twitter: '',
      facebook: '',
      reddit: '',
    }
  }

  handleSignUp = () => {
    const {
      twitter,
      facebook,
      reddit,
    } = this.state

    localStorage.setItem(constants.localStorage.IEO_signed, true)
    this.setState({ isSaved: true })

    firestore.updateUserData({
      facebook,
      twitter,
      reddit,
    })
  }

  render() {
    const { isSaved, twitter, reddit, facebook } = this.state
    const linked = Link.all(this, 'twitter', 'facebook', 'reddit')
    const titles = [
      (<FormattedMessage
        id="IEO_titles_1"
        defaultMessage="Step"
      />),
      (<FormattedMessage
        id="IEO_titles_2"
        defaultMessage="Action"
      />),
      (<FormattedMessage
        id="IEO_titles_3"
        defaultMessage="Input"
      />),
    ]
    const rows = [
      {
        action: <FormattedMessage
          id="IEO_row_1"
          defaultMessage="Subscribe to our twitter https://twitter.com/SwapOnlineTeam, enter your twitter: "
        />,
        placeholder: 'Twitter',
        link: linked.twitter,
      },
      {
        action: <FormattedMessage
          id="IEO_row_2"
          defaultMessage="Subscribe to our facebook https://www.facebook.com/SwapOnlineTeam, enter your facebook: "
        />,
        placeholder: 'Facebook',
        link: linked.facebook,
      },
      {
        action: <FormattedMessage
          id="IEO_row_3"
          defaultMessage="Subscribe to our reddit https://www.reddit.com/r/SwapOnline, enter your reddit: "
        />,
        placeholder: 'Reddit',
        link: linked.reddit,
      },
    ]


    return (
      <div styleName="IEO">
        <div styleName="IEO__container">
          <SubTitle>
            <FormattedMessage
              id="IEO_title_1"
              defaultMessage="You have registered for IEO, follow these steps"
            />
          </SubTitle>

          <Table
            id="table-wallet"
            className={styles.wallet}
            titles={titles}
            rows={rows}
            rowRender={(row, index, selectId, handleSelectId) => (
              <Row
                key={row}
                currency={row}
                selectId={selectId}
                index={index}
                handleSelectId={handleSelectId}
                row={rows[index]}
                disabled={this.state.isSaved}
              />
            )}
          />
          <Button
            styleName="button"
            onClick={this.handleSignUp}
            disabled={
              isSaved
              || twitter.length === 0
              || reddit.length === 0
              || facebook.length === 0
            }
          >
            {
              isSaved
                ? (
                  <FormattedMessage
                    id="IEO_btn_2"
                    defaultMessage="Registred"
                  />
                )
                : (
                  <FormattedMessage
                    id="IEO_btn_1"
                    defaultMessage="Register"
                  />
                )
            }
          </Button>
        </div>
      </div>
    )
  }
}

const Row = ({ row, index, selectId, handleSelectId, disabled }) => (
  <tr>
    <td>
      {`${index + 1}.`}
    </td>
    <td>
      {row.action}
    </td>
    <td>
      <Input
        // styleName="input"
        valueLink={row.link}
        placeholder={row.placeholder}
        disabled={disabled}
      />
    </td>
  </tr>
)

export default IEO
