import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [watchlistIds, setWatchlistIds] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
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

        fetchMoviesAndWatchlist();
    }, []);

    const toggleWatchlist = async (movieId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to bookmark movies.');
            return;
        }

        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const isSaved = watchlistIds.includes(movieId);

            if (isSaved) {
                await axios.post('http://localhost:8000/api/watchlist/remove', { userId: tokenData.id, movieId });
            } else {
                await axios.post('http://localhost:8000/api/watchlist/add', { userId: tokenData.id, movieId });
            }

            // Refresh watchlist IDs
            const wlRes = await axios.get(`http://localhost:8000/api/watchlist/user/${tokenData.id}`);
            setWatchlistIds(wlRes.data.map(m => m._id));
        } catch (err) {
            console.error("Watchlist error", err);
        }
    };

    const filteredMovies = movies.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Available Movies</h2>
                
                <div style={{ maxWidth: '300px', width: '100%' }}>
                    <input 
                        type="text" 
                        placeholder="Search by title or genre..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ padding: '8px 14px', fontSize: '13px' }}
                    />
                </div>
            </div>

            <div className="card-grid">
                {filteredMovies.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No movies found matching your search.</p>
                ) : null}
                
                {filteredMovies.map((movie) => {
                    const isBookmarked = watchlistIds.includes(movie._id);
                    return (
                        <div key={movie._id} className="movie-card">
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3>{movie.title}</h3>
                                    <button 
                                        onClick={() => toggleWatchlist(movie._id)}
                                        aria-label={isBookmarked ? "Remove from Watchlist" : "Add to Watchlist"}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: isBookmarked ? '#f43f5e' : '#64748b', 
                                            fontSize: '20px', 
                                            cursor: 'pointer',
                                            padding: '0 0 0 8px'
                                        }}
                                    >
                                        {isBookmarked ? '♥' : '♡'}
                                    </button>
                                </div>
                                <div>
                                    <span className="badge">{movie.genre}</span>
                                    <span className="badge">{movie.language}</span>
                                    <span className="badge badge-rating">⭐ {movie.rating || '4.5'}</span>
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '12px 0 20px 0', lineHeight: '1.5' }}>
                                    {movie.description || 'Experience this feature film in theaters near you.'}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                <button 
                                    onClick={() => navigate(`/book?movieId=${movie._id}`)}
                                    className="btn-primary"
                                    style={{ flex: 1, minHeight: '38px', fontSize: '13px' }}
                                >
                                    Book
                                </button>
                                <button 
                                    onClick={() => navigate(`/reviews/${movie._id}`)}
                                    className="btn-danger"
                                    style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', color: 'var(--text-main)', borderColor: 'var(--border-glass)' }}
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