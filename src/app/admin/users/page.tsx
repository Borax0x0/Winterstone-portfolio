"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Users, Shield, ShieldCheck, User, Trash2, Loader2, AlertCircle } from "lucide-react";

interface SessionUser {
    email?: string | null;
    role?: string;
}

interface UserData {
    _id: string;
    email: string;
    name: string;
    role: 'guest' | 'admin' | 'superadmin';
    emailVerified: boolean;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users);
            } else {
                setError(data.error || 'Failed to fetch users');
            }
        } catch {
            setError('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        setActionLoading(userId);
        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(users.map(u =>
                    u._id === userId ? { ...u, role: newRole as UserData['role'] } : u
                ));
            } else {
                alert(data.error || 'Failed to update role');
            }
        } catch {
            alert('Failed to update role');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;

        setActionLoading(userId);
        try {
            const res = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                setUsers(users.filter(u => u._id !== userId));
            } else {
                alert(data.error || 'Failed to delete user');
            }
        } catch {
            alert('Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'superadmin': return <ShieldCheck className="w-4 h-4 text-purple-500" />;
            case 'admin': return <Shield className="w-4 h-4 text-blue-500" />;
            default: return <User className="w-4 h-4 text-stone-400" />;
        }
    };

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            superadmin: 'bg-purple-100 text-purple-700',
            admin: 'bg-blue-100 text-blue-700',
            guest: 'bg-stone-100 text-stone-600',
        };
        return styles[role] || styles.guest;
    };

    // Check if current user is superadmin
    const userRole = (session?.user as SessionUser | undefined)?.role;
    if (userRole !== 'superadmin') {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-stone-500">
                <AlertCircle className="w-12 h-12 mb-4" />
                <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                <p>Only superadmins can manage users.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-saffron" />
                    <h1 className="text-2xl font-serif font-bold text-stone-100">User Management</h1>
                </div>
                <span className="text-stone-400 text-sm">{users.length} users</span>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                </div>
            ) : (
                <div className="bg-stone-900/50 border border-stone-800 rounded overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-stone-800 text-left">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-400">User</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-400">Role</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-400">Verified</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-400">Joined</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center">
                                                {getRoleIcon(user.role)}
                                            </div>
                                            <div>
                                                <p className="text-stone-100 font-medium">{user.name}</p>
                                                <p className="text-stone-500 text-sm">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            disabled={actionLoading === user._id || user.email === session?.user?.email}
                                            className={`px-3 py-1.5 rounded text-sm font-medium ${getRoleBadge(user.role)} border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <option value="guest">Guest</option>
                                            <option value="admin">Admin</option>
                                            <option value="superadmin">Superadmin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm ${user.emailVerified ? 'text-green-400' : 'text-stone-500'}`}>
                                            {user.emailVerified ? '✓ Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-stone-400 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.email !== session?.user?.email && (
                                            <button
                                                onClick={() => handleDelete(user._id, user.name)}
                                                disabled={actionLoading === user._id}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded transition disabled:opacity-50"
                                                title="Delete User"
                                            >
                                                {actionLoading === user._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex items-center gap-6 text-sm text-stone-500">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                    <span>Superadmin - Full access</span>
                </div>
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Admin - Manage bookings/reviews</span>
                </div>
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-stone-400" />
                    <span>Guest - Book rooms only</span>
                </div>
            </div>
        </div>
    );
}
