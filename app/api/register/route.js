import UserRegister from "@/modules/userregister";
import connectDB from "@/utils/mongodbConnection";
import bcrypt from "bcryptjs";

import { NextResponse } from "next/server";

export async function POST(request) {
    connectDB();

    const { name, email, password } = await request.json();

    try {
        const user = await UserRegister.findOne({ email });
        if (user) {
            return NextResponse.status(400).json({ msg: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new user document
        const newUser = new UserRegister({
            name,
            email,
            password: hashedPassword,
        });

        // Save the new user to the database
        const savedUser = await newUser.save();
        return NextResponse.json(
            { msg: "User registert successfuly" },
            { status: 200 },
            newUser
        );
    }
    catch (error) {
        console.error(error);
        NextResponse.status(500).send("Server error");
    }
}

// export async function GET(request) {
//     connectDB();
//     try {
//         const { searchParams } = new URL(request.url);
//         const userId = searchParams.get('query');
//         console.log(userId, "userId");
//         const user = await UserRegister.findById(userId);
//         if (!user) {
//             return NextResponse.status(404).json({ msg: "User not found" });
//         }
//         console.log(user);
//         return NextResponse.json(user);
//     }
//     catch (error) {
//         console.error(error);
//         NextResponse.status(500).send("Server error");
//     }
// }


// export async function PATCH(request) {
//     connectDB();
//     const { userId, name, email, oldPassword, newPassword, confirmPassword } = await request.json();
//     console.log(userId, name, email, oldPassword, newPassword, confirmPassword, "userId, name, email, password");

//     try {
//         // Find the user by ID
//         const user = await UserRegister.findById(userId);

//         // Check if the user exists
//         if (!user) {
//             return NextResponse.json({ msg: "User not found" }, { status: 404 });
//         }

//         // If old password is provided, verify it before updating
//         if (oldPassword) {
//             const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
//             if (!isPasswordMatch) {
//                 return NextResponse.json({ msg: "Incorrect old password" }, { status: 400 });
//             }
//         }

//         // If new password is provided, update it
//         if (newPassword) {
//             if (newPassword !== confirmPassword) {
//                 return NextResponse.json({ msg: "New password and confirm password do not match" }, { status: 400 });
//             }
//             const salt = await bcrypt.genSalt(10);
//             user.password = await bcrypt.hash(newPassword, salt);
//         }

//         // Update user information
//         user.name = name;
//         user.email = email;
//         await user.save();

//         return NextResponse.json({ msg: "User updated successfully", user }, { status: 200 });
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json({ msg: "Server error" }, { status: 500 });
//     }
// }
