import React, { useState } from 'react';
import { Target, PlusCircle, TrendingUp, X, Shield, History, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Goals() {
    const { goals, addGoal, updateGoal, loading } = useData();
    const [showModal, setShowModal] = useState(false);

    // Add funds modal state
    const [addFundModal, setAddFundModal] = useState(null);
    const [fundAmount, setFundAmount] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [isEmergencyFund, setIsEmergencyFund] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addGoal({
                name: isEmergencyFund ? 'Emergency Fund' : name,
                targetAmount: Number(targetAmount),
                targetDate,
                isEmergencyFund
            });
            setShowModal(false);
            setName('');
            setTargetAmount('');
            setTargetDate('');
            setIsEmergencyFund(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddFund = async (e) => {
        e.preventDefault();
        if (!addFundModal) return;
        try {
            const newTotal = addFundModal.currentAmount + Number(fundAmount);
            await updateGoal(addFundModal._id, newTotal);
            setAddFundModal(null);
            setFundAmount('');
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading records...</div>;

    const emergencyFundGoal = goals.find(g => g.isEmergencyFund);
    const otherGoals = goals.filter(g => !g.isEmergencyFund);

    // Aggregate all savings history
    const allHistory = goals.flatMap(goal =>
        (goal.history || []).map(h => ({
            ...h,
            goalName: goal.name,
            goalColor: goal.color,
            isEmergency: goal.isEmergencyFund
        }))
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Financial Goals</h1>
                    <p className="text-sm sm:text-base text-slate-500 mt-1">Plan and track your savings for future needs</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    {!emergencyFundGoal && (
                        <button
                            onClick={() => {
                                setIsEmergencyFund(true);
                                setTargetDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
                                setShowModal(true);
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all font-medium"
                        >
                            <Shield size={20} />
                            <span>Setup Emergency Fund</span>
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setIsEmergencyFund(false);
                            setShowModal(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all font-medium"
                    >
                        <PlusCircle size={20} />
                        <span>New Goal</span>
                    </button>
                </div>
            </div>

            {/* Emergency Fund Card */}
            {emergencyFundGoal && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-100 shadow-xl shadow-emerald-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 hidden sm:block">
                        <Shield size={200} className="text-emerald-500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 sm:p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
                                    <Shield size={28} />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Emergency Fund</h2>
                            </div>

                            <div className="flex flex-col xs:flex-row xs:items-baseline gap-2 sm:gap-4">
                                <span className="text-4xl sm:text-5xl font-black text-slate-900 truncate">₹{emergencyFundGoal.currentAmount.toLocaleString()}</span>
                                <span className="text-base sm:text-lg text-slate-500 font-bold underline decoration-emerald-300">Target: ₹{emergencyFundGoal.targetAmount.toLocaleString()}</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between font-bold text-emerald-600 uppercase tracking-wider text-xs">
                                    <span>Fund Readiness</span>
                                    <span>{Math.min((emergencyFundGoal.currentAmount / emergencyFundGoal.targetAmount) * 100, 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min((emergencyFundGoal.currentAmount / emergencyFundGoal.targetAmount) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <button
                                onClick={() => setAddFundModal(emergencyFundGoal)}
                                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                            >
                                <PlusCircle size={20} /> Add Savings to Fund
                            </button>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <History size={16} /> Recent Deposits
                            </h3>
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {!emergencyFundGoal.history || emergencyFundGoal.history.length === 0 ? (
                                    <p className="text-slate-400 text-center py-8 italic">No deposits recorded yet</p>
                                ) : (
                                    emergencyFundGoal.history.slice().reverse().map((h, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold">
                                                    ₹
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">+₹{h.amount.toLocaleString()}</p>
                                                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                        <Clock size={10} /> {new Date(h.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded">Success</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherGoals.map((goal) => {
                    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                    return (
                        <div key={goal._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                                <Target size={100} className="text-slate-900" />
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className={`p-3 rounded-xl bg-indigo-100 text-indigo-500`}>
                                        <Target size={24} />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{new Date(goal.targetDate).toLocaleDateString()}</span>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{goal.name}</h3>
                                    <div className="mt-2 flex items-end gap-2">
                                        <span className="text-2xl font-bold text-slate-800">₹{goal.currentAmount.toLocaleString()}</span>
                                        <span className="text-sm text-slate-500 font-medium mb-1">/ ₹{goal.targetAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4">
                                    <div className="flex justify-between text-sm font-semibold">
                                        <span className="text-indigo-600">Progress</span>
                                        <span className="text-slate-700">{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-3 rounded-full ${goal.color || 'bg-indigo-500'} transition-all duration-1000 ease-out`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Compact History for other goals */}
                                <div className="pt-4 border-t border-slate-50 space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <History size={12} /> Recent Savings
                                    </h4>
                                    <div className="space-y-2 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                                        {!goal.history || goal.history.length === 0 ? (
                                            <p className="text-[10px] text-slate-400 italic">No savings history</p>
                                        ) : (
                                            goal.history.slice().reverse().slice(0, 3).map((h, i) => (
                                                <div key={i} className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                                                    <span className="font-bold text-slate-700">+₹{h.amount.toLocaleString()}</span>
                                                    <span className="text-slate-400 font-medium">{new Date(h.date).toLocaleDateString()}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 mt-4">
                                    <button
                                        onClick={() => setAddFundModal(goal)}
                                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        <PlusCircle size={16} /> Add Savings
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {otherGoals.length === 0 && !emergencyFundGoal && (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        No goals found. Create your first goal to get started!
                    </div>
                )}
            </div>

            {goals.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-300 via-transparent to-transparent"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-4 max-w-xl">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <TrendingUp className="text-indigo-300" size={28} />
                                Keep pushing forward!
                            </h2>
                            <p className="text-indigo-200 text-lg leading-relaxed">
                                You are tracking {goals.length} target(s). Regular saving habits will help you reach them!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Goal Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">{isEmergencyFund ? 'Setup Emergency Fund' : 'Create New Goal'}</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isEmergencyFund && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Goal Name</label>
                                    <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border bg-slate-50" placeholder="e.g. Vacation" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">{isEmergencyFund ? 'How much do you want to save for emergencies?' : 'Target Amount (₹)'}</label>
                                <input required type="number" min="1" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border bg-slate-50" placeholder="e.g. 50000" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Target Date</label>
                                <input required type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border bg-slate-50" />
                            </div>
                            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-4 transition-colors">
                                {isEmergencyFund ? 'Start Fund' : 'Save Goal'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Savings Modal */}
            {addFundModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
                        <button onClick={() => { setAddFundModal(null); setFundAmount(''); }} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Add Savings</h3>
                        <p className="text-sm text-slate-500 mb-6">Deposit money into <strong>{addFundModal.name}</strong></p>

                        <form onSubmit={handleAddFund} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Amount to Add (₹)</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={fundAmount}
                                    onChange={(e) => setFundAmount(e.target.value)}
                                    className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border bg-slate-50"
                                    placeholder="1000"
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl mt-4 transition-colors">
                                Confirm Deposit
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Global Recent Savings Transactions */}
            <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                        <History className="text-indigo-600" size={24} />
                        Recent Savings Transactions
                    </h3>
                </div>

                {allHistory.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-medium text-sm">
                        No savings history recorded yet. Add funds to your goals to see them here!
                    </div>
                ) : (
                    <>
                        {/* Mobile View */}
                        <div className="space-y-3 sm:hidden">
                            {allHistory.slice(0, 5).map((h, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg ${h.isEmergency ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'} flex items-center justify-center font-bold`}>
                                            {h.isEmergency ? '🛡️' : '🎯'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{h.goalName}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{new Date(h.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-emerald-600 text-sm">+₹{h.amount.toLocaleString()}</p>
                                        <p className="text-[9px] font-black uppercase text-emerald-500">Deposited</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="pb-4 px-4">Goal</th>
                                        <th className="pb-4 px-4 text-center">Date</th>
                                        <th className="pb-4 px-4 text-right">Amount</th>
                                        <th className="pb-4 px-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allHistory.slice(0, 10).map((h, i) => (
                                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg ${h.isEmergency ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'} flex items-center justify-center font-bold text-xs`}>
                                                        {h.isEmergency ? '🛡️' : '🎯'}
                                                    </div>
                                                    <span className="font-bold text-slate-700">{h.goalName}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-bold text-slate-800">{new Date(h.date).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="text-lg font-black text-emerald-600">+₹{h.amount.toLocaleString()}</span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 uppercase tracking-tighter">
                                                    Deposited
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {allHistory.length > 10 && (
                                <p className="text-center text-xs text-slate-400 mt-6 font-medium italic">Showing latest 10 transactions</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
