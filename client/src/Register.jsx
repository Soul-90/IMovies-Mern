import { useState } from 'react';
import axios from 'axios';

function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user', adminSecret: '' });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/auth/register', formData);
            setMessage(res.data.message);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error registering');
        }
    };

    return (
        <div className="form-card">
            <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Create Account</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username</label>
                    <input type="text" required onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" required onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Account Type</label>
                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                        <option value="user">User (Standard)</option>
                        <option value="admin">Admin (Requires Secret Code)</option>
                    </select>
                </div>
                {formData.role === 'admin' && (
                    <div className="form-group">
                        <label>Admin Secret Passcode</label>
                        <input type="password" placeholder="admin123" required onChange={(e) => setFormData({ ...formData, adminSecret: e.target.value })} />
                    </div>
                )}
                <button type="submit" className="btn-primary" style={{ marginTop: '12px' }}>Register</button>
            </form>
            <p style={{ marginTop: '16px' }}>{message}</p>
        </div>
    );
}

export default Register;