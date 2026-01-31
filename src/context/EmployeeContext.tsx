"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type EmployeeRole = "Manager" | "Receptionist" | "Housekeeping" | "Kitchen" | "Security" | "Guide";
export type EmployeeStatus = "Active" | "On Leave" | "Terminated";

export interface Employee {
    _id: string; // MongoDB
    id?: string; // Fallback
    name: string;
    role: EmployeeRole;
    email: string;
    phone: string;
    status: EmployeeStatus;
    joinedDate: string;
}

interface EmployeeContextType {
    employees: Employee[];
    addEmployee: (employee: Omit<Employee, "_id" | "id">) => Promise<void>;
    updateEmployee: (id: string, updatedEmployee: Partial<Employee>) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;
    isLoading: boolean;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Employees on Mount
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch('/api/employees');
                if (res.ok) {
                    const data = await res.json();
                    setEmployees(data);
                }
            } catch (error) {
                console.error("Failed to fetch employees", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const addEmployee = async (newEmployee: Omit<Employee, "_id" | "id">) => {
        try {
            const res = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEmployee),
            });
            if (res.ok) {
                const savedEmployee = await res.json();
                setEmployees((prev) => [savedEmployee, ...prev]);
            }
        } catch (error) {
            console.error("Failed to add employee", error);
            throw error;
        }
    };

    const updateEmployee = async (id: string, updatedEmployee: Partial<Employee>) => {
        try {
            // Handle both _id and id (fallback)
            const targetId = id;

            const res = await fetch(`/api/employees/${targetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEmployee),
            });

            if (res.ok) {
                const savedEmployee = await res.json();
                setEmployees((prev) => prev.map((emp) =>
                    (emp._id === targetId || emp.id === targetId ? savedEmployee : emp)
                ));
            }
        } catch (error) {
            console.error("Failed to update employee", error);
            throw error;
        }
    };

    const deleteEmployee = async (id: string) => {
        try {
            // Handle both _id and id (fallback)
            const targetId = id;

            const res = await fetch(`/api/employees/${targetId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setEmployees((prev) => prev.filter((emp) => emp._id !== targetId && emp.id !== targetId));
            }
        } catch (error) {
            console.error("Failed to delete employee", error);
            throw error;
        }
    };

    return (
        <EmployeeContext.Provider value={{ employees, addEmployee, updateEmployee, deleteEmployee, isLoading }}>
            {children}
        </EmployeeContext.Provider>
    );
}

export const useEmployees = () => {
    const context = useContext(EmployeeContext);
    if (!context) {
        throw new Error("useEmployees must be used within an EmployeeProvider");
    }
    return context;
};
