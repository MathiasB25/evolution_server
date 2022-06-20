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
    /* Check if user account is disabled */
    if(user.disabled) {
        const error = new Error('Esta cuenta se encuentra desactivada')
        return res.status(403).json({ msg: error.message })
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

const editProfile = async (req, res) => {
    const { name, email, password, userId } = req.body

    if (String(userId).match(/^[0-9a-fA-F]{24}$/)) {
        const user = await User.findOne({ userId })
        if(!user) {
            return
        }

        if (String(name).length < 20) {
            try {
                user.name = name
                user.email = email
                user.password = password
                await user.save()
                res.json(user)
            } catch (error) {
                res.json({ msg: 'Hubo un error al guardar los cambios' })
            }

        }
    }
}

const disable = async (req, res) => {
    const { _id } = req.body

    if(String(_id).match(/^[0-9a-fA-F]{24}$/)) {
        const user = await User.findOne({ _id })
        if(user) {
            console.log(user)
            user.disabled = true
            try {
                await user.save()
                res.json({ msg: 'Has desactivado tu cuenta correctamente'})
            } catch (error) {
                console.log(error)
                res.json({ msg: 'Hubo un problema al desactivar tu cuenta' })   
            }
        }
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
    getWallet,
    editProfile,
    disable
}
