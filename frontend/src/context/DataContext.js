import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { token, loading: authLoading } = useAuth();

    const [transactions, setTransactions] = useState([]);
    const [goals, setGoals] = useState([]);
    const [debts, setDebts] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!token) {
            setTransactions([]);
            setGoals([]);
            setDebts([]);
            setInvestments([]);
            setLoading(false);
            return;
        }

        try {
            const [transRes, goalsRes, debtsRes, investRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/transactions`, { headers: { 'x-auth-token': token } }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/goals`, { headers: { 'x-auth-token': token } }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/debts`, { headers: { 'x-auth-token': token } }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/investments`, { headers: { 'x-auth-token': token } })
            ]);

            setTransactions(transRes.data);
            setGoals(goalsRes.data);
            setDebts(debtsRes.data);
            setInvestments(investRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, authLoading]);

    const addTransaction = async (transaction) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/transactions`, transaction);
        setTransactions([res.data, ...transactions]);
    };

    const addGoal = async (goal) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/goals`, goal);
        setGoals([res.data, ...goals]);
    };

    const updateGoal = async (id, currentAmount) => {
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/goals/${id}`, { currentAmount });
        setGoals(goals.map(g => g._id === id ? res.data : g));
    };

    const addDebt = async (debt) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/debts`, debt);
        setDebts([res.data, ...debts]);
    };

    const updateDebt = async (id, data) => {
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/debts/${id}`, data);
        setDebts(debts.map(d => d._id === id ? res.data : d));
    };

    const addInvestment = async (investment) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/investments`, investment);
        setInvestments([res.data, ...investments]);
    };

    const deleteInvestment = async (id) => {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/investments/${id}`);
        setInvestments(investments.filter(inv => inv._id !== id));
    };

    const updateInvestment = async (id, data) => {
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/investments/${id}`, data);
        setInvestments(investments.map(inv => inv._id === id ? res.data : inv));
    };

    const refreshInvestments = async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/investments`, { headers: { 'x-auth-token': token } });
        setInvestments(res.data);
    };

    return (
        <DataContext.Provider value={{ 
            transactions, goals, debts, investments, loading, 
            addTransaction, addGoal, updateGoal, addDebt, updateDebt,
            addInvestment, deleteInvestment, refreshInvestments, updateInvestment
        }}>
            {children}
        </DataContext.Provider>
    );
};
