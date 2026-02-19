import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import RoomUnit from '@/models/RoomUnit';

interface SessionUser {
    email?: string | null;
    role?: string;
}

// GET all units
export async function GET() {
    try {
        await dbConnect();
        const units = await RoomUnit.find({}).sort({ roomTypeSlug: 1, name: 1 });
        return NextResponse.json(units);
    } catch (error) {
        console.error('Failed to fetch units:', error);
        return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 });
    }
}

// POST create unit
export async function POST(request: Request) {
    try {
        const session = await auth();
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        if (!body.name || !body.roomTypeSlug) {
            return NextResponse.json({ error: 'Name and Room Type are required' }, { status: 400 });
        }

        const unit = await RoomUnit.create(body);
        return NextResponse.json(unit, { status: 201 });
    } catch (error) {
        console.error('Failed to create unit:', error);
        return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 });
    }
}

// PUT update unit
export async function PUT(request: Request) {
    try {
        const session = await auth();
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Unit ID required' }, { status: 400 });
        }

        await dbConnect();
        const body = await request.json();

        const unit = await RoomUnit.findByIdAndUpdate(id, body, { new: true });
        if (!unit) {
            return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
        }

        return NextResponse.json(unit);
    } catch (error) {
        console.error('Failed to update unit:', error);
        return NextResponse.json({ error: 'Failed to update unit' }, { status: 500 });
    }
}

// DELETE unit
export async function DELETE(request: Request) {
    try {
        const session = await auth();
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await dbConnect();
        await RoomUnit.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete unit:', error);
        return NextResponse.json({ error: 'Failed to delete unit' }, { status: 500 });
    }
}
