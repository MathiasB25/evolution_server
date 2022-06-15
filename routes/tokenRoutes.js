import express from 'express'
import checkAuth from '../middleware/checkAuth.js'
import { buy, sell, deposit, currencies } from '../controllers/tokenController.js'

const router = express.Router()

router.get('/currencies', currencies)
router.post('/deposit', checkAuth, deposit)
router.post('/buy', checkAuth, buy)
router.post('/sell', checkAuth, sell)

export default router