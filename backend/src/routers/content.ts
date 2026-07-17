import { Router } from 'express'
import { readWebsiteContent } from '../controllers/content/controller'
const router = Router()
router.get('/', readWebsiteContent)
export default router
