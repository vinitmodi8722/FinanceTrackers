import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, HeartPulse, Calculator, LogOut, Menu, X, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/goals', label: 'Financial Goals', icon: Target },
    { path: '/investments', label: 'Investments', icon: TrendingUp },
    { path: '/health', label: 'Health Score', icon: HeartPulse },
    { path: '/debt', label: 'Debt Planner', icon: Calculator },
];

export default function Sidebar() {
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-indigo-600 transition-colors"
                aria-label="Toggle Sidebar"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={clsx(
                "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm transition-transform duration-300 ease-in-out",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
            <div className="p-6 flex items-center gap-1">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center ">
                    <img src='/v.jpg' alt='vlogo' className='h-12 w-12' />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600">
                    VM-Track
                </span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <Icon size={20} />
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 w-full rounded-xl transition-all font-medium"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
            </div>
        </>
    );
}
