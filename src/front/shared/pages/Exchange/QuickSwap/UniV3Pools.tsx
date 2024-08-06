import { useState, useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'
import styles from './UniV3Pools.scss'
import CSSModules from 'react-css-modules'
import actions from 'redux/actions'


function UniV3Pools(props) {
  const {
    currentLiquidityPair,
    parentState,
  } = props
  const {
    network,
    baseChainWallet,
    baseChainWallet: {
      address: userWalletAddress,
    },
    spendedCurrency: {
      name: spendedName,
    },
    receivedCurrency: {
      name: receivedName,
    },
  } = parentState
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
        setIsPoolFetching(false)
      }).catch((err) => {
        console.log('>ERR getUserPoolLiquidityV3', err)
      })
    } else {
      setIsPoolFetching(false)
    }
  }, [ currentLiquidityPair ])
  console.log('>>> UniV3Pools', props)
  return (
    <div>
      {isPoolFetching ? (
        <>
          <div>Fetching pair info</div>
        </>
      ) : (
        <>
          {currentLiquidityPair == null ? (
            <>
              <div>
                Liquidity pools for pair
                &nbsp;
                <strong>{spendedName}</strong>
                <em>&nbsp;-&nbsp;</em>
                <strong>{receivedName}</strong>
              </div>
              <div>This pair dont have liquidity - create it</div>
            </>
          ) : (
            <>
              <div>
                Liquidity pools for pair
                &nbsp;
                <strong>{poolInfo?.token0?.symbol}</strong>
                <em>&nbsp;/&nbsp;</em>
                <strong>{poolInfo?.token1?.symbol}</strong>
              </div>
              <div>list pools</div>
            </>
          )}
        </>
      )}
    </div>
  )
}


export default CSSModules(UniV3Pools, styles, { allowMultiple: true })