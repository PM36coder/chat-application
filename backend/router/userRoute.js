import express from 'express';
import authTokenMiddle from '../middleware/authTokenMiddle.js';
import { getUserByUsername ,getAllUsers } from '../controller/getUserByUserNme.js';


const router = express.Router();

router.get('/search', authTokenMiddle, getUserByUsername)
router.get('/search/users', authTokenMiddle, getAllUsers)

export default router