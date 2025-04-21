import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import actions from 'redux/actions'
import cssModules from 'react-css-modules'
import styles from './ReferralProgramModal.scss'
import Link from 'local_modules/sw-valuelink'
import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FieldLabel, Input } from 'components/forms'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import { constants } from 'helpers'
import config from 'helpers/externalConfig'

import {
  GenerateJoinLink,
  GetReferralStatistic
} from 'plugins/ReferralSystem'

const defaultLanguage = defineMessages({
  title: {
    id: 'ReferralModalTitle',
    defaultMessage: 'Referral Program',
  },
  saveMnemonicFirst: {
    id: 'ReferralSaveMnemonicFirst',
    defaultMessage: 'Before using the referral system, you need to save your secret phrase.',
  },
  saveMnemonicButton: {
    id: 'ReferralSaveMnemonicButton',
    defaultMessage: 'Save secret phrase',
  },
  buttonGenerateJoinLink: {
    id: 'ReferralButtonGenerateJoinLink',
    defaultMessage: 'Show your referral link'
  }
})

@connect(({ user }) => ({ user }))
@cssModules(styles, { allowMultiple: true })
class ReferralProgramModal extends React.Component<any, any> {
  handleClose = () => {
    actions.modals.close(name)
  }
  constructor(props) {
    super(props)
    const {
      intl,
      user: {
        ethData: {
          address: addressForBonus,
        },
      },
    } = this.props
    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicDeleted = mnemonic === '-'
    this.state = {
      mnemonicDeleted,
      joinUrl: false,
      isJoinUrlFetching: false,
      addressForBonus,
      referrals: [],
      referralsFetched: false
    }
  }
  
  handleOpenSaveMnemonic() {
    actions.modals.open(constants.modals.SaveWalletSelectMethod, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
        const mnemonicDeleted = mnemonic === '-'
        this.setState({
          mnemonicDeleted,
        })
      },
    })
  }

  
  handleGenerateJoinLink() {
    const {
      addressForBonus
    } = this.state
    
    this.setState({
      isJoinUrlFetching: true,
    }, () => {
      GenerateJoinLink({
        userAddress: addressForBonus,
      }).then((joinUrl) => {
        console.log('Join url', joinUrl)
        this.setState({
          joinUrl,
          isJoinUrlFetching: false
        })
      }).catch((err) => {
        console.log('Fail get join url', err)
        this.setState({
          joinUrl: false,
          isJoinUrlFetching: false,
        })
      })
    })
    
  }
  componentDidMount() {
    GetReferralStatistic().then((info) => {
      // @ts-ignore
      if (info && info?.answer && info?.answer == "ok" && info?.referrals) {
        const {
          // @ts-ignore
          address: addressForBonus,
          // @ts-ignore
          referrals,
          // @ts-ignore
          joinUrl,
        } = info
        this.setState({
          addressForBonus,
          referrals,
          referralsFetched: true,
          joinUrl
        })
      }
    }).catch((err) => {
      console.log('>> GetReferralStatistic fail', err)
    })
  }
  render() {
    const {
      intl,
    } = this.props
    const {
      mnemonicDeleted,
      joinUrl,
      isJoinUrlFetching,
      addressForBonus,
      referrals,
      referralsFetched,
    } = this.state
    
    const labels = {
      title: intl.formatMessage(defaultLanguage.title),
    }

    
    return (
      <Modal
        name={`ReferralProgramModal`}
        title={labels.title}
        onClose={this.handleClose}
        showCloseButton
      >
        <div>
          {!mnemonicDeleted ? (
            <>
              <div>
                <FormattedMessage {...defaultLanguage.saveMnemonicFirst} />
              </div>
              <div>
                <Button blue onClick={this.handleOpenSaveMnemonic.bind(this)}>
                  <FormattedMessage {...defaultLanguage.saveMnemonicButton } />
                </Button>
              </div>
            </>
          ) : (
            <>
            
              Referral program
              <div>
                <strong>
                  The address to which you will receive bonuses in the form of token A for each user who registers using your link
                </strong>
              </div>
              <div>
                <strong>{addressForBonus}</strong>
              </div>
              {!joinUrl && (
                <div>
                  <Button
                    blue
                    pending={isJoinUrlFetching}
                    onClick={this.handleGenerateJoinLink.bind(this)}
                  >
                    <FormattedMessage {...defaultLanguage.buttonGenerateJoinLink } />
                  </Button>
                </div>
              )}
              {joinUrl && (
                <div>
                  <strong>You referral link</strong>
                  <div>{joinUrl}</div>
                </div>
              )}
              {referralsFetched && (
                <table>
                  <thead>
                    <tr>
                      <td>User name</td>
                      <td>Email</td>
                      <td>Registered at</td>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.length > 0 ? (
                      <>
                        {referrals.map((referral) => {
                          const {
                            ID,
                            name,
                            email,
                            registered
                          } = referral
                          return (
                            <tr key={ID}>
                              <td>{name}</td>
                              <td>{email}</td>
                              <td>{registered}</td>
                            </tr>
                          )
                        })}
                      </>
                    ) : (
                      <tr>
                        <td colSpan={3}>You dont have referrals</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </Modal>
    )
  }
}

export default injectIntl(ReferralProgramModal)
