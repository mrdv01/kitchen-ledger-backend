import mongoose from "mongoose";
const Schema = mongoose.Schema;

const itemSchma = new Schema({
    name: {
        type: String,
        required: true,
    },

    purchasedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    cost: {
        type: Number,
        required: true,
    },
    paid: {
        type: Boolean,
        default: false,
    },
    membersRemainingForPayment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }

}, {
    timestamps: true,
});

// compile the schema to model

const Item = mongoose.model("Item", itemSchma);

export default Item;