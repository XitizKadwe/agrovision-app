import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { districts } from '../data/locations'; // Re-use our locations data

function SignupPage() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [district, setDistrict] = useState(districts[0]);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, password, district }),
            });
            if (response.ok) {
                navigate('/login'); // Redirect to login after successful signup
            } else {
                alert('Registration failed. Phone number may already be in use.');
            }
        } catch (error) {
            console.error('Signup error:', error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="पूरा नाम (Full Name)" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded" required />
                    <input type="tel" placeholder="फ़ोन नंबर (Phone Number)" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border rounded" required />
                    <input type="password" placeholder="पासवर्ड (Password)" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded" required />
                    <select value={district} onChange={e => setDistrict(e.target.value)} className="w-full p-3 border rounded">
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button type="submit" className="w-full p-3 bg-green-600 text-white font-bold rounded">Sign Up</button>
                    <p className="text-center">Already have an account? <Link to="/login" className="text-blue-500">Login</Link></p>
                </form>
            </div>
        </div>
    );
}
export default SignupPage;