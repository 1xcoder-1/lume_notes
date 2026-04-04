import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

interface VerifyEmailPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function VerifyEmailContent({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = params.token as string | undefined;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-6 rounded-lg border p-6 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Invalid Verification Link</h1>
            <p className="text-muted-foreground">
              The verification link is invalid.
            </p>
          </div>
        </div>
      </div>
    );
  }

  try {
    
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!verificationToken) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md space-y-6 rounded-lg border p-6 shadow-lg">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Invalid or Expired Link</h1>
              <p className="text-muted-foreground">
                The verification link has expired or is invalid.
              </p>
            </div>
          </div>
        </div>
      );
    }

    
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token,
        },
      },
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-6 rounded-lg border p-6 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Verification Error</h1>
            <p className="text-muted-foreground">
              There was an error while verifying your email. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  
  redirect("/auth/login?verified=true");
}

export default async function VerifyEmailPage(props: VerifyEmailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md space-y-6 rounded-lg border p-6 shadow-lg">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Verifying...</h1>
              <p className="text-muted-foreground">
                Please wait while we verify your email.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent searchParams={props.searchParams} />
    </Suspense>
  );
}
