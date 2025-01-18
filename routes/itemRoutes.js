import express from 'express';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import { createItemCtrl, deleteItemCtrl, fetchAllItemsCtrl, fetchSingleItemCtrl } from '../controllers/itemCtrl.js';

const itemRoutes = express.Router();

itemRoutes.post('/:id', isLoggedIn, createItemCtrl);
itemRoutes.get('/:id', isLoggedIn, fetchAllItemsCtrl);
itemRoutes.get('/transaction/:itemId', isLoggedIn, fetchSingleItemCtrl);

itemRoutes.delete('/:groupId/:itemId', isLoggedIn, deleteItemCtrl);


export default itemRoutes;