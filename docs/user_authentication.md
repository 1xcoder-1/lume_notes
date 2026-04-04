# User Authentication Feature

Security is important. The authentication feature ensures that your notes are yours alone and that only authorized users can access the app.

## How it works
This feature handles the sign-up and sign-in processes for everyone in your organization.

## Key Features
1. **Easy Sign In**: Log in with your email and password or use magic links.
2. **Email Verification**: Keeps the platform safe and ensures users are real.
3. **Session Management**: Automatically keeps you logged in and logs you out when needed.

## Technical Details
- **Location**: `apps/web/lib/auth.ts` and `app/auth/` routes.
- **Provider**: Uses **NextAuth.js**, a robust security library for Next.js.
- **Database Link**: Connected to the Prisma SQL database for storing users.

## Note for others
To add more login options (like Google or GitHub), you can update the `auth.ts` file and register new OAuth providers in the NextAuth configuration.
