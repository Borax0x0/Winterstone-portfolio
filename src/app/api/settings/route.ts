import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

interface SessionUser {
    email?: string | null;
    role?: string;
}

// GET settings
export async function GET() {
    try {
        await dbConnect();

        // Find the first settings document, or create default
        let settings = await Settings.findOne();
        
        if (!settings) {
            settings = await Settings.create({});
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT update settings (Admin only)
export async function PUT(request: Request) {
    try {
        const session = await auth();
        
        // Check if user is admin
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // Update the single settings document
        // upsert: true ensures it creates if missing
        const settings = await Settings.findOneAndUpdate({}, body, { 
            new: true, 
            upsert: true,
            setDefaultsOnInsert: true 
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Failed to update settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
