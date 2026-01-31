import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/password";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
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
                } catch (error: any) {
                    console.error("Auth error:", error.message);
                    throw error;
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = (user as any).id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
    secret: process.env.AUTH_SECRET,
});

