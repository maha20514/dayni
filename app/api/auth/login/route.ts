import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";


export async function POST(req: Request) { 
    try {
        const body = await req.json();
        const { email, password } = body;

        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" }, 
                { status: 401 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json(
                { error: "Invalid credentials" }, 
                { status: 401 }
            );
        }

        return NextResponse.json(
            { message: "Login success", 
            userId: user._id,
            shopName: user.shopName,
    });
    }catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Server error" }, 
            { status: 500 }
        );
    }

}