import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MyBookings() {
    const [activeTickets, setActiveTickets] = useState([]);
    const [pastTickets, setPastTickets] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchBookings = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const res = await axios.get(`http://localhost:8000/api/bookings/user/${tokenData.id}`);
            
            const now = new Date();
            const active = [];
            const past = [];

            res.data.forEach(booking => {
                if (!booking.show) return;
                
                // UX FIX: Accurate Timezone Handling
                const showDateTime = new Date(`${booking.show.date}T${booking.show.time}:00+05:30`);
                
                if (showDateTime > now && booking.status === 'Confirmed') {
                    active.push(booking);
                } else {
                    past.push(booking);
                }
            });

            setActiveTickets(active);
            setPastTickets(past);
        } catch (err) {
            setError('Error fetching your bookings.');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this ticket?")) return;
        
        try {
            const token = localStorage.getItem('token');
            const tokenData = JSON.parse(atob(token.split('.')[1]));

            // SECURITY FIX: Send userId to the backend to prove ownership
            await axios.put(`http://localhost:8000/api/bookings/cancel/${bookingId}`, {
                userId: tokenData.id
            });
            fetchBookings(); 
        } catch (err) {
            alert(err.response?.data?.message || 'Error cancelling booking');
        }
    };

    const TicketCard = ({ booking, isActive }) => (
        <div className="bill-card" style={{ padding: '20px', marginBottom: '0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)' }}>
                        {booking.show.movie?.title}
                    </h3>
                    {booking.status === 'Confirmed' ? (
                        <span className="status-chip status-chip-confirmed">Confirmed</span>
                    ) : (
                        <span className="status-chip status-chip-cancelled">Cancelled</span>
                    )}
                </div>
                
                <p style={{ margin: '6px 0', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                    <strong>Theater:</strong> {booking.show.theater?.name}
                </p>
                <p style={{ margin: '6px 0', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                    <strong>Showtime:</strong> {booking.show.date} at {booking.show.time}
                </p>
                <p style={{ margin: '6px 0', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                    <strong>Seats:</strong> <span style={{ color: 'var(--primary)' }}>{booking.seatNumbers.join(', ')}</span>
                </p>
                <p style={{ margin: '6px 0', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                    <strong>Amount Paid:</strong> ₹{booking.totalPrice}
                </p>
            </div>

            {isActive && booking.status === 'Confirmed' && (
                <button 
                    onClick={() => handleCancel(booking._id)} 
                    className="btn-danger" 
                    style={{ marginTop: '20px', width: '100%' }}
                >
                    Cancel Ticket
                </button>
            )}
        </div>
    );

    return (
        <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>My Orders</h2>
            {error && <p style={{ color: 'var(--accent-red)' }}>{error}</p>}
            
            <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginTop: '32px', color: 'var(--primary)' }}>
                🎫 Upcoming Shows
            </h3>
            {activeTickets.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>You have no upcoming confirmed shows.</p>
            ) : (
                <div className="card-grid">
                    {activeTickets.map(booking => <TicketCard key={booking._id} booking={booking} isActive={true} />)}
                </div>
            )}

            <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginTop: '48px' }}>
                🕰️ Past History & Cancellations
            </h3>
            {pastTickets.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No past booking history found.</p>
            ) : (
                <div className="card-grid" style={{ opacity: '0.75' }}>
                    {pastTickets.map(booking => <TicketCard key={booking._id} booking={booking} isActive={false} />)}
                </div>
            )}
        </div>
    );
}

export default MyBookings;