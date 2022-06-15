import axios from 'axios'
import Token from '../models/Token.js'
import dotenv from 'dotenv'

dotenv.config()

let tokens = []
const firstFetch = async () => {
    const { data } = await axios(`https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_KEY}&ids=&interval=1d,30d&convert=USD`)
    tokens = data
}
const fetchAPI = async () => {
    const { data } = await axios(`https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_KEY}&ids=&interval=1d,30d&convert=USD`)
    tokens = data
} 
firstFetch()
setInterval( () => {
    fetchAPI()
}, 10000)

const currencies = async (req, res) => {
    res.json(tokens)
}

const deposit = async (req, res) => {
    const { user, symbol, amount, price } = req.body
    
    if (user.match(/^[0-9a-fA-F]{24}$/)) {
        /* Get all tokens of user */
        const tokens = await Token.find({ user })
        /* Check if req token already exists in user wallet */
        const token = tokens.filter(token => token.symbol === symbol)
        if (token.length > 0) {
            token[0].amount = token[0].amount + Number(amount)
            token[0].price = price
            await token[0].save()
            res.json(tokens)
        } else {
            /* If req token dont exist */
            const token = new Token(req.body)
            try {
                await token.save()
                tokens.push(token)
                res.json(tokens)
            } catch (error) {
                res.json({ msg: 'Hubo un problema al procesar la solicitud' })
            }
        }
    }
}

const buy = async (req, res) => {
    const { user, symbol, amount, price } = req.body

    if (user.match(/^[0-9a-fA-F]{24}$/)) {
        /* Get all tokens of user */
        const tokens = await Token.find({ user })
        /* Check if user have BUSD and if the amount they have is > to the amount they have buying */
        const busd = tokens.filter(token => token.symbol === 'BUSD')
        if(busd.length > 0 && busd[0].amount > (Number(amount) * Number(price))) {
            /* Check if req token already exists in user wallet */
            const token = tokens.filter(token => token.symbol === symbol)
            if(token.length > 0) {
                token[0].amount = token[0].amount + Number(amount)
                token[0].price = price
                try {
                    busd[0].amount = busd[0].amount - (Number(amount) * Number(price))
                    await busd[0].save()
                    await token[0].save()
                    res.json(tokens)
                } catch (error) {
                    res.json({ msg: 'Hubo un problema al procesar la solicitud' })
                }
            } else {
                /* If req token dont exist */
                const token = new Token(req.body)
                try {
                    busd[0].amount = busd[0].amount - (Number(amount) * Number(price))
                    await busd[0].save()
                    await token.save()
                    tokens.push(token)
                    res.json(tokens)
                } catch (error) {
                    res.json({ msg: 'Hubo un problema al procesar la solicitud' })
                }
            }
        } else {
            res.json({ msg: 'No tienes suficientes fondos' })
            return
        }
    }
}

const sell = async (req, res) => {
    const { user, symbol, amount, price } = req.body
    if (user.match(/^[0-9a-fA-F]{24}$/)) {
        const tokens = await Token.find({ user })
        /* Check if req token already exists in user wallet */
        const token = tokens.filter(token => token.symbol === symbol)
        if(token.length > 0) {
            /* Token exists */
            /* Check if token amount user have is > to sell amount */
            if((token[0].amount * token[0].price) > (Number(amount) * Number(price))) {
                /* User token amount > to sell amount  */
                /* Return the sell amount in BUSD */
                const busd = tokens.filter(token => token.symbol === 'BUSD')
                busd[0].amount = busd[0].amount + (Number(amount) * Number(price))
                token[0].amount = (token[0].amount - Number(amount))
                await busd[0].save()
                await token[0].save()
                res.json(tokens)
            } else {
                /* User token amount < to sell amount  */
                res.json({ msg: 'Fondos insuficientes' })
            }
        } else {
            /* Token dont exists */
            res.json({ msg: 'Estas intentando vender algo que no tienes' })
        }
    }
}

export {
    currencies,
    deposit,
    buy,
    sell
}