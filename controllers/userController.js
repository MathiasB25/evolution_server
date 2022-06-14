import User from "../models/User.js"
import Token from "../models/Token.js"
import createToken from "../helpers/createToken.js"
import createJWT from '../helpers/createJWT.js'

const register = async (req, res) => {
    const { email } = req.body
    const emailExist = await User.findOne({email})
    
    if(emailExist) {
        const error = new Error('Ya hay un usuario registrado con este email')
        return res.status(400).json({ msg: error.message })
    }

    try {
        const user = new User(req.body)
        /* user.token = createToken() */
        await user.save()
        res.status(200).json({ msg: 'Usuario creado correctamente' })
    } catch (error) {
        console.log(error)
    }
}

const authenticate = async (req, res) => {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if(!user) {
        const error = new Error('El usuario no existe')
        return res.status(404).json({ msg: error.message })
    }
    // Check if user is confiremd
    if(!user.confirmed) {
        const error = new Error('Debes confirmar tu cuenta')
        return res.status(400).json({ msg: error.message })
    }
    if(await user.checkPassword(password)) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: createJWT(user._id),
            wallet: user.wallet
        })
    } else {
        const error = new Error('Contraseña incorrecta')
        return res.status(403).json({ msg: error.message })
    }
}

const confirm = async (req, res) => {
    const { token } = req.params

    const user = await User.findOne({token})
    if(!user) {
        const error = new Error('Token no válido')
        return res.status(404).json({ msg: error.message })
    }

    try {
        user.confirmed = true
        user.token = ''
        user.save()
        res.json({ msg: 'Usuario confirmado correctamente '})
    } catch (error) {
        console.log(error)
    }
}

const resetPassword = async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({ email })
    if(!user) {
        const error = new Error('No hay un usuario registrado con ese email')
        return res.status(404).json({ msg: error.message })
    }

    try {
        user.token = createToken()
        user.save()
        /* TODO: Importar nodemailer al proyecto y enviar email cuando el usuario resetee su password */
        res.json({ msg: 'Se enviaron instrucciones a tu email' })
    } catch (error) {
        console.log(error)
    }
}

const checkToken = async (req, res) => {
    const { token } = req.params

    const user = await User.findOne({ token })
    if(!user) {
        const error = new Error('Token no válido')
        return res.status(404).json({ msg: error.message })
    }
    res.json({ msg: 'Token válido' })
}

const newPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    const user = await User.findOne({ token })
    if(!user) {
        const error = new Error('Token no válido')
        return res.status(404).json({ msg: error.message })
    }

    user.password = password
    user.token = ''
    try {
        await user.save()
        res.json({ msg: 'Has cambiado la contraseña correctamente' })
    } catch (error) {
        console.log(error)
    }
}

const profile = async (req, res) => {
    const { user } = req

    res.json(user)
}

const getWallet = async (req, res) => {
    const { user } = req.body

    if (String(user).match(/^[0-9a-fA-F]{24}$/)) {
        const tokens = await Token.find({ user })
        if (tokens == '') {
            res.json(tokens)
            return
        }

        res.json(tokens)
    } else {
        res.json({ msg: 'ID no encontrado' })
    }
}

export {
    register,
    authenticate,
    confirm,
    resetPassword,
    checkToken,
    newPassword,
    profile,
    getWallet
}
