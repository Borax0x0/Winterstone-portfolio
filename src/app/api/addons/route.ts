import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import AddOn from '@/models/AddOn';

interface SessionUser {
    email?: string | null;
    role?: string;
}

export async function GET() {
    try {
        await dbConnect();
        
        const addOns = await AddOn.find({ isActive: true })
            .sort({ displayOrder: 1, createdAt: 1 });
        
        return NextResponse.json(addOns);
    } catch (error) {
        console.error('Failed to fetch add-ons:', error);
        return NextResponse.json({ error: 'Failed to fetch add-ons' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        const addOn = await AddOn.create({
            name: body.name,
            description: body.description || '',
            price: body.price,
            isActive: body.isActive ?? true,
            displayOrder: body.displayOrder || 0,
        });

        return NextResponse.json(addOn, { status: 201 });
    } catch (error) {
        console.error('Failed to create add-on:', error);
        return NextResponse.json({ error: 'Failed to create add-on' }, { status: 400 });
    }
}
