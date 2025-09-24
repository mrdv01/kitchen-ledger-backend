import express from 'express';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import {
    createItemCtrl,
    deleteItemCtrl,
    fetchAllItemsCtrl,
    fetchSingleItemCtrl,
    bulkCreateItemsCtrl,
} from '../controllers/itemCtrl.js';
import { parseReceiptController } from '../controllers/receiptController.js';
import upload from '../middlewares/uploadMiddleware.js';

const itemRoutes = express.Router();


itemRoutes.post('/:id', isLoggedIn, createItemCtrl);


itemRoutes.get('/:id', isLoggedIn, fetchAllItemsCtrl);


itemRoutes.get('/transaction/:itemId', isLoggedIn, fetchSingleItemCtrl);


itemRoutes.delete('/:groupId/:itemId', isLoggedIn, deleteItemCtrl);


itemRoutes.post('/receipt/upload', isLoggedIn, upload.single('file'), parseReceiptController);


itemRoutes.post('/bulk/:groupId', isLoggedIn, bulkCreateItemsCtrl);

export default itemRoutes;
