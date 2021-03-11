import Router from 'express'

import kraken from '../../services/instances/kraken'


const router = Router()

router.get('/', async (req, res) => {
   await kraken.getBalance().then(
     (r) => {
       res.json(Object.entries(r.result))
     }
   )
})


export default router