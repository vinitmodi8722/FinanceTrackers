import React, { useState } from 'react';
import { Calculator, Calendar, PieChart as PieChartIcon, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../context/DataContext';

export default function DebtPlanner() {
    const { debts, addDebt, updateDebt, addTransaction, loading } = useData();
    const [showModal, setShowModal] = useState(false);
    const [payDebtModal, setPayDebtModal] = useState(null);
    const [payAmount, setPayAmount] = useState('');

    // Form state
    const [creditor, setCreditor] = useState('');
    const [balance, setBalance] = useState('');
    const [apr, setApr] = useState('');
    const [minPayment, setMinPayment] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDebt({
                creditor,
                balance: Number(balance),
                apr: Number(apr),
                minPayment: Number(minPayment)
            });
            setShowModal(false);
            setCreditor('');
            setBalance('');
            setApr('');
            setMinPayment('');
        } catch (err) {
            console.error(err);
            alert('Error adding debt: ' + (err.response?.data?.message || err.response?.data || err.message));
        }
    };

    const handlePayDebt = async (e) => {
        e.preventDefault();
        if (!payDebtModal) return;
        try {
            const amountToPay = Number(payAmount);
            const newBalance = Math.max(0, payDebtModal.balance - amountToPay);

            // 1. Update Balance
            await updateDebt(payDebtModal._id, { balance: newBalance });

            // 2. Create Transaction to reflect in Dashboard Balance
            await addTransaction({
                text: `Debt Payment: ${payDebtModal.creditor}`,
                amount: amountToPay,
                type: 'expense',
                category: 'Other',
                date: new Date().toISOString().split('T')[0]
            });

            setPayDebtModal(null);
            setPayAmount('');
        } catch (err) {
            console.error(err);
            alert('Error paying debt: ' + (err.response?.data?.message || err.response?.data || err.message));
        }
    };

    if (loading) return <div>Loading records...</div>;

    const totalDebt = debts.reduce((acc, d) => acc + d.balance, 0);

    // Mock chart data for remaining debt projections
    const chartData = [
        { name: 'Year 1', remaining: totalDebt },
        { name: 'Year 2', remaining: totalDebt * 0.7 },
        { name: 'Year 3', remaining: totalDebt * 0.4 },
        { name: 'Year 4', remaining: 0 },
    ];

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Debt Clearance Plan</h1>
                    <p className="text-sm sm:text-base text-slate-500 mt-1">Track and accelerate your journey to becoming debt-free</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all font-medium"
                >
                    <Calculator size={20} />
                    <span>Add Debt</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 min-h-[350px] sm:min-h-[400px]">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <PieChartIcon className="text-indigo-500" />
                        Projected Debt Payoff
                    </h3>
                    <div className="h-64 sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="remaining" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 sm:p-8 shadow-lg text-white space-y-6 sm:space-y-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 -m-8 opacity-10">
                        <Calculator size={180} />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-indigo-100 font-medium text-base sm:text-lg mb-2">Total Outstanding Debt</h3>
                        <div className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 truncate">₹{totalDebt.toLocaleString()}</div>
                    </div>

                    <div className="space-y-4 relative z-10 bg-white/10 p-5 sm:p-6 rounded-xl backdrop-blur-sm border border-white/20">
                        <h4 className="font-bold text-white mb-4 border-b border-white/20 pb-2 text-sm sm:text-base">Overview</h4>
                        <div className="flex justify-between items-center group">
                            <span className="text-indigo-100 text-sm sm:text-base flex items-center gap-2">
                                <Calendar size={16} /> Active Debts
                            </span>
                            <span className="font-bold font-mono text-sm sm:text-base">{debts.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6 px-2">Active Debts</h3>
                {debts.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">No debts found. Add one to track payments.</div>
                ) : (
                    <>
                        {/* Mobile View: Card Layout */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {debts.map(debt => (
                                <div key={debt._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                                                {debt.creditor.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{debt.creditor}</p>
                                                <p className="text-xs text-rose-600 font-medium">APR: {debt.apr}%</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setPayDebtModal(debt)}
                                            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold text-sm shadow-sm"
                                        >
                                            Pay
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Balance</p>
                                            <p className="font-bold text-slate-900">₹{debt.balance.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Min Payment</p>
                                            <p className="font-bold text-slate-900">₹{debt.minPayment.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View: Table Layout */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-500 text-sm">
                                        <th className="pb-3 px-4 font-semibold">Creditor</th>
                                        <th className="pb-3 px-4 font-semibold">Balance</th>
                                        <th className="pb-3 px-4 font-semibold">APR %</th>
                                        <th className="pb-3 px-4 font-semibold">Min. Payment</th>
                                        <th className="pb-3 px-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {debts.map(debt => (
                                        <tr key={debt._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                                            <td className="py-4 px-4 font-bold text-slate-800 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                                                    {debt.creditor.charAt(0).toUpperCase()}
                                                </div>
                                                {debt.creditor}
                                            </td>
                                            <td className="py-4 px-4 font-mono font-medium">₹{debt.balance.toLocaleString()}</td>
                                            <td className="py-4 px-4 font-medium text-rose-600">{debt.apr}%</td>
                                            <td className="py-4 px-4 font-mono">₹{debt.minPayment.toLocaleString()}</td>
                                            <td className="py-4 px-4 text-right">
                                                <button
                                                    onClick={() => setPayDebtModal(debt)}
                                                    className="inline-flex items-center gap-1 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-1.5 px-3 rounded-lg transition-colors"
                                                >
                                                    Pay
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Add Debt Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Add New Debt</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Creditor</label>
                                <input required type="text" value={creditor} onChange={(e) => setCreditor(e.target.value)} className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border bg-slate-50" placeholder="e.g. Chase" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Total Balance (₹)</label>
                                <input required type="number" value={balance} onChange={(e) => setBalance(e.target.value)} className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border bg-slate-50" placeholder="5000" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">APR (%)</label>
                                    <input required type="number" step="0.01" value={apr} onChange={(e) => setApr(e.target.value)} className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border bg-slate-50" placeholder="19.99" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Min Payment (₹)</label>
                                    <input required type="number" value={minPayment} onChange={(e) => setMinPayment(e.target.value)} className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border bg-slate-50" placeholder="150" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-4 transition-colors">
                                Save Debt
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Pay Debt Modal */}
            {payDebtModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
                        <button onClick={() => { setPayDebtModal(null); setPayAmount(''); }} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Pay off Debt</h3>
                        <p className="text-sm text-slate-500 mb-6">Make a payment towards <strong>{payDebtModal.creditor}</strong></p>

                        <form onSubmit={handlePayDebt} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Payment Amount (₹)</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max={payDebtModal.balance}
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border bg-slate-50"
                                    placeholder="1000"
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl mt-4 transition-colors">
                                Confirm Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
