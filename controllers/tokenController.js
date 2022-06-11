import Token from '../models/Token.js'

const buy = async (req, res) => {
    const { user, symbol, amount, price } = req.body

    if (user.match(/^[0-9a-fA-F]{24}$/)) {
        const tokens = await Token.find({ user })
        if(tokens != '') {
            const token = tokens.filter(token => token.symbol === symbol)
            if(token != '') {
                const busd = tokens.filter(token => token.symbol === 'BUSD')
                if (token[0].symbol !== 'BUSD') busd[0].amount = (Number(busd[0].amount) - Number(price * amount))
                token[0].amount = (Number(token[0].amount) + Number(amount))
                try {
                    await busd[0].save()
                    await token[0].save()
                    res.json(token)
                } catch (error) {
                    console.log(error)
                }
                return
            }

            const busd = tokens.filter(token => token.symbol === 'BUSD')
            if(busd != '') {
                busd[0].amount = (Number(busd[0].amount) - Number(price * amount))
                const newToken = new Token(req.body)
                try {
                    await busd[0].save()
                    await newToken.save()
                    res.json({ msg: `Compraste ${token.amount} ${token.symbol}` })
                } catch (error) {
                    res.json({ msg: 'Hubo un problema al procesar la solicitud' })
                }
                return
            }
        }
    
        const token = new Token(req.body)
        try {
            await token.save()
            res.json({ msg: `Compraste ${token.amount} ${token.symbol}` })
        } catch (error) {
            res.json({ msg: 'Hubo un problema al procesar la solicitud' })
        }
    }
}

const sell = async (req, res) => {
    const { user, symbol, amount, price } = req.body
    if (user.match(/^[0-9a-fA-F]{24}$/)) {
        const tokens = await Token.find({ user })
        if(tokens == '') {
            res.json({ msg: 'Billeteria vacía' })
            return
        }

        const token = tokens.filter( token => token.symbol === symbol)
        if(token == '') {
            res.json({ msg: 'Saldo insuficiente' })
            return
        }
        if(Number(amount) > Number(token[0].amount)) {
            res.json({ msg: 'No puedes vender más de lo que tienes' })
            return
        }
        const busd = tokens.filter(token => token.symbol === 'BUSD')
        try {
            busd[0].amount = (busd[0].amount + Number(price * amount))
            await busd[0].save()
            token[0].amount = (token[0].amount - amount)
            await token[0].save()
            res.json(tokens)
        } catch (error) {
            console.log(error)
        }
    } else {
        res.json({ msg: 'ID no encontrado' })
    }
}

export {
    buy,
    sell
}