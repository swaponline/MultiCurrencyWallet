import { useEffect, useState } from 'react'
import { connect } from 'redaction'
import { transactions, constants } from 'helpers'
import reducers from 'redux/core/reducers'
import actions from 'redux/actions'

function Transactions(props) {
  const { pendingQueue, children } = props
  const [currentHash, setCurrentHash] = useState('')
  const customCheckInterval = 3_000
  const transactionResetInterval = 25_000
  let changingInterval = customCheckInterval

  useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout> | undefined = undefined

    const resetState = () => {
      reducers.transactions.removeLastTransactionFromQueue()
      changingInterval = customCheckInterval

      if (intervalId) clearInterval(intervalId)
    }

    if (pendingQueue.length) {
      if (currentHash !== pendingQueue[0].hash) {
        const { networkData, hash } = pendingQueue[0]
        const web3 = actions[networkData.currency.toLowerCase()].Web3

        setCurrentHash(hash)

        intervalId = setInterval(async () => {
          try {
            const receipt = await web3.eth.getTransactionReceipt(hash)

            if (transactionResetInterval === changingInterval) {
              resetState()
            }

            if (receipt !== null) {
              const link = transactions.getLink(
                networkData.currency.toLowerCase(),
                receipt.transactionHash,
              )

              actions.notifications.show(constants.notifications.Transaction, {
                completed: true,
                failed: !receipt.status,
                link,
              })

              resetState()
            }
          } catch (error) {
            changingInterval += 500

            console.group('%c fail on check receipt', 'color: red;')
            console.log(error)
            console.groupEnd()
          }
        }, changingInterval)
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [pendingQueue.length])

  return children
}

export default connect(({ transactions }) => ({
  pendingQueue: transactions.pendingQueue,
}))(Transactions)
