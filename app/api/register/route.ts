// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import sql from "@/lib/db"; // Your existing Postgres connection

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hash(password, 10);

    // Create user using your table structure
    const newUser = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name || null}, ${email}, ${password_hash})
      RETURNING id, name, email
    `;

    // Return user without password
    return NextResponse.json(
      {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}