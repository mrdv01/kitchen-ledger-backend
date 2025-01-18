import express from 'express';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import { deleteTransactionCtrl, fetchSingleTransactionCtrl, getAllTransactionsCtrl, markItemPaidCtrl } from '../controllers/transactionCtrl.js';

const transactionRoutes = express.Router();

transactionRoutes.get('/:itemId', isLoggedIn, fetchSingleTransactionCtrl);
transactionRoutes.delete('/:itemId/:groupId', isLoggedIn, deleteTransactionCtrl);

transactionRoutes.post('/paid/:itemId/:userId', isLoggedIn, markItemPaidCtrl);

transactionRoutes.get('/', isLoggedIn, getAllTransactionsCtrl);

export default transactionRoutes;