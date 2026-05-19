import React, { useState } from 'react';
import { TrendingUp, PlusCircle, X, PiggyBank, Landmark, LineChart, Calendar, Wallet, AlertCircle, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Investments() {
    const { investments, loading: storeLoading, addInvestment, deleteInvestment, updateInvestment } = useData();
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [investmentType, setInvestmentType] = useState('Fixed Deposit');
    
    // Form state
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [institution, setInstitution] = useState('');
    // FD Specific
    const [interestRate, setInterestRate] = useState('');
    const [duration, setDuration] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [maturityDate, setMaturityDate] = useState('');
    // MF Specific
    const [units, setUnits] = useState('');
    const [nav, setNav] = useState('');
    const [category, setCategory] = useState('Equity');
    const [currentValue, setCurrentValue] = useState('');
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [selectedInv, setSelectedInv] = useState(null);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [upUnits, setUpUnits] = useState('');
    const [upNav, setUpNav] = useState('');

    // Auto-calculate duration when dates change
    React.useEffect(() => {
        if (investmentType === 'Fixed Deposit' && startDate && maturityDate) {
            const start = new Date(startDate);
            const end = new Date(maturityDate);
            if (end > start) {
                const diffTime = Math.abs(end - start);
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays < 30) {
                    setDuration(`${diffDays} Days`);
                } else {
                    const diffMonths = Math.ceil(diffDays / 30.41);
                    setDuration(`${diffMonths} Months`);
                }
            }
        }
    }, [startDate, maturityDate, investmentType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            const data = {
                name,
                type: investmentType,
                amount: Number(amount),
                institution,
            };

            if (investmentType === 'Fixed Deposit') {
                data.interestRate = Number(interestRate);
                data.duration = Number(duration);
                data.startDate = startDate;
                data.maturityDate = maturityDate;
            } else {
                data.units = Number(units);
                data.nav = Number(nav);
                data.category = category;
                data.currentValue = Number(currentValue) || Number(amount);
            }

            await addInvestment(data);
            
            setShowModal(false);
            resetForm();
        } catch (err) {
            console.error("Submission error:", err);
            setError(err.response?.data?.message || err.message || "Failed to save investment. Please ensure the server is running and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this investment?')) return;
        try {
            await deleteInvestment(id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleTopUpSubmit = async (e) => {
        e.preventDefault();
        try {
            const additionalAmount = Number(topUpAmount);
            
            const updatedData = {
                ...selectedInv,
                amount: selectedInv.amount + additionalAmount,
                currentValue: (selectedInv.currentValue || selectedInv.amount) + additionalAmount
            };

            if (selectedInv.type === 'Mutual Fund') {
                if (upUnits) updatedData.units = (selectedInv.units || 0) + Number(upUnits);
                if (upNav) updatedData.nav = Number(upNav);
            }

            await updateInvestment(selectedInv._id, updatedData);
            setShowTopUpModal(false);
            setTopUpAmount('');
            setUpUnits('');
            setUpNav('');
            setSelectedInv(null);
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setName('');
        setAmount('');
        setInstitution('');
        setInterestRate('');
        setDuration('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setMaturityDate('');
        setUnits('');
        setNav('');
        setCategory('Equity');
        setCurrentValue('');
    };

    if (storeLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    const fdInvestments = investments.filter(i => i.type === 'Fixed Deposit');
    const mfInvestments = investments.filter(i => i.type === 'Mutual Fund');

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);
    const overallReturn = totalCurrentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (overallReturn / totalInvested) * 100 : 0;

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Portfolio & Investments</h1>
                    <p className="text-sm sm:text-base text-slate-500 mt-1">Manage your FD and Mutual Fund holdings</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => {
                            setInvestmentType('Fixed Deposit');
                            setShowModal(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-indigo-600 border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold shadow-sm"
                    >
                        <Landmark size={20} />
                        <span>Add FD</span>
                    </button>
                    <button
                        onClick={() => {
                            setInvestmentType('Mutual Fund');
                            setShowModal(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all font-bold"
                    >
                        <TrendingUp size={20} />
                        <span>Add Mutual Fund</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Wallet size={24} />
                        </div>
                        <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs">Total Invested</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-900">₹{totalInvested.toLocaleString()}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <LineChart size={24} />
                        </div>
                        <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs">Current Value</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-900">₹{totalCurrentValue.toLocaleString()}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-2xl ${overallReturn >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            <TrendingUp size={24} className={overallReturn < 0 ? 'rotate-180' : ''} />
                        </div>
                        <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs">Overall Return</h3>
                    </div>
                    <div>
                        <p className={`text-3xl font-black ${overallReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {overallReturn >= 0 ? '+' : ''}₹{Math.abs(overallReturn).toLocaleString()}
                        </p>
                        <p className={`text-sm font-bold mt-1 ${overallReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {overallReturn >= 0 ? '▲' : '▼'} {returnPercentage.toFixed(2)}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fixed Deposits Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Landmark className="text-indigo-600" size={24} />
                            Fixed Deposits
                        </h2>
                        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">{fdInvestments.length} Active</span>
                    </div>

                    {fdInvestments.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                            <Landmark size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium">No Fixed Deposits found</p>
                            <button onClick={() => { setInvestmentType('Fixed Deposit'); setShowModal(true); }} className="text-indigo-600 font-bold text-sm mt-2 hover:underline">Add your first FD</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {fdInvestments.map((fd) => (
                                <div key={fd._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                                    
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-1">{fd.institution}</p>
                                            <h3 className="text-xl font-bold text-slate-900">{fd.name}</h3>
                                        </div>
                                        <div className="text-right pr-12">
                                            <p className="text-xl font-black text-slate-900">₹{fd.amount.toLocaleString()}</p>
                                            <div className="flex items-center gap-1 justify-end">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-tighter">{fd.interestRate}% P.A.</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-6 pt-6 border-t border-slate-50 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                                <Calendar size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Invested On</p>
                                                <p className="text-xs font-bold text-slate-700">{new Date(fd.startDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-400">
                                                <Calendar size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Maturity Date</p>
                                                <p className="text-xs font-bold text-slate-700">{new Date(fd.maturityDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                                <PiggyBank size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Duration</p>
                                                <p className="text-xs font-bold text-slate-700">
                                                    {(() => {
                                                        const days = Math.round((new Date(fd.maturityDate) - new Date(fd.startDate)) / (1000 * 60 * 60 * 24));
                                                        return days < 30 ? `${days} Days` : `${Math.ceil(days / 30.41)} Months`;
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                                                <LineChart size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Est. Interest</p>
                                                <p className="text-xs font-black text-emerald-600">
                                                    {(() => {
                                                        const days = Math.round((new Date(fd.maturityDate) - new Date(fd.startDate)) / (1000 * 60 * 60 * 24));
                                                        const interest = (fd.amount * fd.interestRate * days) / (365 * 100);
                                                        return `+₹${Math.round(interest).toLocaleString()}`;
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <button 
                                            onClick={() => { setSelectedInv(fd); setShowTopUpModal(true); }}
                                            className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1"
                                        >
                                            <PlusCircle size={12} />
                                            Add Money
                                        </button>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Maturity Amount</span>
                                            <span className="text-lg font-black text-indigo-600">
                                                {(() => {
                                                    const days = Math.round((new Date(fd.maturityDate) - new Date(fd.startDate)) / (1000 * 60 * 60 * 24));
                                                    const interest = (fd.amount * fd.interestRate * days) / (365 * 100);
                                                    return `₹${Math.round(fd.amount + interest).toLocaleString()}`;
                                                })()}
                                            </span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleDelete(fd._id)}
                                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mutual Funds Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="text-purple-600" size={24} />
                            Mutual Funds
                        </h2>
                        <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full">{mfInvestments.length} Schemes</span>
                    </div>

                    {mfInvestments.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                            <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium">No Mutual Funds found</p>
                            <button onClick={() => { setInvestmentType('Mutual Fund'); setShowModal(true); }} className="text-purple-600 font-bold text-sm mt-2 hover:underline">Add your first MF</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {mfInvestments.map((mf) => {
                                const returns = mf.currentValue - mf.amount;
                                const retPerc = (returns / mf.amount) * 100;
                                return (
                                    <div key={mf._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">{mf.category}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{mf.institution}</p>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900">{mf.name}</h3>
                                            </div>
                                            <div className="text-right pr-12">
                                                <p className="text-lg font-black text-slate-900">₹{mf.currentValue?.toLocaleString() || mf.amount.toLocaleString()}</p>
                                                <p className={`text-xs font-bold ${returns >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {returns >= 0 ? '▲' : '▼'} {Math.abs(retPerc).toFixed(2)}%
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-50">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Invested</p>
                                                <p className="text-xs font-bold text-slate-700">₹{mf.amount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Units</p>
                                                <p className="text-xs font-bold text-slate-700">{mf.units}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">NAV</p>
                                                <p className="text-xs font-bold text-slate-700">₹{mf.nav}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-50">
                                            <button 
                                                onClick={() => { setSelectedInv(mf); setShowTopUpModal(true); }}
                                                className="w-full text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 py-2 rounded-xl hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                            >
                                                <PlusCircle size={14} />
                                                Add More Units / Money
                                            </button>
                                        </div>

                                        <button 
                                            onClick={() => handleDelete(mf._id)}
                                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Educational / Tip Section */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <TrendingUp size={160} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <AlertCircle className="text-indigo-400" />
                        Investment Strategy
                    </h3>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Diversifying between <span className="text-white font-bold">Fixed Deposits</span> for stability and <span className="text-white font-bold">Mutual Funds</span> for growth is a key to long-term wealth creation. Keep track of your maturity dates to reinvest wisely!
                    </p>
                </div>
            </div>

            {/* Add Investment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        
                        <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-slate-900 mb-6">Add Investment</h3>
                            
                            <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
                                <button
                                    onClick={() => { setInvestmentType('Fixed Deposit'); resetForm(); }}
                                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${investmentType === 'Fixed Deposit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Fixed Deposit
                                </button>
                                <button
                                    onClick={() => { setInvestmentType('Mutual Fund'); resetForm(); }}
                                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${investmentType === 'Mutual Fund' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Mutual Fund
                                </button>
                            </div>
                            <p className="text-slate-500 font-medium">Enter your {investmentType} details below</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Scheme Name</label>
                                    <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. HDFC Liquid Fund" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Institution</label>
                                    <input required type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. HDFC Bank" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Invested Amount (??)</label>
                                    <input required type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold" placeholder="50000" />
                                </div>
                                {investmentType === 'Fixed Deposit' ? (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Interest Rate (% P.A.)</label>
                                        <input required type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="7.5" />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                                            <option>Equity</option>
                                            <option>Debt</option>
                                            <option>Hybrid</option>
                                            <option>Index</option>
                                            <option>ELSS</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {investmentType === 'Fixed Deposit' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Investment Date</label>
                                            <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Maturity Date</label>
                                            <input required type="date" value={maturityDate} onChange={(e) => setMaturityDate(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                    </div>
                                    {startDate && maturityDate && (
                                        <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Calculated Duration</span>
                                            <span className="text-sm font-black text-indigo-600">{duration || '0 Days'}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Units</label>
                                            <input required type="number" step="0.001" value={units} onChange={(e) => setUnits(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="10.5" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">NAV</label>
                                            <input required type="number" step="0.01" value={nav} onChange={(e) => setNav(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="120.45" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Value</label>
                                            <input type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="Optional" />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Investment'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Top Up Modal */}
            {showTopUpModal && selectedInv && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        <button onClick={() => setShowTopUpModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>

                        <div className="mb-8 text-center">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PlusCircle size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Add More Money</h3>
                            <p className="text-slate-500 font-medium">Adding to {selectedInv.name}</p>
                        </div>

                        <form onSubmit={handleTopUpSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Amount to Add</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                        <input required type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-8 pr-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-xl font-black" placeholder="0" />
                                    </div>
                                </div>

                                {selectedInv.type === 'Mutual Fund' && (
                                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Units</label>
                                            <input type="number" step="0.001" value={upUnits} onChange={(e) => setUpUnits(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-bold" placeholder="e.g. 2.5" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current NAV</label>
                                            <input type="number" step="0.01" value={upNav} onChange={(e) => setUpNav(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-bold" placeholder={selectedInv.nav} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Projected Total Invested</p>
                                <p className="text-2xl font-black text-slate-900">₹{(selectedInv.amount + Number(topUpAmount)).toLocaleString()}</p>
                            </div>

                            <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 transition-all transform hover:-translate-y-1 active:scale-[0.98]">
                                Confirm Top-up
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
