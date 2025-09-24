import dotenv from "dotenv";
import express from "express";
import dbConnect from "../config/dbConnect.js";
import userRoutes from "../routes/usersRoutes.js";
import cors from 'cors';
// import session, { Cookie, Session } from "express-session";
import { globalErrHandler, notFound } from "../middlewares/globalErrHandler.js";
import groupRoutes from "../routes/groupRoutes.js";
import itemRoutes from "../routes/itemRoutes.js";
import transactionRoutes from "../routes/transactionRoutes.js";
dotenv.config();
dbConnect();



const app = express();
//cors
app.use(cors());
//pass incoming data
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/group", groupRoutes);
app.use("/api/v1/group/item", itemRoutes);
app.use("/api/v1/transactions", transactionRoutes);


//global err handler
app.use(notFound)
app.use(globalErrHandler);

export default app;