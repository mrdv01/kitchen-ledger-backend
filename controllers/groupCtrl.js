import Group from "../model/Group.js";
import asyncHandler from "express-async-handler";
import User from "../model/User.js";
import { populate } from "dotenv";
import Item from "../model/Item.js";
import mongoose from "mongoose";

/**
 * @desc   Create a new group
 * @route  POST /api/v1/users/create/group
 * @access Private
 */
export const createGroupCtrl = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const adminId = req?.userAuthId;

    if (!name || !adminId) {
        throw new Error("Group name and Admin ID are required.");
    }

    // Check if a group with the same name already exists for this admin
    const grpExisted = await Group.findOne({ Admin: adminId, name });
    if (grpExisted) {
        throw new Error("A group with the same name already exists for this admin.");
    }

    // Create a new group
    const group = await Group.create({ name, Admin: adminId, members: [adminId] });
    //add group to admin
    const user = await User.findById({ _id: adminId });

    user?.groups?.push(group?._id);

    await user.save();


    res.status(201).json({
        success: true,
        message: "Group created successfully",
        data: group,
    });
});


/**
 * @desc   Add member
 * @route  POST /api/v1/group/addmember/:id
 * @access Private
 */

export const addMemberCtrl = asyncHandler(async (req, res) => {
    const { username } = req.body;
    const groupId = req.params.id;
    if (!username) {
        throw new Error("please provide username");

    }
    //find member in UserSchema 
    const member = await User.findOne({ username: username });
    if (!member) {
        throw new Error("user not existed ");

    }
    //add member to group
    const group = await Group.findById(groupId);
    // Check if the member is already in the group
    const isAlreadyMember = group?.members?.includes(member._id);
    if (isAlreadyMember) {
        res.status(400);
        throw new Error("User is already a member of this group.");
    }
    group?.members?.push(member?._id);
    member?.groups?.push(group?._id);

    await group.save();
    await member.save();

    res.json({
        success: true,
        message: "member added successfully",
        member: {
            fullname: member?.fullname,
            username: member?.username
        },
    })
});

/**
 * @desc   delete group
 * @route  Delete /api/v1/group/delete/:groupId
 * @access Private
 */

export const deleteGroupCtrl = asyncHandler(async (req, res) => {
    //group id
    const { groupId } = req.params;
    //find  group
    const group = await Group.findById(groupId).populate('members', 'groups');

    if (!group) {
        throw new Error("Group not found");
    }

    //remove grp refrence from all members's groups array
    await User.updateMany(
        { _id: { $in: group.members } },
        { $pull: { groups: groupId } }
    );
    // Delete all items associated with the group
    await Item.deleteMany({ _id: { $in: group.items } });

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    res.json({
        status: "success",
        message: "Group deleted successfully",
        group
    });

})
export const removeMemberCtrl = asyncHandler(async (req, res) => {
    //member id
    const { groupId, memberId } = req.params;
    //update group by removing member
    const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        { $pull: { members: memberId } },
        { new: true }
    );


    if (!updatedGroup) {
        throw new Error("Group not found");
    }

    // Update member by removing group
    const updatedMember = await User.findByIdAndUpdate(
        memberId,
        { $pull: { groups: groupId } },
        { new: true }
    );

    if (!updatedMember) {
        throw new Error("Member not found");
    }


    res.json({
        success: true,
        message: "member delete successfully",
        updatedMembers: updatedGroup.members,
        updatedMember: updatedMember
    })



})

/**
 * @desc   get all members
 * @route  POST /api/v1/group/members/:id
 * @access Private
 */

export const getGroupMembersCtrl = asyncHandler(async (req, res) => {

    const { id } = req.params;
    //find group
    const group = await Group.findById(id).populate({
        path: "members",
        select: "username fullname",
        populate: {
            path: "groups",
            select: "name",
        }

    });
    if (!group) {
        throw new Error("group does not exists");

    }


    res.json({
        success: true,
        message: "group fetched successfully",
        members: group?.members,

    })
})




//@desc get group
//@route GET /api/v1/group/:id
//@access private

export const getGroupCtrl = asyncHandler(async (req, res) => {

    const { id } = req.params;
    //find group
    const group = await Group.findById(id).populate("members", "fullname");
    if (!group) {
        throw new Error("group does not exists");

    }


    res.json({
        success: true,
        message: "group fetched successfully",
        group,

    })
})

//@desc getall groups
//@route GET /api/v1/group
//@access private

export const getGroupsCtrl = asyncHandler(async (req, res) => {
    const userId = req.userAuthId;
    //find the user and groups associate with him
    const user = await User.findById(userId).populate({
        path: 'groups',
        populate: {
            path: 'members',
            select: 'fullname'
        }
    });
    const groups = user.groups;
    if (!groups) {
        throw new Error("group does not exists");

    }

    res.json({
        success: true,
        message: "groups fetched successfully",
        groups,

    })
})



