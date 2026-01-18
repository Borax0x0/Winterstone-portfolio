"use client";

import React, { useState } from "react";
import { useEmployees, Employee } from "@/context/EmployeeContext";
import EmployeeModal from "@/components/EmployeeModal";
import { Plus, Search, Edit2, Trash2, Phone, Mail, UserCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function TeamPage() {
    const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();

    // UI State
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);

    // Filtering
    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers
    const openModal = (mode: "add" | "edit", employee?: Employee) => {
        setModalMode(mode);
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleSave = (data: Omit<Employee, "id">) => {
        if (modalMode === "add") {
            addEmployee(data);
            toast.success("Employee added successfully");
        } else if (modalMode === "edit" && selectedEmployee) {
            updateEmployee(selectedEmployee.id, data);
            toast.success("Employee updated details");
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to remove ${name}?`)) {
            deleteEmployee(id);
            toast.success("Employee record deleted");
        }
    };

    return (
        <div className="space-y-8">
            <EmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                title={modalMode === "add" ? "Add New Staff" : "Edit Staff Details"}
                initialData={selectedEmployee}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">Team Management</h1>
                    <p className="text-stone-400 text-sm">Track and manage your hotel staff.</p>
                </div>
                <button
                    onClick={() => openModal("add")}
                    className="bg-saffron text-stone-900 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
                >
                    <Plus size={16} /> Add Employee
                </button>
            </div>

            {/* Controls */}
            <div className="bg-stone-900 p-4 rounded-lg border border-stone-800 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-stone-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-saffron text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-stone-900 rounded-lg border border-stone-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-stone-400">
                        <thead className="bg-stone-950 text-stone-500 text-xs uppercase tracking-wider font-medium">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-stone-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-500">
                                                    <UserCircle size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{emp.name}</div>
                                                    <div className="text-xs">Joined: {emp.joinedDate}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">{emp.role}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide ${emp.status === "Active" ? "bg-green-500/10 text-green-500" :
                                                    emp.status === "On Leave" ? "bg-yellow-500/10 text-yellow-500" :
                                                        "bg-red-500/10 text-red-500"
                                                }`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <Phone size={12} /> {emp.phone}
                                                </div>
                                                {emp.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={12} /> {emp.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openModal("edit", emp)}
                                                    className="p-2 bg-stone-800 hover:bg-white hover:text-stone-900 rounded-md transition-colors"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp.id, emp.name)}
                                                    className="p-2 bg-stone-800 hover:bg-red-500 hover:text-white rounded-md transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-stone-500">
                                        No employees found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
