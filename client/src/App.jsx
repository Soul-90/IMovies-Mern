import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import AdminAddMovie from './AdminAddMovie';
import AdminAddTheater from './AdminAddTheater';
import AdminAddShow from './AdminAddShow';
import BookTicket from './BookTicket';
import MyBookings from './MyBookings';
import MovieReviews from './MovieReviews';
import Watchlist from './Watchlist';

function Navigation() {
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize user state with JWT expiration validation
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                // SECURITY FIX: Check token expiration
                const currentTime = Date.now() / 1000;
                if (decoded.exp && decoded.exp < currentTime) {
                    localStorage.removeItem('token');
                    return null;
                }
                return decoded;
            } catch (err) {
                console.error("Invalid token", err);
                localStorage.removeItem('token');
            }
        }
        return null;
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar" aria-label="Main Navigation">
            <Link to="/" className="brand-logo">i<span>MOVIES</span></Link>
            
            <div className="nav-links">
                <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Movies</Link>
                
                {user && (
                    <>
                        <Link to="/book" className={`nav-link ${isActive('/book')}`}>Book Ticket</Link>
                        <Link to="/my-bookings" className={`nav-link ${isActive('/my-bookings')}`}>My Orders</Link>
                        <Link to="/watchlist" className={`nav-link ${isActive('/watchlist')}`}>Watchlist</Link>
                    </>
                )}

                {user?.role === 'admin' && (
                    <>
                        <span style={{ color: 'var(--border-glass)', margin: '0 4px' }}>|</span>
                        <Link to="/admin" className={`nav-link nav-link-admin ${isActive('/admin')}`}>Admin Dashboard</Link>
                    </>
                )}
            </div>

            <div className="nav-links">
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="user-pill">
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></span>
                            <span>{user.username}</span>
                        </div>
                        <button onClick={handleLogout} className="btn-danger" style={{ padding: '6px 14px' }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="btn-primary" style={{ minHeight: '36px', padding: '6px 18px', textDecoration: 'none' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

function Home() {
    const [imminentShow, setImminentShow] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const user = JSON.parse(atob(token.split('.')[1]));
                axios.get(`http://localhost:8000/api/bookings/user/${user.id}`).then(res => {
                    const now = new Date();
                    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000); 
                    
                    const upcomingBooking = res.data.find(b => {
                        if (b.status !== 'Confirmed' || !b.show) return false;
                        // Appending +05:30 ensures local browser timezone handles IST correctly
                        const showTime = new Date(`${b.show.date}T${b.show.time}:00+05:30`);
                        return showTime > now && showTime <= threeHoursFromNow;
                    });

                    if (upcomingBooking) setImminentShow(upcomingBooking);
                });
            } catch (e) {
                console.error("Token parsing error in Home");
            }
        }
    }, []);

    return (
        <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '650px', margin: '0 auto' }}>
            
            {imminentShow && (
                <div className="reminder-banner">
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary)', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        ⏰ Reminder: Your show starts soon!
                    </h3>
                    <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                        Your screening of <strong>{imminentShow.show.movie?.title}</strong> at <strong>{imminentShow.show.theater?.name}</strong> is at <strong>{imminentShow.show.time}</strong>.
                    </p>
                    <div style={{ marginTop: '14px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <span className="status-chip status-chip-confirmed">Seats: {imminentShow.seatNumbers.join(', ')}</span>
                        <Link to="/my-bookings" className="btn-primary" style={{ padding: '4px 14px', minHeight: 'auto', width: 'auto', fontSize: '12px' }}>
                            View Ticket
                        </Link>
                    </div>
                </div>
            )}

            <span className="badge" style={{ padding: '6px 14px', marginBottom: '16px' }}>✨ Real-Time Cinema Reservations</span>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-1px', lineHeight: '1.15' }}>
                Cinema Experience Redefined.
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '17px', lineHeight: '1.6', marginBottom: '32px' }}>
                Browse current movies, select your exact seats on our interactive screen map, and book instantly.
            </p>
            <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '14px 32px', textDecoration: 'none', fontSize: '15px' }}>
                Explore Movies
            </Link>
        </div>
    );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book" element={<BookTicket />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/reviews/:movieId" element={<MovieReviews />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/add-movie" element={<AdminAddMovie />} />
          <Route path="/admin/add-theater" element={<AdminAddTheater />} />
          <Route path="/admin/add-show" element={<AdminAddShow />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;