//@desc total spent of group
//@route GET /api/v1/group/:id/totalspent
//@access private

export const getGroupTotalSpentCtrl = asyncHandler(async (req, res) => {
    const { id } = req.params;
    //total spent
    const totalSpent = await Group.calculateTotalSpent(id);




    res.json({
        success: true,
        message: "groups fetched successfully",
        totalSpent: totalSpent ? totalSpent : 0,

    })
})

export const getGroupMonthlySpentCtrl = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { month, year } = req.query;

    //total spent
    const monthlySpent = await Group.calculateMonthlySpending(id, month, year);




    res.json({
        success: true,
        message: "groups fetched successfully",
        monthlySpent: monthlySpent ? monthlySpent : 0,

    })
})

export const getGroupPendingBillsCtrl = asyncHandler(async (req, res) => {
    const { id } = req.params;


    //total spent
    const pendingBills = await Group.calculatePendingBills(id);




    res.json({
        success: true,
        message: "groups fetched successfully",
        pendingBills: pendingBills ? pendingBills : 0,

    })
})


export const calculateTotalSpentForAllGroupsCtrl = asyncHandler(async (req, res) => {
    // Fetch all groups and populate items
    const userId = req.userAuthId;
    //find the user and groups associate with him
    const user = await User.findById(userId).populate({
        path: 'groups',
        populate: {
            path: 'items',
            select: 'cost'
        }
    });
    const groups = user.groups;

    // Calculate total spent across all groups
    const totalSpent = groups.reduce((sum, group) => {
        const groupTotal = group.items.reduce((total, item) => total + (item.cost || 0), 0);
        return sum + groupTotal;
    }, 0);





    res.json({
        success: true,
        totalSpent,

    });
});


export const calculateMonthlySpendingForAllGroupsCtrl = asyncHandler(async (req, res) => {
    const { month, year } = req.query;
    const userId = req.userAuthId;

    //find the user and groups associate with him
    const user = await User.findById(userId).populate({
        path: 'groups',
        populate: {
            path: 'items',

        }
    });
    const groups = user.groups;


    const currentDate = new Date();
    const targetMonth = !month ? currentDate.getMonth() : parseInt(month, 10) - 1;
    const targetYear = !year ? currentDate.getFullYear() : parseInt(year, 10);



    // Calculate monthly spending
    const monthlySpending = groups.reduce((sum, group) => {
        const groupMonthlySpent = group.items.reduce((total, item) => {
            const itemDate = new Date(item.createdAt);
            if (itemDate.getMonth() === targetMonth && itemDate.getFullYear() === targetYear) {
                return total + (item.cost || 0);
            }
            return total;
        }, 0);
        return sum + groupMonthlySpent;
    }, 0);

    res.json({
        success: true,
        monthlySpending,
    });
});

export const calculatePendingBillsForAllGroupsCtrl = asyncHandler(async (req, res) => {

    // Fetch all groups and populate items
    const userId = req.userAuthId;

    //find the user and groups associate with him
    const user = await User.findById(userId).populate({
        path: 'groups',
        populate: {
            path: 'items',

        }
    });
    const groups = user.groups;


    // Calculate pending bills
    const pendingBills = groups.reduce((sum, group) => {
        const groupPendingBills = group.items.reduce((total, item) => {

            if (!item.paid) {
                return total + (item.cost || 0);
            }
            return total;
        }, 0);
        return sum + groupPendingBills;
    }, 0);


    res.json({
        success: true,
        pendingBills,
    });
});


export const getRecentTransactionsCtrl = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
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

    const allTransactions = groups.flatMap(group => group.items.map(item => ({
        ...item.toObject(), groupName: group.name

    })))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);

    res.json({
        success: true,
        recentTransactions: allTransactions,
    });
})

export const getRecentForSingleGrpTransactionsCtrl = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const group = await Group.findById(id).populate({
        path: 'items',
        populate: {
            path: 'purchasedBy',
            select: 'fullname'
        }


    })

    let items = group?.items?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
    const total = items.length;

    items = items.slice(startIdx, lastIdx);
    const recentTransactions = items;
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
        recentTransactions,
        total,
        pagination,
        message: "products fetched successfully",
    });


})

export const updateGroupName = asyncHandler(async (req, res) => {
    const { name, groupId } = req.body;
    const userId = req.userAuthId;
    console.log(name, groupId);

    try {
        // Check if user is admin of the group
        const group = await Group.findOne({
            _id: groupId,
            Admin: userId,
        });
        console.log(group);

        if (!group) {
            throw new Error("Only group admins can update group name");

        }

        // Update group name
        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { name },
            { new: true }
        ).populate('members.user', 'fullname email');

        res.json({
            success: true,
            message: 'Group name updated successfully',
            group: updatedGroup
        });
    } catch (error) {
        console.log(error);
        throw new Error(error?.message);

    }
});