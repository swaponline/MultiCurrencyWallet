import Router from 'express'

import {
  listOrders,
  listAllOrders,
  listMyOrders,
  listOthersOrders,
  filterOrders,
  requestedOrders,

  // orderStatus,
  getOrder,
  createOrder,
  deleteOrder,
  deleteAllOrders,
  forceDeleteAllOrders,

  requestOrder,
  acceptRequest,
  requestPartialFulfilment,
} from './controller'


const router = Router()

// order list
router.get('/', listOrders)
router.get('/all', listAllOrders)
router.get('/my', listMyOrders)
router.get('/others', listOthersOrders)
router.get('/search', filterOrders)
router.get('/requests', requestedOrders)

// create new order
router.post('/', createOrder)

// delete order(s)
router.delete('/all', deleteAllOrders)
router.get('/all/delete', deleteAllOrders)
router.get('/all/force-delete', forceDeleteAllOrders)
router.delete('/:id', deleteOrder)
router.get('/:id/delete', deleteOrder)

// actions with order
router.get('/:id', getOrder)

// request swap
router.put('/:id', requestOrder)
router.get('/:id/request', requestOrder)
router.get('/:id/request-partial', requestPartialFulfilment)

// incoming request to swap
router.get('/:id/accept', acceptRequest)
router.get('/:id/accept/:peer', acceptRequest)
router.get('/:id/decline/:peer', acceptRequest)


export default router
