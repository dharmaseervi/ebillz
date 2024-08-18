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

