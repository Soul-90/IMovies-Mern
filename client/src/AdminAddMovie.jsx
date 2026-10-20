import { useState } from 'react';
import axios from 'axios';

function AdminAddMovie() {
    const [formData, setFormData] = useState({ 
        title: '', genre: '', language: '', duration: '', cast: '', releaseDate: '', rating: '4.5', description: '' 
    });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/movies/add', formData);
            setMessage(`Successfully added: ${res.data.title}`);
            setFormData({ title: '', genre: '', language: '', duration: '', cast: '', releaseDate: '', rating: '4.5', description: '' });
        } catch (err) {
            setMessage('Error adding movie');
            console.error(err);
        }
    };

    return (
        <div className="form-card" style={{ maxWidth: '480px' }}>
            <h2>Admin: Add New Movie</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                        <label>Genre</label>
                        <input type="text" required value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Language</label>
                        <input type="text" required value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                        <label>Duration (e.g. 2h 15m)</label>
                        <input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Rating (1-5)</label>
                        <input type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Cast Members</label>
                    <input type="text" placeholder="Actor 1, Actor 2" value={formData.cast} onChange={(e) => setFormData({ ...formData, cast: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Add Movie</button>
            </form>
            <p style={{ marginTop: '12px' }}>{message}</p>
        </div>
    );
}

export default AdminAddMovie;