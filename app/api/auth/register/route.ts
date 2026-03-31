import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { shopName, email, password } = body; 

        if (!shopName || !email || !password) {
            return NextResponse.json(
                { error: "All fields are required" }, 
                { status: 400 }
            );
        }

        await connectDB();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" }, 
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            shopName,
            email,
            password: hashedPassword
        });

        return NextResponse.json(
            { message: "Registration successful", userId: user._id},
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Server error" }, 
            { status: 500 }
        );
    }   
}