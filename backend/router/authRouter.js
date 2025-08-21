import express from 'express'
import {registerUser,loginUser,userLogout, updateProfileImage ,removeProfileImage}from '../controller/userController.js'
import authTokenMiddle from '../middleware/authTokenMiddle.js'
import upload from '../middleware/profileMiddlewere.js'
const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/upload-profile', authTokenMiddle, upload,updateProfileImage)
router.put('/remove-profile', authTokenMiddle, removeProfileImage);

router.get("/logout", userLogout);

export default router