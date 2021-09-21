import { useEffect, useState } from 'react'
import { connect } from 'redaction'
import { transactions, constants } from 'helpers'
import reducers from 'redux/core/reducers'
import actions from 'redux/actions'

function Transaction(props) {
  const { pendingQueue, children } = props
  const [currentHash, setCurrentHash] = useState('')

  useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout> | undefined = undefined

    if (pendingQueue.length) {
      // if (currentHash !== pendingQueue[0].hash) {
      //    setCurrentHash(pendingQueue[0].hash)
      // ...
      // }
      const { networkData, hash } = pendingQueue[0]
      const web3 = actions[networkData.currency.toLowerCase()].Web3

      intervalId = setInterval(async () => {
        const receipt = await web3.eth.getTransactionReceipt(hash)
        console.log('%c interval check', 'color:gray;font-size:20px')
        console.log('receipt: ', receipt)
        console.log('pendingQueue[0]: ', pendingQueue[0])

        if (receipt !== null) {
          console.log('%c receipt', 'color:green;font-size:20px')
          const explorerLink = transactions.getLink(networkData.currency.toLowerCase(), receipt.transactionHash)
          console.log('explorerLink: ', explorerLink)
         
          actions.notifications.show(constants.notifications.Transaction, {
            link: explorerLink,
            completed: true,
          })

          reducers.transactions.removeHashFromQueue()

          if (intervalId) clearInterval(intervalId)
        }
      }, 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [pendingQueue.length])

  return children
}

export default connect(({ transactions }) => ({
  pendingQueue: transactions.pendingQueue,
}))(Transaction)
