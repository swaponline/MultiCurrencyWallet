import React from 'react'
import Modal from 'components/modal/Modal/Modal'
import { FormattedMessage, injectIntl } from 'react-intl'
import actions from 'redux/actions'

@injectIntl
export default class TokenMultisignDeploy extends React.Component {
    constructor() {
        this.state = {
            step: 'enterAddress',
            partnerAddress: ''
        }
    }

    async onClick() {
        const { partnerAddress } = this.state

        this.setState({
            step: 'sendingTransaction'
        })

        try {
            await actions.tokenmultisig.deployWallet(
                participantAddress
            )

            actions.token.AddCustomERC20(tokenAddress, tokenSymbol, tokenDecimals)
            actions.core.markCoinAsVisible(tokenSymbol.toUpperCase())
    
        } catch (err) {
            console.error(err)
            this.setState({
                step: 'failedTransaction'
            })
        }
    }

    render() {
        return (
            <Modal name="Create USDT Multisig">
                {step === 'enterAddress' && <Fragment>
                    <div styleName="highLevel">
                        <FieldLabel inRow>
                            <span style={{ fontSize: '16px' }}>
                                <FormattedMessage defaultMessage="Адрес партнера"></FormattedMessage>
                            </span>
                        </FieldLabel>
                        <Input
                            valueLink={linked.partnerAddress}
                            focusOnInit pattern='0-9a-z-A-Z'
                            placeholder='Partner Address'
                        />
                    </div>
                    <p>
                        <FormattedMessage id="USDTMS_CreateWalletDeployNotice" defaultMessage="Контракт кошелька будет опубликован в блокчейн"></FormattedMessage>
                    </p>
                    <Button blue styleName="finishButton" fullWidget fullWidget onClick={this.onClick}>
                        <FormattedMessage id="USDTMS_CreateWalletDeployButton" defaultMessage="Подписать транзакцию и создать контракт" />
                    </Button>
                </Fragment>}
                {step === 'sendingTransaction' && <Fragment>
                    <FormattedMessage defaultMessage="Sending transaction..." />
                </Fragment>}
                }
                {step === 'failedTransaction' && <Fragment><FormattedMessage defaultMessage="Failed, try again" /></FormattedMessage></Fragment>}
                {step === 'successTransaction' && <Fragment><FormattedMessage defaultMessage="Success!" /></Fragment>}
            </Modal>
        )
    }
}