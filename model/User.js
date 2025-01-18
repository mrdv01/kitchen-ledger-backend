import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    fullname: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        minlength: [3, "Username must be at least 3 characters long"],
        trim: true,
        unique: true,

    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }],
    isAdmin: {
        type: Boolean,
        default: false,
    },


}, {
    timestamps: true,
});

// Handle duplicate key errors
UserSchema.post("save", function (error, doc, next) {
    if (error.name === "MongoServerError" && error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        next(new Error(`${field} must be unique. Please use a different ${field}.`));
    } else {
        next(error);
    }
});

// compile the schema to model

const User = mongoose.model("User", UserSchema);

export default User;