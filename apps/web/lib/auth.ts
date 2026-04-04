import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";

const config: NextAuthConfig = {
  adapter: {
    ...PrismaAdapter(prisma),
    createUser: async data => {
      const { name, ...rest } = data;
      return prisma.user.create({
        data: {
          ...rest,
          first_name: name || null,
          role: "admin", 
        },
      });
    },
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      
      
      
      allowDangerousEmailAccountLinking: true,
      
      authorization: {
        params: { scope: "read:user user:email" },
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { tenant: true },
        });

        if (!user) {
          return null;
        }

        if (!user.password_hash) {
          return null;
        }

        if (!user.emailVerified) {
          throw new Error("EmailNotVerified");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.first_name
            ? `${user.first_name} ${user.last_name || ""}`.trim()
            : user.email,
          role: user.role,
          tenantId: user.tenant_id,
          tenantSlug: user.tenant?.slug,
          tenantPlan: user.tenant?.plan,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      
      
      try {
        if (account?.provider && user?.email) {
          
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true },
          });

          if (existingUser) {
            
            const alreadyLinked = existingUser.accounts.find(
              a =>
                a.provider === account.provider &&
                a.providerAccountId === account.providerAccountId
            );

            if (!alreadyLinked) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type ?? "oauth",
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token ?? null,
                  access_token: account.access_token ?? null,
                  expires_at: account.expires_at ?? null,
                  token_type: account.token_type ?? null,
                  scope: account.scope ?? null,
                  id_token: account.id_token ?? null,
                  session_state:
                    account.session_state == null
                      ? null
                      : String(account.session_state),
                },
              });
            }
          }
        }

        return true;
      } catch (err) {
        console.error("signIn callback error:", err);
        
        return true;
      }
    },
    async session({ session, token }) {
      
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name || null,
          email: token.email || null,
          image: token.picture || null,
          tenantId: (token as any).tenantId || null,
          tenantSlug: (token as any).tenantSlug || null,
          tenantPlan: (token as any).tenantPlan || null,
          role: (token as any).role || null,
        } as any;
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        
        if ((user as any).tenantId !== undefined) {
          (token as any).tenantId = (user as any).tenantId;
          (token as any).tenantSlug = (user as any).tenantSlug;
          (token as any).tenantPlan = (user as any).tenantPlan;
          (token as any).role = (user as any).role;
        } else {
          
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { tenant: true },
          });

          if (dbUser) {
            (token as any).tenantId = dbUser.tenant_id;
            (token as any).tenantSlug = dbUser.tenant?.slug;
            (token as any).tenantPlan = dbUser.tenant?.plan;
            (token as any).role = dbUser.role;
          }
        }
      }

      
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { tenant: true },
        });

        if (dbUser) {
          (token as any).tenantId = dbUser.tenant_id;
          (token as any).tenantSlug = dbUser.tenant?.slug;
          (token as any).tenantPlan = dbUser.tenant?.plan;
          (token as any).role = dbUser.role;
        }
      }

      return token;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config) as {
  handlers: any;
  auth: any;
  signIn: any;
  signOut: any;
};
