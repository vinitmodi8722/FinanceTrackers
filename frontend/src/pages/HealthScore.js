import React from 'react';
import { HeartPulse, ShieldAlert, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function HealthScore() {
    const { transactions, goals, debts, loading } = useData();

    if (loading) return <div className="p-8 text-center text-slate-500">Calculating your financial health...</div>;

    // Calculate aggregated totals
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const totalDebt = debts.reduce((acc, d) => acc + d.balance, 0);
    const totalSavings = goals.reduce((acc, g) => acc + g.currentAmount, 0);

    let rawScore = 0;
    let savingsRate = 0;
    let debtRatio = 0;
    let monthsSaved = 0;
    let avgMonthlyExpenses = 0;
    // Calculate Average Monthly Expenses (Look at last 30 days or total spread)
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    if (expenseTransactions.length > 0) {
        const dates = expenseTransactions.map(t => new Date(t.date));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date();
        const diffDays = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));

        // If transactions are within the last 30 days, just use total expenses as 1 month
        const months = Math.max(1, diffDays / 30);
        avgMonthlyExpenses = (expenses / months);
    } else {
        avgMonthlyExpenses = income > 0 ? income * 0.7 : 1000;
    }

    const baseMonthlyExpenses = Math.max(500, avgMonthlyExpenses);

    // Better detection: Look for flag OR name
    const emergencyGoal = goals.find(g => g.isEmergencyFund) ||
        goals.find(g => g.name.toLowerCase().includes('emergency'));

    const emergencyProgress = emergencyGoal ? (emergencyGoal.currentAmount / emergencyGoal.targetAmount) : 0;

    if (income === 0 && expenses === 0 && totalDebt === 0 && totalSavings === 0) {
        rawScore = 50; // Neutral default for completely empty accounts
    } else {
        // 1. Income vs Expense Ratio (weight: 40)
        if (income > 0) {
            savingsRate = (income - expenses) / income;
            if (savingsRate >= 0.2) rawScore += 40;
            else if (savingsRate > 0) rawScore += (savingsRate / 0.2) * 40;
            else rawScore -= 20; // Penalize for spending more than income
        } else if (expenses > 0) {
            rawScore -= 20; // Spending without income
        }

        // 2. Debt Burden (weight: 30)
        if (totalDebt === 0) {
            rawScore += 30;
        } else if (income > 0) {
            debtRatio = totalDebt / (income * 12); // Approximate annual debt to income
            if (debtRatio < 0.1) rawScore += 25;
            else if (debtRatio <= 0.4) rawScore += 25 - ((debtRatio - 0.1) / 0.3) * 25;
        }

        // 3. Savings / Emergency Fund (weight: 30)
        monthsSaved = totalSavings / baseMonthlyExpenses;

        // Combine objective months saved with user goal progress
        const objectiveScore = Math.min(1, monthsSaved / 3) * 15; // Max 15 points for 3 months runway
        const goalScore = Math.min(1, emergencyProgress) * 15;    // Max 15 points for hitting user target

        rawScore += (objectiveScore + goalScore);
    }

    // Clamp score
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));

    // Determine Stress Category
    let stressLevel = "Low";
    let stressMessage = "Your finances are well balanced. Keep maintaining your healthy saving habits!";
    let scoreText = "Excellent";
    let scoreColor = "emerald";

    if (score < 50) {
        stressLevel = "High";
        stressMessage = "Your spending is extremely close to or exceeding your income. You need an immediate budget plan to reduce expenses.";
        scoreText = "Poor";
        scoreColor = "rose";
    } else if (score < 75) {
        stressLevel = "Moderate";
        stressMessage = "You have a manageable baseline, but your expenses are high compared to your savings rate. Focus on reducing costs and building an emergency fund.";
        scoreText = "Fair";
        scoreColor = "amber";
    } else if (score < 90) {
        scoreText = "Good";
        scoreColor = "blue";
    }

    // UI Formatting for Breakdown
    const displaySavingsRate = income > 0 ? Math.round(savingsRate * 100) : 0;
    const savingsRateStatus = displaySavingsRate >= 20 ? "Excellent" : displaySavingsRate > 5 ? "Fair" : "Needs Work";
    const savingsRateIcon = displaySavingsRate >= 20 ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />;

    const debtStatus = totalDebt === 0 ? "Excellent" : debtRatio > 0.4 ? "High Risk" : "Manageable";
    const debtIcon = totalDebt === 0 ? <CheckCircle size={16} className="text-emerald-500" /> : <Info size={16} className="text-indigo-500" />;

    const isFullyFunded = (emergencyGoal && emergencyGoal.currentAmount >= emergencyGoal.targetAmount) || monthsSaved >= 3;
    const emergencyStatus = isFullyFunded ? "Fully Funded" : (monthsSaved >= 1 ? "Building" : "Insufficient");
    const emergencyIcon = isFullyFunded ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />;

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-1">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Financial Health Score</h1>
                <p className="text-sm sm:text-base text-slate-500 mt-1">Holistic view of your saving, spending, and debt status actively based on your data</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Score Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <HeartPulse size={200} />
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-slate-700 mb-6 sm:mb-8 relative z-10">Your Overall Score</h2>

                    <div className="relative flex items-center justify-center w-48 h-48 sm:w-64 sm:h-64 z-10">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                            <path
                                className="text-slate-100"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className={`${scoreColor === 'emerald' ? 'text-emerald-500' : scoreColor === 'rose' ? 'text-rose-500' : scoreColor === 'amber' ? 'text-amber-500' : 'text-blue-500'} drop-shadow-md transition-all duration-1000 ease-out`}
                                strokeDasharray={`${score}, 100`}
                                strokeWidth="3"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter">{score}</span>
                            <span className={`text-[10px] sm:text-sm font-bold px-3 py-1 rounded-full text-center mt-2 flex items-center gap-1 shadow-sm ${scoreColor === 'emerald' ? 'text-emerald-600 bg-emerald-50' : scoreColor === 'rose' ? 'text-rose-600 bg-rose-50' : scoreColor === 'amber' ? 'text-amber-600 bg-amber-50' : 'text-blue-600 bg-blue-50'}`}>
                                <CheckCircle size={14} />
                                {scoreText}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 flex flex-col">
                    {/* Stress Indicator */}
                    <div className={`rounded-3xl p-6 sm:p-8 shadow-sm border transition-colors ${stressLevel === 'Low' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : stressLevel === 'Moderate' ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-rose-50 border-rose-100 text-rose-900'}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                <ShieldAlert size={24} className={stressLevel === 'Moderate' ? 'text-amber-500' : stressLevel === 'High' ? 'text-rose-500' : 'text-emerald-500'} />
                                Financial Stress
                            </h3>
                            <span className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm ${stressLevel === 'Low' ? 'bg-emerald-500 text-white' : stressLevel === 'Moderate' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                                {stressLevel} Risk
                            </span>
                        </div>
                        <p className={`text-sm sm:text-base font-medium ${stressLevel === 'Low' ? 'text-emerald-700' : stressLevel === 'Moderate' ? 'text-amber-700' : 'text-rose-700'}`}>
                            {stressMessage}
                        </p>
                    </div>

                    {/* Key Metrics Breakdown */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 border-b pb-4">Key Factors Based on Your Data</h3>
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                <div>
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base">Savings Rate {savingsRateIcon}</h4>
                                    <p className="text-[10px] sm:text-sm text-slate-500">{displaySavingsRate}% of tracked income saved</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <span className={`text-base sm:text-lg font-bold ${displaySavingsRate >= 20 ? 'text-emerald-600' : displaySavingsRate > 5 ? 'text-amber-500' : 'text-rose-500'}`}>{savingsRateStatus}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-t border-slate-50 pt-4 sm:border-0 sm:pt-0">
                                <div>
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base">Debt Level {debtIcon}</h4>
                                    <p className="text-[10px] sm:text-sm text-slate-500">₹{totalDebt.toLocaleString()} total outstanding</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <span className={`text-base sm:text-lg font-bold ${totalDebt === 0 ? 'text-emerald-600' : debtRatio > 0.4 ? 'text-rose-500' : 'text-amber-500'}`}>{debtStatus}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-t border-slate-50 pt-4 sm:border-0 sm:pt-0">
                                <div>
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base">Emergency Fund {emergencyIcon}</h4>
                                    <p className="text-[10px] sm:text-sm text-slate-500">{monthsSaved.toFixed(1)} months minimal expenses</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <span className={`text-base sm:text-lg font-bold ${monthsSaved >= 3 ? 'text-emerald-600' : monthsSaved >= 1 ? 'text-amber-500' : 'text-rose-500'}`}>{emergencyStatus}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
