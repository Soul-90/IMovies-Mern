import { useState } from 'react';
import axios from 'axios';

function AdminAddTheater() {
    const [formData, setFormData] = useState({ name: '', location: '', screens: 1 });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/theaters/add', formData);
            setMessage(`Theater "${res.data.name}" added successfully!`);
            setFormData({ name: '', location: '', screens: 1 });
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error adding theater');
        }
    };

    return (
        <div className="form-card" style={{ maxWidth: '420px' }}>
            <h2>Admin: Add New Theater</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Theater Name</label>
                    <input 
                        type="text" 
                        placeholder="e.g. PVR Cinemas" 
                        required 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    />
                </div>
                <div className="form-group">
                    <label>Location / Mall</label>
                    <input 
                        type="text" 
                        placeholder="e.g. City Center Mall" 
                        required 
                        value={formData.location} 
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                    />
                </div>
                <div className="form-group">
                    <label>Number of Screens</label>
                    <input 
                        type="number" 
                        min="1" 
                        required 
                        value={formData.screens} 
                        onChange={(e) => setFormData({ ...formData, screens: e.target.value })} 
                    />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                    Add Theater
                </button>
            </form>
            <p style={{ marginTop: '12px' }}>{message}</p>
        </div>
    );
}

export default AdminAddTheater;