import { useState, useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'
import styles from './UniV3Pools.scss'
import CSSModules from 'react-css-modules'
import actions from 'redux/actions'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'
import getCoinInfo from 'common/coins/getCoinInfo'
import Switching from 'components/controls/Switching/Switching'
import { Direction } from './types'
import constants from 'common/helpers/constants'
import uniswap from 'redux/actions/uniswap'

function UniV3Pools(props) {
  const {
    currentLiquidityPair,
    parentState,
    flipCurrency,
    selectCurrency,
  } = props
  const {
    currencies,
    network,
    baseChainWallet,
    baseChainWallet: {
      address: userWalletAddress,
    },
    spendedCurrency,
    spendedCurrency: {
      name: spendedName,
    },
    receivedCurrency,
    receivedCurrency: {
      name: receivedName,
    },
    fromWallet,
    toWallet,
  } = parentState
  
  const tokenA = uniswap.wrapCurrency(
    network.networkVersion,
    fromWallet?.contractAddress || constants.ADDRESSES.EVM_COIN_ADDRESS
  )
  const tokenB = uniswap.wrapCurrency(
    network.networkVersion,
    toWallet?.contractAddress || constants.ADDRESSES.EVM_COIN_ADDRESS
  )
  console.log('>>> TOKEN A-B', tokenA, tokenB)
  console.log('>>> userWalletAddress', userWalletAddress)
  const [ isPoolFetching, setIsPoolFetching ] = useState((currentLiquidityPair==null) ? false : true)
  const [ poolInfo, setPoolInfo ] = useState<any>(null)
  const [ userPositions, setUserPositions ] = useState<any[]>([])

  useEffect(() => {
    if (currentLiquidityPair) {
      // Fetching pool info
      setIsPoolFetching(true)
      actions.uniswap.getUserPoolLiquidityV3({
        owner: userWalletAddress,
        baseCurrency: network.currency,
        chainId: network.networkVersion,
        poolAddress: currentLiquidityPair,
      }).then(({ pool, positions }) => {
        console.log('>>> getUserPoolLiquidityV3', pool, positions)
        setPoolInfo(pool)
        setUserPositions(positions)
        setIsPoolFetching(false)
      }).catch((err) => {
        console.log('>ERR getUserPoolLiquidityV3', err)
      })
    } else {
      setIsPoolFetching(false)
    }
  }, [ currentLiquidityPair ])

  console.log('>>> UniV3Pools', props)
  const formatAmount = (priceIn) => {
    priceIn = Number(priceIn)
    let roundTo = (priceIn < 0.009) ? 5 : 4
    if (priceIn > 100) roundTo = 3
    const fixedPrice = Number(priceIn.toFixed(roundTo))
    if (fixedPrice == 0) return 0
    return (fixedPrice < 0.00001) ? '<0.00001' : fixedPrice
  }
  return (
    <div>
      <div styleName="currencyHolder">
        <CurrencySelect
          selectedItemRender={(item) => {
            const { blockchain } = getCoinInfo(item.value)

            return blockchain ? `${item.title.replaceAll('*','')} (${blockchain})` : item.fullTitle
          }}
          styleName="currencySelect"
          placeholder="Enter the name of coin"
          selectedValue={spendedCurrency.value}
          onSelect={(value) => selectCurrency({
            direction: Direction.Spend,
            value,
          })}
          currencies={currencies}
        />
        <div styleName="arrows">
          <Switching noneBorder onClick={flipCurrency} />
        </div>
        <CurrencySelect
          selectedItemRender={(item) => {
            const { blockchain } = getCoinInfo(item.value)

            return blockchain ? `${item.title.replaceAll('*','')} (${blockchain})` : item.fullTitle
          }}
          styleName="currencySelect"
          placeholder="Enter the name of coin"
          selectedValue={receivedCurrency.value}
          onSelect={(value) => {
            selectCurrency({
              direction: Direction.Receive,
              value,
            })
          }}
          currencies={currencies}
        />
      </div>
      {isPoolFetching ? (
        <>
          <div>Fetching pair info</div>
        </>
      ) : (
        <>
          {currentLiquidityPair == null ? (
            <>
              <div>This pair dont have liquidity - create it</div>
            </>
          ) : (
            <>
              <div>
                {userPositions.map((posInfo) => {
                  const {
                    fee,
                    tokenId,
                    priceHigh,
                    priceLow,
                    token0,
                    token1,
                  } = posInfo

                  return (
                    <div key={tokenId}>
                      <div>#{tokenId}</div>
                      <div>fee: {fee/10000}%</div>
                      <div>
                        <div>Liquidity</div>
                        <div>
                          {formatAmount(token0.amount)} {token0.symbol}
                        </div>
                        <div>
                          {formatAmount(token1.amount)} {token1.symbol}
                        </div>
                      </div>
                      <div>
                        <div>Price</div>
                        {(tokenA.toLowerCase() == token0.address.toLowerCase() && tokenB.toLowerCase() == token1.address.toLowerCase()) ? (
                          <>
                            <div>Min: {formatAmount(priceHigh.buyOneOfToken1)} {token0.symbol} per {token1.symbol}</div>
                            <div>Max: {formatAmount(priceLow.buyOneOfToken1)} {token0.symbol} per {token1.symbol}</div>
                          </>
                        ) : (
                          <>
                            <div>Min: {formatAmount(priceLow.buyOneOfToken0)} {token1.symbol} per {token0.symbol}</div>
                            <div>Max: {formatAmount(priceHigh.buyOneOfToken0)} {token1.symbol} per {token0.symbol}</div>
                          </>
                        )}
                      </div>
                      <div>--------------------------------------</div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}


export default CSSModules(UniV3Pools, styles, { allowMultiple: true })