import sql from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {

        const getAllData = await sql`
            SELECT * FROM carousel_images
        `;

        return NextResponse.json({ getAllData });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred while fetching data" }, { status: 500 });
    }
}