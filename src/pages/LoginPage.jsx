import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import our custom auth hook

function LoginPage() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth(); // Get the login function from our context
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password }),
            });
            const data = await response.json();
            if (response.ok) {
                login(data.user, data.token); // Use context to set user and token
                navigate('/'); // Redirect to homepage on successful login
            } else {
                alert(data.msg || 'Login failed.');
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="tel" placeholder="फ़ोन नंबर (Phone Number)" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border rounded" required />
                    <input type="password" placeholder="पासवर्ड (Password)" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded" required />
                    <button type="submit" className="w-full p-3 bg-green-600 text-white font-bold rounded">Login</button>
                    <p className="text-center">Don't have an account? <Link to="/signup" className="text-blue-500">Sign Up</Link></p>
                </form>
            </div>
        </div>
    );
}
export default LoginPage;