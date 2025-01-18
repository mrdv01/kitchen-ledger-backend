
import User from "../model/User.js";
import bcrypt from "bcryptjs"
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";

//@desc Register
//@route POST /api/v1/users/register
//@access Private/admin

export const registerUserCtrl = asyncHandler(async (req, res) => {
    const { email, password, fullname, username } = req.body;
    //find if user already exist
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('user already exists')

    }

    //hash
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create the user
    const user = await User.create({
        email,
        fullname,
        password: hashedPassword,
        username,
    });

    res.status(201).json({
        status: 'success',
        message: "user registered successfully",
        data: user
    })


})


//@desc login
//@route POST /api/v1/users/login
//@access Private/admin

export const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    //find if user  exist
    const userFound = await User.findOne({ email });
    if (userFound && (await bcrypt.compare(password, userFound?.password))) {
        res.json({
            status: "success",
            message: "User logged in successfully",
            userFound: {
                fullname: userFound?.fullname,
                isAdmin: userFound?.isAdmin,
                id: userFound?._id
            },
            token: generateToken(userFound?._id)
        })
    }
    else {
        throw new Error("Invalid login credentials");
    }



})

//desc@ get user profile
//route GET /api/v1/users/profiles
//access private

// export const getUserProfile = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const user = await User.findById(id);

//     res.json({
//         success: true,
//         message: "user fetched successfully",
//         data: user
//     })
// })

export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userAuthId).populate({
        path: "groups",
        select: "name Admin",

    });
    res.json({
        success: true,
        message: "User fetched successfully",
        user,
    })


})

//Update user profile

export const updateUserProfile = asyncHandler(async (req, res) => {
    const { fullname, email, username } = req.body;
    const userId = req.userAuthId;

    try {
        // Check if email or username already exists
        if (email) {
            const emailExists = await User.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                throw new Error('Email already in use');

            }
        }

        if (username) {
            const usernameExists = await User.findOne({ username, _id: { $ne: userId } });
            if (usernameExists) {
                throw new Error("Username already taken");

            }
        }

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    fullname: fullname,
                    email: email,
                    username: username
                }
            },
            { new: true, runValidators: true }
        ).select('-password').populate({
            path: "groups",
            select: "name Admin",

        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
})

// Update password
export const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userAuthId;

    try {
        const user = await User.findById(userId);

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new Error("Current password is incorrect");

        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.log(error);
        throw new Error(error?.message);

    }
});





