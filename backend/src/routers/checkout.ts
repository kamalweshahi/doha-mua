import { Router } from 'express'
import bodyValidation from '../middlewares/body-validation'
import { checkout, listMyPurchases } from '../controllers/checkout/controller'
import { checkoutValidator } from '../controllers/checkout/validator'
const router = Router()
router.post('/', bodyValidation(checkoutValidator), checkout)
router.get('/mine', listMyPurchases)
export default router
