import Router from 'express'

import kraken from '../../services/instances/kraken'


//@ts-ignore
const router = new Router()

router.get('/', async  (req, res) => {
   await kraken.getBalance().then(
     (r) => {
       res.json(Object.entries(r.result))
     }
   )
})


export default router