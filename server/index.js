import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import mongoose from 'mongoose'
import { setupSocket } from './socket/index.js'
import scheduleRouter from './routes/schedules.js'
import staffRouter from './routes/staff.js'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
})

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

// Attach io to req so routes can emit events
app.use((req, _res, next) => { req.io = io; next() })

// Routes
app.use('/api/schedules', scheduleRouter)
app.use('/api/staff', staffRouter)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Socket.io
setupSocket(io)

// Connect to MongoDB then start server
const PORT = process.env.PORT || 3001
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anesthesiaflow')
  .then(() => {
    console.log('MongoDB connected')
    httpServer.listen(PORT, () => console.log(`Server running on :${PORT}`))
  })
  .catch((err) => { console.error('MongoDB connection error:', err); process.exit(1) })
