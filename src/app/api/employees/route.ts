import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import { INITIAL_EMPLOYEES } from '@/lib/mockData';

// GET is public (employees are shown on the website)
export async function GET() {
    try {
        await dbConnect();

        // Auto-Seed Logic
        const count = await Employee.countDocuments();
        if (count === 0) {
            await Employee.insertMany(INITIAL_EMPLOYEES);
        }

        // Fetch all employees sort by createdAt desc
        const employees = await Employee.find({}).sort({ createdAt: -1 });
        return NextResponse.json(employees);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
}

// POST requires admin
export async function POST(request: Request) {
    try {
        // Auth check - admin only
        const session = await auth();
        if (!session?.user || !['admin', 'superadmin'].includes((session.user as any).role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // Create new employee
        const employee = await Employee.create(body);

        return NextResponse.json(employee, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create employee' }, { status: 400 });
    }
}
