import express from 'express'
import checkAuth from '../middleware/checkAuth.js'
import { buy, sell } from '../controllers/tokenController.js'

const router = express.Router()

router.post('/buy', checkAuth, buy)
router.post('/sell', checkAuth, sell)

export default router