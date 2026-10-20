import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [movies, setMovies] = useState([]);
    const [watchlistIds, setWatchlistIds] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const fetchMoviesAndWatchlist = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/movies');
            setMovies(res.data);

            const token = localStorage.getItem('token');
            if (token) {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                const wlRes = await axios.get(`http://localhost:8000/api/watchlist/user/${tokenData.id}`);
                setWatchlistIds(wlRes.data.map(m => m._id));
            }
        } catch (err) {
            console.error("Error fetching movies or watchlist", err);
        }
    };

    useEffect(() => {
        fetchMoviesAndWatchlist();
    }, []);

    const toggleWatchlist = async (movieId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to save movies to your watchlist.');
            return;
        }

        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const isSaved = watchlistIds.includes(movieId);

            if (isSaved) {
                await axios.post('http://localhost:8000/api/watchlist/remove', {
                    userId: tokenData.id,
                    movieId
                });
            } else {
                await axios.post('http://localhost:8000/api/watchlist/add', {
                    userId: tokenData.id,
                    movieId
                });
            }

            fetchMoviesAndWatchlist(); // Refresh bookmark states
        } catch (err) {
            console.error("Watchlist error", err);
        }
    };

    return (
        <div>
            <h2>Available Movies</h2>
            <div className="card-grid">
                {movies.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No movies available yet.</p> : null}
                
                {movies.map((movie) => {
                    const isBookmarked = watchlistIds.includes(movie._id);
                    return (
                        <div key={movie._id} className="movie-card">
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3>{movie.title}</h3>
                                    <button 
                                        onClick={() => toggleWatchlist(movie._id)}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: isBookmarked ? '#ef4444' : '#6b7280', 
                                            fontSize: '20px', 
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                        title={isBookmarked ? "Remove from Watchlist" : "Add to Watchlist"}
                                    >
                                        {isBookmarked ? '♥' : '♡'}
                                    </button>
                                </div>
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
                                    onClick={() => navigate(`/reviews/${movie._id}`)}
                                    className="btn-danger"
                                    style={{ flex: 1, backgroundColor: '#272a37', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                                >
                                    Reviews
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Dashboard;