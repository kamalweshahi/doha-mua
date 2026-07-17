import { Router } from 'express'
import adminEnforce from '../middlewares/admin-enforce'
import bodyValidation from '../middlewares/body-validation'
import { websiteContentValidator } from '../controllers/content/validator'
import { dashboard, getUserDetails, listNotifications, listPurchases, listUsers, markNotificationRead, setUserBlocked, updateWebsiteContent } from '../controllers/admin/controller'
const router = Router()
router.use(adminEnforce)
router.get('/dashboard', dashboard)
router.get('/users', listUsers)
router.get('/users/:id', getUserDetails)
router.put('/users/:id/blocked', setUserBlocked)
router.get('/purchases', listPurchases)
router.get('/notifications', listNotifications)
router.put('/notifications/:id/read', markNotificationRead)
router.put('/content', bodyValidation(websiteContentValidator), updateWebsiteContent)
export default router
