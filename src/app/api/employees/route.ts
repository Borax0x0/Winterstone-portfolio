import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import { INITIAL_EMPLOYEES } from '@/lib/mockData';

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

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Create new employee
        const employee = await Employee.create(body);

        return NextResponse.json(employee, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create employee' }, { status: 400 });
    }
}
