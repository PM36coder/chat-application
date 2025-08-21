
import express from 'express';
import { sendMessage,getMessage ,deleteMessage} from '../controller/messageController.js'
import authTokenMiddle from '../middleware/authTokenMiddle.js'
const router = express.Router();
router.post('/send/:id', authTokenMiddle,sendMessage)
router.get('/get/:id', authTokenMiddle,getMessage)
router.delete('/delete/:id', authTokenMiddle,deleteMessage)
export default router