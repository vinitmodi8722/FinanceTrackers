import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, IndianRupee, Target, PlusCircle, X, CreditCard, Shield } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
    const { transactions, addTransaction, goals, updateGoal, debts, updateDebt, loading } = useData();
    const [showModal, setShowModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);

    // Form state
    const [text, setText] = useState('');
    const [amount, setAmount] = useState('');

    // Save state
    const [saveAmount, setSaveAmount] = useState('');
    const [selectedGoal, setSelectedGoal] = useState('');

    // Debt Pay state
    const [payAmount, setPayAmount] = useState('');
    const [selectedDebt, setSelectedDebt] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    if (loading) return <div>Loading dashboard...</div>;

    // Calculate derived data
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const totalSavings = goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const emergencyGoal = goals.find(g => g.isEmergencyFund);
    const totalDebt = debts.reduce((acc, d) => acc + d.balance, 0);
    const totalBalance = income - expenses - totalSavings;

    // Pie chart data
    const expensesByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});

    const pieData = Object.keys(expensesByCategory).map(key => ({
        name: key,
        value: expensesByCategory[key]
    })).sort((a, b) => b.value - a.value).slice(0, 5); // top 5

    const chartData = [
        { name: 'Last Month', income: income * 0.8, expenses: expenses * 0.7 },
        { name: 'This Month', income: income, expenses: expenses },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addTransaction({ text, amount: Number(amount), type, category, date });
            setShowModal(false);
            setText('');
            setAmount('');
            setCategory('');
            setDate(new Date().toISOString().split('T')[0]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveSubmit = async (e) => {
        e.preventDefault();
        try {
            const goal = goals.find(g => g._id === selectedGoal);
            if (!goal) return;
            const newTotal = goal.currentAmount + Number(saveAmount);
            await updateGoal(selectedGoal, newTotal);
            setShowSaveModal(false);
            setSaveAmount('');
            setSelectedGoal('');
        } catch (err) {
            console.error(err);
        }
    };

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        try {
            const debt = debts.find(d => d._id === selectedDebt);
            if (!debt) return;

            const amountToPay = Number(payAmount);
            const newBalance = Math.max(0, debt.balance - amountToPay);

            await updateDebt(selectedDebt, { balance: newBalance });


            await addTransaction({
                text: `Debt Payment: ${debt.creditor}`,
                amount: amountToPay,
                type: 'expense',
                category: 'Other',
                date: new Date().toISOString().split('T')[0]
            });

            setShowPayModal(false);
            setPayAmount('');
            setSelectedDebt('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Financial Overview</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all font-medium flex items-center justify-center gap-2"
                >
                    <PlusCircle size={18} />
                    Add Transaction
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">Total Balance</p>
                        <div className="p-2 bg-indigo-50 rounded-lg"><Wallet className="text-indigo-600" size={20} /></div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-all">₹{totalBalance.toLocaleString()}</h2>
                        <span className="inline-flex items-center mt-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <ArrowUpRight size={12} className="mr-1" /> Active
                        </span>
                    </div>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">Total Income</p>
                        <div className="p-2 bg-emerald-50 rounded-lg"><IndianRupee className="text-emerald-600" size={20} /></div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-all">₹{income.toLocaleString()}</h2>
                        <span className="inline-flex items-center mt-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <ArrowUpRight size={12} className="mr-1" /> Positive
                        </span>
                    </div>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">Total Expenses</p>
                        <div className="p-2 bg-rose-50 rounded-lg"><IndianRupee className="text-rose-600" size={20} /></div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-all">₹{expenses.toLocaleString()}</h2>
                        <span className="inline-flex items-center mt-1 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            <ArrowDownRight size={12} className="mr-1" /> Tracked
                        </span>
                    </div>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">Total Savings</p>
                        <div className="p-2 bg-blue-50 rounded-lg"><Target className="text-blue-600" size={20} /></div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-all">₹{totalSavings.toLocaleString()}</h2>
                        <button
                            onClick={() => {
                                if (emergencyGoal) setSelectedGoal(emergencyGoal._id);
                                setShowSaveModal(true);
                            }}
                            className="inline-flex items-center gap-1 mt-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-1.5 px-3 rounded-lg transition-colors"
                        >
                            <PlusCircle size={14} /> Save
                        </button>
                    </div>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-rose-100 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                            Debt Plan <Link to="/debt" className="text-indigo-600 hover:underline text-xs">(View)</Link>
                        </p>
                        <div className="p-2 bg-rose-50 rounded-lg"><CreditCard className="text-rose-600" size={20} /></div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-all">₹{totalDebt.toLocaleString()}</h2>
                        <button
                            onClick={() => setShowPayModal(true)}
                            className="inline-flex items-center gap-1 mt-2 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-1.5 px-3 rounded-lg transition-colors"
                        >
                            <PlusCircle size={14} /> Pay
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Income vs Expenses</h3>
                    <div className="h-64 sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 500 }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Expense Breakdown</h3>
                    {pieData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-500">No expenses yet</div>
                    ) : (
                        <>
                            <div className="h-64 relative flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => `₹${value.toLocaleString()}`}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-slate-900">₹{expenses.toLocaleString()}</span>
                                    <span className="text-xs text-slate-500 font-medium">Total</span>
                                </div>
                            </div>
                            <div className="mt-4 space-y-3">
                                {pieData.map((item, index) => (
                                    <div key={item.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-slate-600 font-medium">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">₹{item.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Transactions</h3>
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No transactions recorded yet. Add one to start tracking.</div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {transactions.slice(0, 5).map(t => (
                            <div key={t._id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-800 truncate">{t.text}</p>
                                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                                </div>
                                <span className={`font-bold text-sm sm:text-base shrink-0 ml-2 ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Transaction Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Add Transaction</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setType('expense')} className={`py-2 rounded-xl font-bold border-2 transition-all ${type === 'expense' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-100 text-slate-400'}`}>Expense</button>
                                <button type="button" onClick={() => setType('income')} className={`py-2 rounded-xl font-bold border-2 transition-all ${type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400'}`}>Income</button>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <input required type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border bg-slate-50" placeholder="e.g. Salary, Groceries" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Amount (₹)</label>
                                    <input required type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border bg-slate-50" placeholder="500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                                    <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border bg-slate-50 outline-none">
                                        <option value="" disabled>Select...</option>
                                        <option value="Housing">Housing</option>
                                        <option value="Food">Food / Groceries</option>
                                        <option value="Transport">Transport</option>
                                        <option value="Utilities">Utilities</option>
                                        <option value="Shopping">Shopping</option>
                                        <option value="Salary">Salary</option>
                                        <option value="Investment">Investment</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                                <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border bg-slate-50" />
                            </div>

                            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-4 transition-colors">
                                Add Record
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Save Money Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
                        <button onClick={() => setShowSaveModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Save Money</h3>
                        <p className="text-sm text-slate-500 mb-6">Transfer money into your savings goals</p>

                        <form onSubmit={handleSaveSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Select Goal</label>
                                <select
                                    required
                                    value={selectedGoal}
                                    onChange={(e) => setSelectedGoal(e.target.value)}
                                    className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-blue-500 focus:border-blue-500 border bg-slate-50 outline-none"
                                >
                                    <option value="" disabled>Choose a goal...</option>
                                    {goals.sort((a, b) => (b.isEmergencyFund ? 1 : 0) - (a.isEmergencyFund ? 1 : 0)).map(g => (
                                        <option key={g._id} value={g._id}>
                                            {g.isEmergencyFund ? '🛡️ ' : '🎯 '}{g.name} (Currently ₹{g.currentAmount})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Amount to Save (₹)</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={saveAmount}
                                    onChange={(e) => setSaveAmount(e.target.value)}
                                    className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-blue-500 focus:border-blue-500 border bg-slate-50"
                                    placeholder="1000"
                                />
                            </div>

                            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-4 transition-colors">
                                Transfer to Savings
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Pay Debt Modal */}
            {showPayModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
                        <button onClick={() => setShowPayModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Pay off Debt</h3>
                        <p className="text-sm text-slate-500 mb-6">Reduce your outstanding debt balance</p>

                        <form onSubmit={handlePaySubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Select Debt</label>
                                <select
                                    required
                                    value={selectedDebt}
                                    onChange={(e) => setSelectedDebt(e.target.value)}
                                    className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-rose-500 focus:border-rose-500 border bg-slate-50 outline-none"
                                >
                                    <option value="" disabled>Choose a debt...</option>
                                    {debts.map(d => (
                                        <option key={d._id} value={d._id}>{d.creditor} (Remaining: ₹{d.balance})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Payment Amount (₹)</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    className="w-full border-slate-300 rounded-xl py-2 px-3 focus:ring-rose-500 focus:border-rose-500 border bg-slate-50"
                                    placeholder="1000"
                                />
                            </div>

                            <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl mt-4 transition-colors">
                                Confirm Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
