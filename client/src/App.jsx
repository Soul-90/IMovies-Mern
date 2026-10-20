import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import AdminAddMovie from './AdminAddMovie';
import AdminAddShow from './AdminAddShow';
import BookTicket from './BookTicket';
import MyBookings from './MyBookings';
import MovieReviews from './MovieReviews';
import Watchlist from './Watchlist';

function Navigation() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                setUser(decoded);
            } catch (err) {
                console.error("Invalid token", err);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="brand-logo">i<span>MOVIES</span></Link>
            
            <div className="nav-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/dashboard" className="nav-link">Movies</Link>
                
                {user && (
                    <>
                        <Link to="/book" className="nav-link">Book Ticket</Link>
                        <Link to="/my-bookings" className="nav-link">My Orders</Link>
                        <Link to="/watchlist" className="nav-link">Watchlist</Link>
                    </>
                )}

                {user?.role === 'admin' && (
                    <>
                        <span style={{ color: 'var(--border-color)' }}>|</span>
                        <Link to="/admin" className="nav-link nav-link-admin">Admin Dashboard</Link>
                    </>
                )}
            </div>

            <div className="nav-links">
                {user ? (
                    <>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Hi, <strong>{user.username}</strong></span>
                        <button onClick={handleLogout} className="btn-danger" style={{ padding: '6px 12px' }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', textDecoration: 'none' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />

        <Routes>
          <Route path="/" element={
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '10px' }}>Movie Ticket Booking Made Simple.</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '500px', margin: '0 auto 30px auto' }}>
                Browse upcoming shows, pick your favorite seats in real-time, and manage reservations seamlessly.
              </p>
              <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '14px 28px', textDecoration: 'none' }}>
                Browse Movies Now
              </Link>
            </div>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book" element={<BookTicket />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/reviews/:movieId" element={<MovieReviews />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/add-movie" element={<AdminAddMovie />} />
          <Route path="/admin/add-show" element={<AdminAddShow />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;