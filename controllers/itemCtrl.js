import asyncHandler from "express-async-handler";
import Item from "../model/Item.js";
import Group from "../model/Group.js";
import Notification from "../model/notificationModel.js";
import { io } from "../server.js";
import User from "../model/User.js";

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
    const notif = await Notification.create({
        group: groupId,
        message: `A new item "${name}" added costing ₹${cost} in ${group.name}`,
    });

    console.log("📨 Notification created", notif);
    io.to(groupId).emit("newNotification", notif);
    console.log("🔔 Emitting notification via Socket.IO to group:", groupId);




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


export const bulkCreateItemsCtrl = asyncHandler(async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.userAuthId;
    const { items } = req.body; // [{name, cost, qty?}]

    const group = await Group.findById(groupId).populate('members');
    if (!group) throw new Error("Group not found");

    const isUserInGroup = group.members.some(m => m._id.toString() === userId);
    if (!isUserInGroup) throw new Error("User not part of group");
    console.log(userId);
    const user = await User.findById(userId);
    console.log(user);
    const remainingMembers = group.members.filter(m => m._id.toString() !== userId);

    // Create all items
    const itemsToCreate = items.map(i => ({
        name: i.name,
        cost: i.cost,
        purchasedBy: userId,
        membersRemainingForPayment: remainingMembers.map(m => m._id),
        paid: remainingMembers.length === 0,
        group: group._id
    }));

    const createdItems = await Item.insertMany(itemsToCreate);

    // Push to group
    group.items.push(...createdItems.map(i => i._id));
    await group.save();

    // Notification
    const notif = await Notification.create({
        group: groupId,
        message: `member added ${createdItems.length} items via receipt in ${group.name}`,
    });
    console.log("📨 Notification created", notif);
    // Emit
    io?.to(groupId).emit("newNotification", notif);

    res.status(201).json({
        success: true,
        message: `${createdItems.length} items added successfully`,
        data: createdItems
    });
});
