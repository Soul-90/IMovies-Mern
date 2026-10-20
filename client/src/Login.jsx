import { useState } from 'react';
import axios from 'axios';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            window.location.href = '/dashboard';
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error logging in');
        }
    };

    return (
        <div className="form-card">
            <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" required onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '12px' }}>Login</button>
            </form>
            <p style={{ color: 'var(--accent-red)', marginTop: '16px' }}>{message}</p>
        </div>
    );
}

export default Login;