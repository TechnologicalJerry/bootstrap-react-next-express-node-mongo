import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
    try {

        const reqBody = await request.json()
        const { email, password } = reqBody;
        console.log(reqBody);



    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}