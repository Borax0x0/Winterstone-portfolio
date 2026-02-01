import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';

interface SessionUser {
    email?: string | null;
    role?: string;
}

interface Params {
    params: Promise<{
        id: string;
    }>;
}

// PUT requires admin
export async function PUT(request: Request, props: Params) {
    const params = await props.params;
    try {
        // Auth check - admin only
        const session = await auth();
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        const updatedEmployee = await Employee.findByIdAndUpdate(
            params.id,
            body,
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json(updatedEmployee);
    } catch {
        return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
    }
}

// DELETE requires admin
export async function DELETE(request: Request, props: Params) {
    const params = await props.params;
    try {
        // Auth check - admin only
        const session = await auth();
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const deletedEmployee = await Employee.findByIdAndDelete(params.id);

        if (!deletedEmployee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Employee deleted successfully' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
    }
}
