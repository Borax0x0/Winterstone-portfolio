// This module runs ONLY on the server
// Do NOT import this file in client components
import "server-only";
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}
