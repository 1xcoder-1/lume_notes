import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { forgotPasswordSchema } from "@/lib/validations";
import { authLimiter, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!(await authLimiter.check(1, ip))) {
    return rateLimitResponse();
  }

  try {
    const body = await request.json();

    
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage =
        validationResult.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email } = validationResult.data;

    
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      
      return NextResponse.json({
        message:
          "If an account with this email exists, a verification email has been sent.",
      });
    }

    
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    
    const emailResult = await sendVerificationEmail(email, token);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
