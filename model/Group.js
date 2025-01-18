import mongoose from "mongoose";
const Schema = mongoose.Schema;

const GroupSchma = new Schema({
    name: {
        type: String,
        required: true,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }],
    Admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }




}, {
    timestamps: true,
});


// Static method for total spending
GroupSchma.statics.calculateTotalSpent = async function (groupId) {
    const group = await this.findById(groupId).populate("items").exec();
    if (!group) {
        throw new Error("Group not found");
    }
    return group.items.reduce((total, item) => total + (item.cost || 0), 0);
};

//static method for pending bills
GroupSchma.statics.calculatePendingBills = async function (groupId) {
    const group = await this.findById(groupId).populate("items").exec();
    if (!group) {
        throw new Error("Group not found");
    }

    const pendingItems = group.items.filter((item) => !item.paid)
    return pendingItems.reduce((total, item) => total + (item.cost || 0), 0);
}

//static method for monthly spending
GroupSchma.statics.calculateMonthlySpending = async function (groupId, month = null, year = null) {

    const group = await this.findById(groupId).populate("items").exec();
    if (!group) {
        throw new Error("Group not found");
    }


    const currentDate = new Date();
    const targetMonth = month !== null ? parseInt(month, 10) - 1 : currentDate.getMonth();
    const targetYear = year !== null ? parseInt(year, 10) : currentDate.getFullYear();

    const monthlyItems = group.items.filter((item) => {
        const itemDate = new Date(item.createdAt);

        return (
            itemDate.getMonth() === targetMonth &&
            itemDate.getFullYear() === targetYear
        );
    });




    return monthlyItems.reduce((total, item) => total + (item.cost || 0), 0);
};

// compile the schema to model

const Group = mongoose.model("Group", GroupSchma);

export default Group;