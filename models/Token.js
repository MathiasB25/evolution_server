import mongoose from "mongoose";

const tokenSchema = mongoose.Schema({
    name: {
        type: String
    },
    symbol: {
        type: String
    },
    price: {
        type: Number
    },
    amount: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Token = mongoose.model('Token', tokenSchema)

export default Token