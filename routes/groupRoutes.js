import express from 'express';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import { addMemberCtrl, calculateMonthlySpendingForAllGroupsCtrl, calculatePendingBillsForAllGroupsCtrl, calculateTotalSpentForAllGroupsCtrl, createGroupCtrl, deleteGroupCtrl, getGroupCtrl, getGroupMembersCtrl, getGroupMonthlySpentCtrl, getGroupPendingBillsCtrl, getGroupsCtrl, getGroupTotalSpentCtrl, getRecentForSingleGrpTransactionsCtrl, getRecentTransactionsCtrl, removeMemberCtrl, updateGroupName } from '../controllers/groupCtrl.js';

const groupRoutes = express.Router();

groupRoutes.post('/create', isLoggedIn, createGroupCtrl);
groupRoutes.post('/addmember/:id', isLoggedIn, addMemberCtrl);

groupRoutes.get('/', isLoggedIn, getGroupsCtrl);
groupRoutes.get('/totalspent', isLoggedIn, calculateTotalSpentForAllGroupsCtrl);


groupRoutes.get('/monthlyspent', isLoggedIn, calculateMonthlySpendingForAllGroupsCtrl);
groupRoutes.get('/pendingbills', isLoggedIn, calculatePendingBillsForAllGroupsCtrl);
groupRoutes.get('/:id/totalspent', isLoggedIn, getGroupTotalSpentCtrl);
groupRoutes.get('/:id/monthlyspent', isLoggedIn, getGroupMonthlySpentCtrl);
groupRoutes.get('/:id/pendingbills', isLoggedIn, getGroupPendingBillsCtrl);

groupRoutes.get('/transactions/recent', isLoggedIn, getRecentTransactionsCtrl);
groupRoutes.get('/transactions/recent/:id', isLoggedIn, getRecentForSingleGrpTransactionsCtrl);
groupRoutes.get('/:id', isLoggedIn, getGroupCtrl);
groupRoutes.get('/members/:id', isLoggedIn, getGroupMembersCtrl);
groupRoutes.delete('/delete/:groupId', isLoggedIn, deleteGroupCtrl);
groupRoutes.delete('/:groupId/:memberId', isLoggedIn, removeMemberCtrl);
groupRoutes.put('/update-group', isLoggedIn, updateGroupName);



export default groupRoutes;