import asyncHandler from "express-async-handler";
import Item from "../model/Item.js";
import Group from "../model/Group.js";
import User from "../model/User.js";


export const fetchSingleTransactionCtrl = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    // Find item and populate purchasedBy and membersRemainingForPayment
    const item = await Item.findById(itemId)
        .populate('purchasedBy', 'fullname email')
        .populate('membersRemainingForPayment', 'fullname email')
        .populate('group', 'members');

    // Check if item exists
    if (!item) {
        return res.status(404).json({
            success: false,
            message: "Item not found"
        });
    }

    res.status(200).json({
        success: true,
        transaction: item
    });
});

//delete transaction 
export const deleteTransactionCtrl = asyncHandler(async (req, res) => {

    const { itemId, groupId } = req.params;

    //delete item from group's item array
    const updatedGroup = await Group.findByIdAndUpdate(groupId,
        { $pull: { items: itemId } },
        { new: true }
    );

    //delete item 
    await Item.findByIdAndDelete(itemId);

    res.json({
        success: true,
        message: "transaction deleted successfully",
        updatedGroup
    })




})

//mark a item paid by user
export const markItemPaidCtrl = asyncHandler(async (req, res) => {
    const { itemId, userId } = req.params;




    const upadatedItem = await Item.findByIdAndUpdate(itemId,
        { $pull: { membersRemainingForPayment: userId } },
        { new: true }
    )

    if (!upadatedItem) {
        throw new Error("Item not found")
    }

    if (upadatedItem.membersRemainingForPayment.length === 0) {
        upadatedItem.paid = true;
        await upadatedItem.save();
    }





    res.status(201).json({
        success: true,
        message: "item payment update successfully",
        upadatedItem,
    });



})


export const getAllTransactionsCtrl = asyncHandler(async (req, res) => {

    // Fetch all groups and populate items
    const userId = req.userAuthId;
    //find the user and groups associate with him
    const user = await User.findById(userId).populate({
        path: 'groups',
        populate: {
            path: 'items',
            populate: {
                path: 'purchasedBy',
                select: 'fullname'
            }

        }
    });
    const groups = user.groups;

    let allTransactions = groups.flatMap(group => group.items.map(item => ({
        ...item.toObject(), groupName: group.name

    })))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const transactions = allTransactions;


    //pagination
    //page
    const page = req.query.page ? parseInt(req.query.page) : 1;
    //limit
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    //startIdx
    const startIdx = (page - 1) * limit;
    //lastIdx
    const lastIdx = startIdx + limit;

    //total
    const total = allTransactions?.length;

    allTransactions = allTransactions.slice(startIdx, lastIdx);
    ;
    //pagination result
    const pagination = {};
    if (lastIdx < total) {
        pagination.next = {
            page: page + 1,
            limit,
        }
    }

    if (startIdx > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    };



    res.json({
        status: "success",
        allTransactions,
        transactions: transactions,
        total,
        pagination,
        message: "transactions fetched successfully",
    });
})
