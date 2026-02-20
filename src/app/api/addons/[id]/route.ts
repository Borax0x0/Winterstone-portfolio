import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import AddOn from '@/models/AddOn';

interface SessionUser {
    email?: string | null;
    role?: string;
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();
        const { id } = await params;

        const addOn = await AddOn.findByIdAndUpdate(
            id,
            {
                name: body.name,
                description: body.description,
                price: body.price,
                isActive: body.isActive,
                displayOrder: body.displayOrder,
            },
            { new: true, runValidators: true }
        );

        if (!addOn) {
            return NextResponse.json({ error: 'Add-on not found' }, { status: 404 });
        }

        return NextResponse.json(addOn);
    } catch (error) {
        console.error('Failed to update add-on:', error);
        return NextResponse.json({ error: 'Failed to update add-on' }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        const addOn = await AddOn.findByIdAndDelete(id);

        if (!addOn) {
            return NextResponse.json({ error: 'Add-on not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Add-on deleted successfully' });
    } catch (error) {
        console.error('Failed to delete add-on:', error);
        return NextResponse.json({ error: 'Failed to delete add-on' }, { status: 400 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const addOn = await AddOn.findById(id);

        if (!addOn) {
            return NextResponse.json({ error: 'Add-on not found' }, { status: 404 });
        }

        return NextResponse.json(addOn);
    } catch (error) {
        console.error('Failed to fetch add-on:', error);
        return NextResponse.json({ error: 'Failed to fetch add-on' }, { status: 500 });
    }
}
