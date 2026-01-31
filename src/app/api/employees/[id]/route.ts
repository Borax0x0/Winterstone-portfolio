import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';

interface Params {
    params: Promise<{
        id: string;
    }>;
}

export async function PUT(request: Request, props: Params) {
    const params = await props.params;
    try {
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
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: Params) {
    const params = await props.params;
    try {
        await dbConnect();

        const deletedEmployee = await Employee.findByIdAndDelete(params.id);

        if (!deletedEmployee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
    }
}
