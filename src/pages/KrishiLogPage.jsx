import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

import { ChevronLeft, PlusCircle, BrainCircuit, X, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cropList, activityTypes } from '../data/farmData';

function KrishiLogPage() {
    const { token } = useAuth();
    const [logs, setLogs] = useState([]);

    // State for the form fields
    const [crop, setCrop] = useState(cropList[0]);
    const [activityType, setActivityType] = useState(activityTypes[0]);
    const [yieldAmount, setYieldAmount] = useState('');
    const [activity, setActivity] = useState('');
    const [expense, setExpense] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // State for AI Analysis (unused in the provided snippet but kept for context)
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Load logs from the backend on initial render
    useEffect(() => {
        const getLogs = async () => {
            try {
                const response = await fetch('/.netlify/functions/getLogs', {
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setLogs(data);
            } catch (error) {
                console.error("Failed to fetch logs:", error);
            }
        };

        if (token) {
            getLogs();
        }
    }, [token]);

    // Function to add a new log entry
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activity || !date || !crop || !activityType) return;

        const newLogData = { date, crop, activityType, activity, expense, yieldAmount };
        try {
            const response = await fetch('/.netlify/functions/addLog', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'x-auth-token': token 
                },
                body: JSON.stringify(newLogData),
            });
            
            if (!response.ok) {
                throw new Error('Failed to save the log');
            }

            const savedLog = await response.json();
            // Prepend the new log to the existing logs in the state
            setLogs([savedLog, ...logs]);

            // Clear the form
            setActivity('');
            setExpense('');
            setYieldAmount('');
        } catch (error) {
            console.error("Failed to add log:", error);
        }
    };

    // Function to delete a log entry from the backend and state
    const handleDelete = async (idToDelete) => {
        try {
            const response = await fetch(`/.netlify/functions/deleteLog?id=${idToDelete}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token },
            });

            if (!response.ok) {
                throw new Error('Failed to delete the log from the server');
            }
            
            // If the server deletion is successful, update the UI state
            const updatedLogs = logs.filter(log => log._id !== idToDelete);
            setLogs(updatedLogs);

        } catch (error) {
            console.error("Failed to delete log:", error);
        }
    };

    // Function to get AI analysis
    const handleAnalysis = async () => {
        if (logs.length === 0) {
            alert("विश्लेषण के लिए कृपया पहले कुछ लॉग एंट्री जोड़ें।");
            return;
        }
        try {
            setIsAnalyzing(true);
            const response = await fetch('/.netlify/functions/analyzeLogs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logs }),
            });
            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (error) {
            console.error("Failed to get analysis:", error);
            setAnalysis("विश्लेषण प्राप्त करने में विफल। कृपया पुनः प्रयास करें।");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-4 justify-between">
                <div className="flex items-center gap-2">
                    <Link to="/" className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></Link>
                    <h1 className="text-xl font-bold text-gray-800">मेरी कृषि लॉग</h1>
                </div>
                <button 
                    onClick={handleAnalysis} 
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400"
                >
                    {isAnalyzing ? <Loader2 className="animate-spin" /> : <BrainCircuit size={20} />}
                    AI विश्लेषण
                </button>
            </div>

            <motion.form 
                onSubmit={handleSubmit} 
                className="bg-white p-4 rounded-xl shadow-md border border-gray-100 mb-6 space-y-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="font-bold text-lg">नई एंट्री जोड़ें</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">फसल चुनें</label>
                        <select value={crop} onChange={e => setCrop(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
                            {cropList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">काम का प्रकार</label>
                        <select value={activityType} onChange={e => setActivityType(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
                            {activityTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-600">गतिविधि का विवरण</label>
                    <input type="text" value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="जैसे: खरपतवार निकाला" className="w-full mt-1 p-2 border rounded-md" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">खर्च (Expense) ₹</label>
                        <input type="number" value={expense} onChange={(e) => setExpense(e.target.value)} placeholder="0" className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                    {activityType === 'Harvest' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <label className="text-sm font-medium text-green-700">उपज (Quintal में)</label>
                            <input type="number" value={yieldAmount} onChange={e => setYieldAmount(e.target.value)} placeholder="जैसे: 10" className="w-full mt-1 p-2 border-green-500 rounded-md" />
                        </motion.div>
                    )}
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-600">तारीख (Date)</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required />
                </div>
                <button type="submit" className="w-full p-3 bg-green-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-green-700">
                    <PlusCircle size={20} />
                    एंट्री सहेजें
                </button>
            </motion.form>

            <div className="space-y-3">
                <AnimatePresence>
                    {logs.map(log => (
                        <motion.div 
                            key={log.id} 
                            layout
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, x: -100 }}
                            className="bg-white p-4 rounded-xl shadow-sm border"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{log.crop}</span>
                                        <span className="text-xs font-semibold bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{log.activityType}</span>
                                    </div>
                                    <p className="font-bold text-gray-800">{log.activity}</p>
                                    <p className="text-sm text-gray-500 mt-1">{new Date(log.date).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    {log.expense > 0 && <p className="font-bold text-red-500">₹{log.expense.toLocaleString('en-IN')}</p>}
                                    {log.yield > 0 && <p className="font-bold text-green-600">{log.yield} क्विंटल उपज</p>}
                                    <button onClick={() => handleDelete(log._id)} className="p-2 text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 mt-1">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {analysis && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setAnalysis(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative"
                        >
                            <button onClick={() => setAnalysis(null)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200">
                                <X size={20} />
                            </button>
                            <div className="whitespace-pre-wrap text-gray-700">
                                {analysis}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default KrishiLogPage;
