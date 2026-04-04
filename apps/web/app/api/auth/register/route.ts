import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { registerSchema } from "@/lib/validations";
import { authLimiter, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!(await authLimiter.check(10, ip))) {
    return rateLimitResponse();
  }

  try {
    const body = await request.json();

    
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName } = validationResult.data;

    
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const verificationToken = randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    
    const user = await prisma.user.create({
      data: {
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        password_hash: hashedPassword,
        role: "admin",
        tenant_id: undefined, 
        emailVerified: null, 
      },
    });

    
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: tokenExpires,
      },
    });

    
    const emailResult = await sendVerificationEmail(email, verificationToken);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "Registration successful! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
