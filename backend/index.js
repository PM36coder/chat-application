import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors'

import connectDB from './db/db.js';
import userRegisterRouter from './router/authRouter.js'
import messageRouter from './router/messageRoute.js'
import userRoute from './router/userRoute.js'
import {app, server} from './socket.io/socket.js'
dotenv.config(); // Yeh sabse upar hona chahiye
// const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://baatgram.netlify.app"
        
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Add this
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'], // Add this
    credentials: true
}))

app.use(cookieParser())

app.use(express.json());
app.get('/', (req, res) => {
  res.send('<h1>Server is working!</h1>');
});

app.use('/api/user', userRegisterRouter)
app.use('/api/message', messageRouter)
app.use('/api/users', userRoute)




connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
