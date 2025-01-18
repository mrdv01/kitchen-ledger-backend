import asyncHandler from "express-async-handler";
import Item from "../model/Item.js";
import Group from "../model/Group.js";

export const createItemCtrl = asyncHandler(async (req, res) => {
    const { name, cost } = req.body;
    const groupId = req.params.id;
    const userId = req.userAuthId

    //find the group
    const group = await Group.findById(groupId).populate('members');
    if (!group) {
        throw new Error("Group not found");
    }

    // Check if the user is part of the group
    const isUserInGroup = group.members.some(member => member._id.toString() === userId);
    if (!isUserInGroup) {
        throw new Error("user not a part of group")
    }



    //remaing member for payment
    const remaingMembers = group.members.filter((member) => member?._id.toString() !== userId);

    const paid = remaingMembers.length > 0 ? false : true;

    //creating item
    const item = await Item.create({
        name, cost, purchasedBy: userId,
        membersRemainingForPayment: remaingMembers.map((member) => member?._id),
        paid,
        group: group._id
    });
    //push item to group
    group.items.push(item);
    await group.save();

    res.status(201).json({
        success: true,
        message: "item created successfully",
        data: item,
    });


})

export const fetchSingleItemCtrl = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    // Find item and populate purchasedBy and membersRemainingForPayment
    const item = await Item.findById(itemId)
        .populate('purchasedBy', 'fullname email')
        .populate('membersRemainingForPayment', 'fullname email');

    // Check if item exists
    if (!item) {
        return res.status(404).json({
            success: false,
            message: "Item not found"
        });
    }

    res.status(200).json({
        success: true,
        data: item
    });
});


//fetch all items of specific group

export const fetchAllItemsCtrl = asyncHandler(async (req, res) => {
    const groupId = req.params.id;
    //find the group
    const group = await Group.findById(groupId).populate({
        path: 'items',
        populate: {
            path: 'purchasedBy',
            select: "fullname"
        },
        populate: {
            path: 'membersRemainingForPayment',
            select: 'fullname'
        }
    });
    if (!group) {
        throw new Error("group not found")
    }

    const items = group?.items;
    res.status(201).json({
        success: true,
        message: "items fetched successfully",
        data: items,
    });
})



//delete item 
export const deleteItemCtrl = asyncHandler(async (req, res) => {

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
        message: "item deleted successfully",
        updatedGroup
    })




})