const kraken = require ('../../services/instances/kraken')

const { Router } = require('express')
const router = new Router()


router.get('/', async  (req, res) => {
   await kraken.getBalance().then(
     (r) => {

       res.json(Object.entries(r.result))
     }
   )
})

module.exports = router