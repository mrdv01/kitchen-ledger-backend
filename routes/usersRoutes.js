import { getUserProfile, loginUserCtrl, registerUserCtrl, updatePassword, updateUserProfile } from "../controllers/usersCtrl.js";
import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

const userRoutes = express.Router();

userRoutes.post('/register', registerUserCtrl)
userRoutes.post('/login', loginUserCtrl)
userRoutes.get('/profile', isLoggedIn, getUserProfile)

userRoutes.put('/update-profile', isLoggedIn, updateUserProfile);

userRoutes.put('/update-password', isLoggedIn, updatePassword);



export default userRoutes;