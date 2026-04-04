import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { resetPasswordSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues;

      const missingToken = !body.token || body.token.trim() === "";
      const missingPassword = !body.password || body.password.trim() === "";

      if (missingToken || missingPassword) {
        return NextResponse.json(
          { error: "Token and password are required" },
          { status: 400 }
        );
      }

      if (issues.length > 0) {
        const firstIssue = issues[0];
        if (firstIssue) {
          if (
            firstIssue.code === "too_small" &&
            firstIssue.path.includes("password")
          ) {
            return NextResponse.json(
              { error: "Password must be at least 8 characters" },
              { status: 400 }
            );
          }
        }
      }

      const errorMessage = issues[0]?.message || "Validation failed";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { token, password } = validationResult.data;

    const resetToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: {
          startsWith: "reset-",
        },
        token,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const email = resetToken.identifier.replace("reset-", "");

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email },
      data: { password_hash: passwordHash },
    });

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: resetToken.identifier,
          token,
        },
      },
    });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
