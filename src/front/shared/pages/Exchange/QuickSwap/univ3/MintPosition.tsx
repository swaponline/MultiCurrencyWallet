import { useState, useEffect, useRef } from 'react'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import styles from './MintPosition.scss'
import CSSModules from 'react-css-modules'
import BigNumber from 'bignumber.js'
import actions from 'redux/actions'
import modals from 'helpers/constants/modals'
import {
  PositionAction,
  VIEW_SIDE,
  TOKEN,
} from './types'
import { renderPricePerToken } from './helpers'
import { formatAmount } from './helpers'
import Button from 'components/controls/Button/Button'
import BackButton from './ui/BackButton'
import AmountInput from './ui/AmountInput'


const defaultLanguage = defineMessages({
  fee_desc_100: {
    id: 'univ3_fee_desc_100',
    defaultMessage: 'Best for very stable pairs.',
  },
  fee_desc_500: {
    id: 'univ3_fee_desc_500',
    defaultMessage: 'Best for stable pairs.',
  },
  fee_desc_3000: {
    id: 'univ3_fee_desc_3000',
    defaultMessage: 'Best for most pairs.',
  },
  fee_desc_10000: {
    id: 'univ3_fee_desc_10000',
    defaultMessage: 'Best for exotic pairs.',
  }
})
function MintPosition(props) {
  const {
    token0Address,
    token1Address,
    token0Wallet,
    token1Wallet,
    activePair,
    setCurrentAction,
    baseCurrency,
    chainId,
    userDeadline,
    slippage,
    intl,
  } = props

  console.log('>>>> MIN POSITION', props)
  
  const allowedFees = [
    100,  // 0.01%
    500,  // 0.05%
    3000, // 0.3%
    10000,// 1%
  ]
  
  const [ poolsByFee, setPoolsByFee ] = useState({})
  const [ isPoolsByFeeFetching, setIsPoolsByFetching ] = useState(true)

  const [ viewSide, setViewSide ] = useState(VIEW_SIDE.A_TO_B)
  
  useEffect(() => {
    setIsPoolsByFetching(true)
    setPoolsByFee({})
    actions.uniswap.getPoolAddressV3All({
      baseCurrency,
      chainId,
      tokenA: token0Address,
      tokenB: token1Address,
      byFee: true,
    }).then((answer) => {
      setIsPoolsByFetching(false)
      setPoolsByFee(answer)
      let _activeFee = 0
      allowedFees.forEach((fee) => {
        if (answer[fee]) _activeFee = fee
      })
      setActiveFee(_activeFee)
      console.log('>>>> pools by fee', answer)
    }).catch((err) => {
      setIsPoolsByFetching(false)
      console.log('>>> fetch pools by fee err', err)
    })
  }, [token0Address, token1Address])
  
  const [ activeFee, setActiveFee ] = useState(0)
  
  const isWrappedToken0 = actions.uniswap.isWrappedToken({ chainId, tokenAddress: token0Address })
  const isWrappedToken1 = actions.uniswap.isWrappedToken({ chainId, tokenAddress: token1Address })

  const getTokenSymbol = (tokenType) => {
    return (tokenType == TOKEN._0)
      ? isWrappedToken0 ? baseCurrency : token0Wallet.currency
      : isWrappedToken1 ? baseCurrency : token1Wallet.currency
  }
  /*
  getPoolAddressV3All = async (params) => {
  const { baseCurrency, chainId } = params
  let { tokenA, tokenB, fee } = params
  */
  /*
  const [ poolViewSide, setPoolViewSide ] = useState(VIEW_SIDE.A_TO_B)
  
  const isWrappedToken0 = actions.uniswap.isWrappedToken({ chainId, tokenAddress: token0.address })
  const isWrappedToken1 = actions.uniswap.isWrappedToken({ chainId, tokenAddress: token1.address })

  const [ amount0, setAmount0 ] = useState(0)
  const [ amount1, setAmount1 ] = useState(0)


  const calcAmount = (amount, token) => {
    if (token == TOKEN._0) {
      const _amount1 = actions.uniswap.addLiquidityV3CalcAmount({
        amountIn: amount,
        price: currentPrice.buyOneOfToken0,
        priceHigh: priceHigh.buyOneOfToken0,
        priceLow: priceLow.buyOneOfToken0,
      }).toNumber()
      setAmount0(amount)
      setAmount1(_amount1)
    }
    if (token == TOKEN._1) {
      const _amount0 = actions.uniswap.addLiquidityV3CalcAmount({
        amountIn: amount,
        price: currentPrice.buyOneOfToken1,
        priceHigh: priceLow.buyOneOfToken1,
        priceLow: priceHigh.buyOneOfToken1,
      }).toNumber()
      setAmount0(_amount0)
      setAmount1(amount)
    }
  }

  const posInRange = (
    poolViewSide == VIEW_SIDE.A_TO_B
  ) ? (
    new BigNumber(priceHigh.buyOneOfToken1).isLessThanOrEqualTo(poolInfo.currentPrice.buyOneOfToken1) 
    && new BigNumber(priceLow.buyOneOfToken1).isGreaterThanOrEqualTo(poolInfo.currentPrice.buyOneOfToken1)
  ) : (
    new BigNumber(priceLow.buyOneOfToken0).isLessThanOrEqualTo(poolInfo.currentPrice.buyOneOfToken0)
    && new BigNumber(priceHigh.buyOneOfToken0).isGreaterThanOrEqualTo(poolInfo.currentPrice.buyOneOfToken0)
  )
  
  const token0IsWrapped = actions.uniswap.isWrappedToken({ chainId, tokenAddress: token0.address })
  const token1IsWrapped = actions.uniswap.isWrappedToken({ chainId, tokenAddress: token1.address })
  const hasWrappedToken = token0IsWrapped || token1IsWrapped
  console.log('>>> PositionInfo', props, positionId, poolInfo, positionInfo)
  console.log('>>> isWrappedToken', isWrappedToken0, isWrappedToken1, baseCurrency)
  const getTokenSymbol = (tokenType) => {
    return (tokenType == TOKEN._0)
      ? isWrappedToken0 ? baseCurrency : token0.symbol
      : isWrappedToken1 ? baseCurrency : token1.symbol
  }

  const [ isFetchingBalanceAllowance, setIsFetchingBalanceAllowance ] = useState(false)
  const [ doFetchBalanceAllowance, setDoFetchBalanceAllowance ] = useState(true)
  const [ token0BalanceWei, setToken0BalanceWei ] = useState<BigNumber>(new BigNumber(0))
  const [ token1BalanceWei, setToken1BalanceWei ] = useState<BigNumber>(new BigNumber(0))

  const [ token0AllowanceWei, setToken0AllowanceWei ] = useState<BigNumber>(new BigNumber(0))
  const [ token1AllowanceWei, setToken1AllowanceWei ] = useState<BigNumber>(new BigNumber(0))

  const fromWei = (token_type:TOKEN, wei:BigNumber): Number => {
    return new BigNumber(wei)
      .div(new BigNumber(10).pow((token_type == TOKEN._0) ? token0.decimals : token1.decimals))
      .toNumber()
  }

  const toWei = (token_type:TOKEN, amount:any): BigNumber => {
    return new BigNumber(amount)
      .multipliedBy(10 ** ((token_type == TOKEN._0) ? token0.decimals : token1.decimals))
  }

  const token0BalanceOk = token0BalanceWei.isGreaterThanOrEqualTo(toWei(TOKEN._0, amount0))
  const token1BalanceOk = token1BalanceWei.isGreaterThanOrEqualTo(toWei(TOKEN._1, amount1))
  const token0AllowanceOk = token0AllowanceWei.isGreaterThanOrEqualTo(toWei(TOKEN._0, amount0))
  const token1AllowanceOk = token1AllowanceWei.isGreaterThanOrEqualTo(toWei(TOKEN._1, amount1))
  const amountsNotZero = (new BigNumber(amount0).isGreaterThan(0) && new BigNumber(amount1).isGreaterThan(0))
  
  useEffect(() => {
    console.log('>>> check balance and approval')
    if (doFetchBalanceAllowance && token0Address && token1Address && !isFetchingBalanceAllowance) {
      setIsFetchingBalanceAllowance(true)
      setDoFetchBalanceAllowance(false)
      setToken0BalanceWei(new BigNumber(0))
      setToken1BalanceWei(new BigNumber(0))
      setToken0AllowanceWei(new BigNumber(0))
      setToken1AllowanceWei(new BigNumber(0))
      actions.uniswap.getBalanceAndAllowanceV3({
        baseCurrency,
        chainId,
        owner,
        token0Address,
        token1Address
      }).then((answer) => {
        setToken0BalanceWei(new BigNumber(answer.token0.balance))
        setToken0AllowanceWei(new BigNumber(answer.token0.allowance))
        setToken1BalanceWei(new BigNumber(answer.token1.balance))
        setToken1AllowanceWei(new BigNumber(answer.token1.allowance))
        setIsFetchingBalanceAllowance(false)
      }).catch((err) => {
        console.log('>> fail fetch balance and allowance', err)
        setIsFetchingBalanceAllowance(false)
      })
    }
  }, [ token0Address, token1Address, doFetchBalanceAllowance, isFetchingBalanceAllowance ])

  const [ isApproving, setIsApproving ] = useState(false)
  
  const handleApprove = (token_type:TOKEN) => {
    setIsApproving(true)
    actions.uniswap.approveTokenV3({
      baseCurrency,
      chainId,
      tokenAddress: (token_type == TOKEN._0) ? token0Address : token1Address,
      amountWei: toWei(token_type, (token_type == TOKEN._0) ? amount0 : amount1),
      waitReceipt: true,
    }).then((approveTx) => {
      console.log('>>> approved', approveTx)
      setDoFetchBalanceAllowance(true)
      setIsApproving(false)
    }).catch((err) => {
      console.log('Fail approve', err)
      setIsApproving(false)
    })
  }

  const [ isAddLiquidity, setIsAddLiquidity ] = useState(false)
  */
  const handleAddLiquidity = async () => {
    /*
    actions.modals.open(modals.Confirm, {
      title: (<FormattedMessage id="qs_uni_pos_mint_title" defaultMessage="Confirm action" />),
      message: (<FormattedMessage id="qs_uni_pos_mint_message" defaultMessage="Add liquidity?" />),
      onAccept: () => {
        setIsAddLiquidity(true)
        actions.uniswap.addLiquidityV3({
          chainId,
          baseCurrency,
          amount0Wei: toWei(TOKEN._0, amount0),
          amount1Wei: toWei(TOKEN._1, amount1),
          position: positionInfo,
          deadlinePeriod: userDeadline,
          slippage,
          waitReceipt: true
        }).then(() => {
          actions.modals.open(modals.AlertModal, {
            message: (<FormattedMessage id="qs_uni_pos_liq_added" defaultMessage="Liquidity successfully added" />),
            onClose: () => {
              setDoPositionsUpdate(true)
              setCurrentAction(PositionAction.INFO)
            }
          })
        }).catch((err) => {
          setIsAddLiquidity(false)
        })
      }
    })
    */
  }
  return (
    <div>
      <BackButton onClick={() => { setCurrentAction(PositionAction.LIST) }}>
        <FormattedMessage
          id="qs_uni_return_to_pos_list"
          defaultMessage="Return back to positions list"
        />
      </BackButton>
      <h3>
        <FormattedMessage
          id="uni_mint_new_pos_title"
          defaultMessage="Create new liquidity position"
        />
      </h3>
      <div styleName="selectFee">
        {allowedFees.map((fee) => {
          return (
            <div key={fee}>
              <label onClick={() => setActiveFee(fee)}>
                {(fee / 10000)+`%`}
                <input
                  type="radio"
                  name="uniPoolFee"
                  checked={activeFee == fee}
                  onChange={() => setActiveFee(fee)}
                />
              </label>
              <span>{intl.formatMessage(defaultLanguage[`fee_desc_${fee}`])}</span>
              <em>
                {poolsByFee[fee] ? (
                  <FormattedMessage
                    id="uni_mint_pool_created"
                    defaultMessage="Created"
                  />
                ) : (
                  <FormattedMessage
                    id="uni_mint_pool_notcreated"
                    defaultMessage="Not created"
                  />
                )}
              </em>
            </div>
          )
        })}
      </div>
      {!poolsByFee[activeFee] && (
        <div>
          <div>
            <FormattedMessage
              id="uni_mint_need_init_pool"
              defaultMessage="This pool must be initialized before you can add liquidity. To initialize, select a starting price for the pool. Then, enter your liquidity price range and deposit amount. Gas fees will be higher than usual due to the initialization transaction."
            />
          </div>
        </div>
      )}
      <div styleName="selectViewSide">
        <a 
          styleName={(viewSide == VIEW_SIDE.A_TO_B) ? 'active' : ''}
          onClick={() => { setViewSide(VIEW_SIDE.A_TO_B) }}
        >
          {getTokenSymbol(TOKEN._0)}
        </a>
        <a
          styleName={(viewSide == VIEW_SIDE.B_TO_A) ? 'active' : ''}
          onClick={() => { setViewSide(VIEW_SIDE.B_TO_A) }}
        >
          {getTokenSymbol(TOKEN._1)}
        </a>
      </div>
    </div>
  )
/*
  const isWorking = isApproving || isAddLiquidity

  return (
    <div>
      <div>
        <a onClick={() => { setCurrentAction(PositionAction.INFO) }}>
          Return back to positions
        </a>
      </div>
      <div>
        <h2>
          <FormattedMessage
            id="qs_uni_pos_liq_add_header"
            defaultMessage="Add liquidity"
          />
        </h2>
        <span>
          PositionId: {positionId}
        </span>
      </div>
      <div>
        <a onClick={() => { setPoolViewSide(VIEW_SIDE.A_TO_B) }}>{getTokenSymbol(TOKEN._0)}</a>
        <a onClick={() => { setPoolViewSide(VIEW_SIDE.B_TO_A) }}>{getTokenSymbol(TOKEN._1)}</a>
      </div>
      <div>
        <div>
          <strong>Min price</strong>
          <span>
            {renderPricePerToken({
              price: (poolViewSide == VIEW_SIDE.A_TO_B) ? priceHigh.buyOneOfToken1 : priceLow.buyOneOfToken0,
              tokenA: (poolViewSide == VIEW_SIDE.A_TO_B) ? getTokenSymbol(TOKEN._0) : getTokenSymbol(TOKEN._1),
              tokenB: (poolViewSide == VIEW_SIDE.A_TO_B) ? getTokenSymbol(TOKEN._1) : getTokenSymbol(TOKEN._0),
            })}
          </span>
        </div>
        <div>
          <strong>Max price</strong>
          <span>
            {renderPricePerToken({
              price: (poolViewSide == VIEW_SIDE.A_TO_B) ? priceLow.buyOneOfToken1 : priceHigh.buyOneOfToken0,
              tokenA: (poolViewSide == VIEW_SIDE.A_TO_B) ? getTokenSymbol(TOKEN._0) : getTokenSymbol(TOKEN._1),
              tokenB: (poolViewSide == VIEW_SIDE.A_TO_B) ? getTokenSymbol(TOKEN._1) : getTokenSymbol(TOKEN._0),
            })}
          </span>
        </div>
      </div>
      <div>
        <strong>Current price</strong>
        <span>
          {renderPricePerToken({
            price: (poolViewSide == VIEW_SIDE.A_TO_B) ? poolInfo.currentPrice.buyOneOfToken1 : poolInfo.currentPrice.buyOneOfToken0,
            tokenA: (poolViewSide == VIEW_SIDE.A_TO_B) ? getTokenSymbol(TOKEN._0) : getTokenSymbol(TOKEN._1),
            tokenB: (poolViewSide == VIEW_SIDE.A_TO_B) ? getTokenSymbol(TOKEN._1) : getTokenSymbol(TOKEN._0),
          })}
        </span>
      </div>
      <div>
        <div>
          <div>
            <input
              type="number"
              value={amount0}
              disabled={isWorking}
              onChange={(e) => { calcAmount(Number(e.target.value), TOKEN._0) }}
            />
            <span>{getTokenSymbol(TOKEN._0)}</span>
            <div onClick={() => { if (!isWorking) setDoFetchBalanceAllowance(true) }}>
              <em>
                <FormattedMessage
                  id="uni_balance_holder"
                  defaultMessage="Balance:"
                />
              </em>
              <i>{formatAmount(fromWei(TOKEN._0, token0BalanceWei))}</i>
            </div>
          </div>
        </div>
        <div>
          <div>
            <input
              type="number"
              value={amount1}
              disabled={isWorking}
              onChange={(e) => { calcAmount(Number(e.target.value), TOKEN._1) }}
            />
            <span>{getTokenSymbol(TOKEN._1)}</span>
            <div onClick={() => { if (!isWorking) setDoFetchBalanceAllowance(true) }}>
              <em>
                <FormattedMessage
                  id="uni_balance_holder"
                  defaultMessage="Balance:"
                />
              </em>
              <i>{formatAmount(fromWei(TOKEN._1, token1BalanceWei))}</i>
            </div>
          </div>
        </div>
      </div>
      <div>
        {isFetchingBalanceAllowance ? (
          <Button brand disabled={true} fullWidth>
            <FormattedMessage id="qs_uni_liq_add_fetching" defaultMessage="Fetching..." />
          </Button>
        ) : (
          <>
            {!(token0BalanceOk && token1BalanceOk) ? (
              <Button brand disabled={true} fullWidth>
                <FormattedMessage
                  id="qs_uni_liq_add_nocoins"
                  defaultMessage="Insufficient {symbol} balance"
                  values={{
                    symbol: (!token0BalanceOk)
                      ? getTokenSymbol(TOKEN._0)
                      : getTokenSymbol(TOKEN._1)
                  }}
                />
              </Button>
            ) : (
              <>
                {(amountsNotZero && !(token0AllowanceOk && token1AllowanceOk)) ? (
                  <Button
                    brand
                    disabled={isApproving}
                    fullWidth
                    onClick={() => {
                      handleApprove((!token0AllowanceOk) ? TOKEN._0 : TOKEN._1)
                    }}
                  >
                    {isApproving ? (
                      <FormattedMessage
                        id="qs_uni_liq_add_is_approving"
                        defaultMessage="Approving {symbol}"
                        values={{
                          symbol: (!token0AllowanceOk)
                            ? getTokenSymbol(TOKEN._0)
                            : getTokenSymbol(TOKEN._1)
                        }}
                      />
                    ) : (
                      <FormattedMessage
                        id="qs_uni_liq_add_do_approve"
                        defaultMessage="Approve {symbol}"
                        values={{
                          symbol: (!token0AllowanceOk)
                            ? getTokenSymbol(TOKEN._0)
                            : getTokenSymbol(TOKEN._1)
                        }}
                      />
                    )}
                  </Button>
                ) : (
                  <Button
                    brand
                    onClick={() => { handleAddLiquidity() }}
                    disabled={!amountsNotZero || isAddLiquidity}
                    fullWidth
                  >
                    {isAddLiquidity ? (
                      <FormattedMessage
                        id="qs_uni_pos_liq_add_processing"
                        defaultMessage="Adding liquidity"
                      />
                    ) : (
                      <FormattedMessage
                        id="qs_uni_pos_liq_add_confirm"
                        defaultMessage="Add liquidity"
                      />
                    )}
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
  */
}

export default injectIntl(CSSModules(MintPosition, styles, { allowMultiple: true }))