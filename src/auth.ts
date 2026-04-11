import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { verifyPassword } from "@/lib/password";
import dbConnect from "@/lib/db";
import User from "@/models/User";

// Extend the built-in types
interface ExtendedUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface ExtendedToken {
    role?: string;
    id?: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                try {
                    await dbConnect();

                    const email = credentials?.email as string;
                    const password = credentials?.password as string;

                    if (!email || !password) {
                        throw new Error("Email and password required");
                    }

                    // Find user in database
                    const user = await User.findOne({ email: email.toLowerCase() });

                    if (!user) {
                        throw new Error("Invalid credentials");
                    }

                    // Check password
                    const isValidPassword = await verifyPassword(password, user.password);
                    if (!isValidPassword) {
                        throw new Error("Invalid credentials");
                    }

                    // Email verification is optional - users can login without it

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : "Authentication failed";
                    console.error("Auth error:", errorMessage);
                    throw error;
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                await dbConnect();
                const existingUser = await User.findOne({ email: user.email });
                if (!existingUser) {
                    await User.create({
                        name: user.name,
                        email: user.email,
                        role: "guest",
                        emailVerified: true
                    });
                }
                return true;
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                if (account?.provider === "google") {
                    await dbConnect();
                    const dbUser = await User.findOne({ email: user.email });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.id = dbUser._id.toString();
                    } else {
                        token.role = "guest";
                    }
                } else {
                    // User comes from authorize callback with role and id
                    token.role = (user as unknown as ExtendedUser).role;
                    token.id = (user as unknown as ExtendedUser).id;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                const extToken = token as ExtendedToken;
                // Cast to allow adding custom properties
                const sessionUser = session.user as { role?: string; id?: string };
                sessionUser.role = extToken.role || 'guest';
                sessionUser.id = extToken.id || '';
            }
            return session;
        },
    },
    secret: process.env.AUTH_SECRET,
});

