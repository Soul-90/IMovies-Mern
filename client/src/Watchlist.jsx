import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Watchlist() {
    const [savedMovies, setSavedMovies] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const fetchWatchlist = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Please login to view your watchlist.');
            return;
        }

        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const res = await axios.get(`http://localhost:8000/api/watchlist/user/${tokenData.id}`);
            setSavedMovies(res.data);
        } catch (err) {
            console.error("Error fetching watchlist", err);
        }
    };

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const handleRemove = async (movieId) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            await axios.post('http://localhost:8000/api/watchlist/remove', {
                userId: tokenData.id,
                movieId
            });
            fetchWatchlist(); // Refresh list
        } catch (err) {
            console.error("Error removing from watchlist", err);
        }
    };

    return (
        <div>
            <h2>My Watchlist & Favorites</h2>
            {message && <p style={{ color: 'var(--text-muted)' }}>{message}</p>}

            <div className="card-grid">
                {savedMovies.length === 0 && !message ? (
                    <p style={{ color: 'var(--text-muted)' }}>Your watchlist is empty. Bookmark movies from the Dashboard!</p>
                ) : null}

                {savedMovies.map((movie) => (
                    <div key={movie._id} className="movie-card">
                        <div>
                            <h3>{movie.title}</h3>
                            <div>
                                <span className="badge">{movie.genre}</span>
                                <span className="badge">{movie.language}</span>
                                <span className="badge">⭐ {movie.rating || '4.5'}</span>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '10px 0 20px 0', lineHeight: '1.4' }}>
                                {movie.description || 'Experience this feature film in theaters near you.'}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <button 
                                onClick={() => navigate(`/book?movieId=${movie._id}`)}
                                className="btn-primary"
                                style={{ flex: 1 }}
                            >
                                Book
                            </button>
                            <button 
                                onClick={() => handleRemove(movie._id)}
                                className="btn-danger"
                                style={{ flex: 1 }}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Watchlist;