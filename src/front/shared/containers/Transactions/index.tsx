import { useEffect, useState } from 'react'
import { connect } from 'redaction'
import { transactions, constants } from 'helpers'
import reducers from 'redux/core/reducers'
import actions from 'redux/actions'

function Transactions(props) {
  const { pendingQueue, children } = props
  const [currentHash, setCurrentHash] = useState('')
  const customCheckInterval = 2_000

  useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout> | undefined = undefined

    if (pendingQueue.length) {
      if (currentHash !== pendingQueue[0].hash) {
        const { networkData, hash } = pendingQueue[0]
        const web3 = actions[networkData.currency.toLowerCase()].Web3

        setCurrentHash(hash)

        intervalId = setInterval(async () => {
          try {
            const receipt = await web3.eth.getTransactionReceipt(hash)

            if (receipt !== null) {
              const link = transactions.getLink(
                networkData.currency.toLowerCase(),
                receipt.transactionHash
              )

              actions.notifications.show(constants.notifications.Transaction, {
                completed: true,
                link,
              })

              reducers.transactions.removeHashFromQueue()

              if (intervalId) clearInterval(intervalId)
            }
          } catch (error) {
            console.group('%c fail on check receipt', 'color: red;')
            console.log(error)
            console.groupEnd()
          }
        }, customCheckInterval)
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
