import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
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

    
    if (user) {
      
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); 

      
      await prisma.verificationToken.create({
        data: {
          identifier: `reset-${email}`,
          token,
          expires,
        },
      });

      
      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({
      message:
        "If an account with that email exists, we've sent you a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
