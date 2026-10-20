import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminAddShow() {
    const [movies, setMovies] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [formData, setFormData] = useState({ 
        movie: '', theater: '', date: '', time: '', ticketPrice: '' 
    });
    const [message, setMessage] = useState('');

    // Disallow past calendar dates in HTML input
    const todayDate = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const movieRes = await axios.get('http://localhost:8000/api/movies');
                const theaterRes = await axios.get('http://localhost:8000/api/theaters');
                setMovies(movieRes.data);
                setTheaters(theaterRes.data);
                
                if (movieRes.data.length > 0 && theaterRes.data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        movie: movieRes.data[0]._id,
                        theater: theaterRes.data[0]._id
                    }));
                }
            } catch (err) {
                console.error("Error fetching data", err);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate selected date/time against current time
        const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
        if (selectedDateTime < new Date()) {
            setMessage('Cannot schedule a show in the past!');
            return;
        }

        try {
            await axios.post('http://localhost:8000/api/shows/add', formData);
            setMessage('Show successfully scheduled!');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error scheduling show');
            console.error(err);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', marginTop: '30px' }}>
            <h2>Admin: Schedule a Show</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <select 
                    value={formData.movie} 
                    onChange={(e) => setFormData({ ...formData, movie: e.target.value })} 
                    required
                >
                    {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>

                <select 
                    value={formData.theater} 
                    onChange={(e) => setFormData({ ...formData, theater: e.target.value })} 
                    required
                >
                    {theaters.map(t => <option key={t._id} value={t._id}>{t.name} - {t.location}</option>)}
                </select>

                <input 
                    type="date" 
                    min={todayDate}
                    required 
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                />
                
                <input 
                    type="time" 
                    required 
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })} 
                />
                
                <input 
                    type="number" 
                    placeholder="Ticket Price (₹)" 
                    required 
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })} 
                />

                <button type="submit" style={{ padding: '10px', backgroundColor: '#333', color: 'white', border: 'none' }}>
                    Schedule Show
                </button>
            </form>
            <p style={{ color: message.includes('Cannot') || message.includes('Error') ? '#ff4d4d' : '#4caf50' }}>
                {message}
            </p>
        </div>
    );
}

export default AdminAddShow;