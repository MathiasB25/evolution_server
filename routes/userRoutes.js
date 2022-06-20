import express from 'express'
import checkAuth from '../middleware/checkAuth.js'
import { register, authenticate, confirm, resetPassword, checkToken, newPassword, profile, getWallet, editProfile, disable } from '../controllers/userController.js'

const router = express.Router()

// Authentication, registration and confirmation of Users
router.post('/', register) //Create new user
router.post('/login', authenticate) //Authenticate user
router.get('/confirm/:token', confirm) // Confirm user
router.post('/reset-password', resetPassword)
router.route('/reset-password/:token').get(checkToken).post(newPassword)

router.get('/profile', checkAuth, profile)
router.post('/edit', checkAuth, editProfile)
router.post('/disable', checkAuth, disable)
/* TODO: checkAuth impide que se puedan hacer peticiones desde el frontend */
router.post('/wallet', getWallet)

export default router