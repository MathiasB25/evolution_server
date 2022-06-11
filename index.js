import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from "./config/db.js";
import userRoutes from './routes/userRoutes.js'
import tokenRoutes from './routes/tokenRoutes.js'

const app = express()
app.use(express.json()) 

dotenv.config()

connectDB()

// CORS
/* const whitelist = [process.env.CLIENT_URL]

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('CORS Error'))
        }
    }
}

app.use(cors(corsOptions)) */

/* Routing */
app.use('/api/users', userRoutes)
app.use('/api/tokens', tokenRoutes)

const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => {
    console.log(`Server running in port: ${PORT}`)
})