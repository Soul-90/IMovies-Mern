import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function MovieReviews() {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');

    const fetchMovieAndReviews = async () => {
        try {
            const moviesRes = await axios.get('http://localhost:8000/api/movies');
            const found = moviesRes.data.find(m => m._id === movieId);
            setMovie(found);

            const reviewsRes = await axios.get(`http://localhost:8000/api/reviews/movie/${movieId}`);
            setReviews(reviewsRes.data);
        } catch (err) {
            console.error("Error fetching review data", err);
        }
    };

    useEffect(() => {
        fetchMovieAndReviews();
    }, [movieId]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Please login to leave a review.');
            return;
        }

        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));

            const res = await axios.post('http://localhost:8000/api/reviews/add', {
                movieId,
                userId: tokenData.id,
                rating: Number(rating),
                comment
            });

            setMessage(res.data.message);
            setComment('');
            fetchMovieAndReviews(); // Reload list
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error submitting review');
        }
    };

    return (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <button onClick={() => navigate('/dashboard')} className="btn-danger" style={{ marginBottom: '20px' }}>
                ← Back to Movies
            </button>

            {movie && (
                <div className="bill-card" style={{ marginBottom: '24px' }}>
                    <h2 style={{ marginTop: 0 }}>{movie.title}</h2>
                    <span className="badge">{movie.genre}</span>
                    <span className="badge">{movie.language}</span>
                    <span className="badge">⭐ {movie.rating}/5</span>
                    <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>{movie.description}</p>
                </div>
            )}

            {/* Submit Review Form */}
            <div className="form-card" style={{ maxWidth: '100%', margin: '0 0 30px 0' }}>
                <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Write a Review</h3>
                <form onSubmit={handleSubmitReview}>
                    <div className="form-group">
                        <label>Rating (1 to 5 Stars)</label>
                        <select value={rating} onChange={(e) => setRating(e.target.value)}>
                            <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                            <option value="4">⭐⭐⭐⭐ (4/5)</option>
                            <option value="3">⭐⭐⭐ (3/5)</option>
                            <option value="2">⭐⭐ (2/5)</option>
                            <option value="1">⭐ (1/5)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Your Review</label>
                        <textarea 
                            rows="3" 
                            required 
                            placeholder="What did you think of the film?"
                            value={comment} 
                            onChange={(e) => setComment(e.target.value)} 
                        />
                    </div>

                    <button type="submit" className="btn-primary">Post Review</button>
                </form>
                {message && <p style={{ marginTop: '12px' }}>{message}</p>}
            </div>

            {/* Reviews List */}
            <h3>Audience Reviews ({reviews.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No reviews posted yet.</p> : null}

                {reviews.map(r => (
                    <div key={r._id} className="bill-card" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong>{r.user?.username || 'Anonymous'}</strong>
                            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{"⭐".repeat(r.rating)}</span>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>{r.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MovieReviews;