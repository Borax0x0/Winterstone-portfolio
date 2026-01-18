"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type EmployeeRole = "Manager" | "Receptionist" | "Housekeeping" | "Kitchen" | "Security" | "Guide";
export type EmployeeStatus = "Active" | "On Leave" | "Terminated";

export interface Employee {
    id: string;
    name: string;
    role: EmployeeRole;
    email: string;
    phone: string;
    status: EmployeeStatus;
    joinedDate: string;
}

interface EmployeeContextType {
    employees: Employee[];
    addEmployee: (employee: Omit<Employee, "id">) => void;
    updateEmployee: (id: string, updatedEmployee: Partial<Employee>) => void;
    deleteEmployee: (id: string) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

const INITIAL_EMPLOYEES: Employee[] = [
    {
        id: "1",
        name: "Rajesh Kumar",
        role: "Manager",
        email: "rajesh@winterstone.com",
        phone: "+91 99999 00001",
        status: "Active",
        joinedDate: "2020-03-15"
    },
    {
        id: "2",
        name: "Sunita Sharma",
        role: "Receptionist",
        email: "sunita@winterstone.com",
        phone: "+91 99999 00002",
        status: "Active",
        joinedDate: "2022-08-01"
    },
    {
        id: "3",
        name: "Vikram Singh",
        role: "Housekeeping",
        email: "",
        phone: "+91 99999 00003",
        status: "Active",
        joinedDate: "2023-01-10"
    }
];

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
    const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
    const [isMounted, setIsMounted] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem("winterstone_employees");
        if (stored) {
            setEmployees(JSON.parse(stored));
        }
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("winterstone_employees", JSON.stringify(employees));
        }
    }, [employees, isMounted]);

    const addEmployee = (newEmployee: Omit<Employee, "id">) => {
        const employee = { ...newEmployee, id: crypto.randomUUID() };
        setEmployees((prev) => [...prev, employee]);
    };

    const updateEmployee = (id: string, updatedEmployee: Partial<Employee>) => {
        setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updatedEmployee } : e)));
    };

    const deleteEmployee = (id: string) => {
        setEmployees((prev) => prev.filter((e) => e.id !== id));
    };

    return (
        <EmployeeContext.Provider value={{ employees, addEmployee, updateEmployee, deleteEmployee }}>
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
