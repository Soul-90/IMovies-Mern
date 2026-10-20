import { useState, useEffect } from 'react';
import axios from 'axios';

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [message, setMessage] = useState('');

    const fetchBookings = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Please login to view your booking history.');
            return;
        }

        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const res = await axios.get(`http://localhost:8000/api/bookings/user/${tokenData.id}`);
            setBookings(res.data);
        } catch (err) {
            console.error("Error fetching bookings", err);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancelBooking = async (bookingId) => {
        try {
            const res = await axios.put(`http://localhost:8000/api/bookings/cancel/${bookingId}`);
            setMessage(res.data.message);
            fetchBookings(); // Refresh list
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error cancelling booking');
        }
    };

    return (
        <div style={{ marginTop: '30px' }}>
            <h2>My Booking History</h2>
            {message && <p>{message}</p>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                {bookings.length === 0 && !message ? <p>No bookings found.</p> : null}

                {bookings.map((b) => (
                    <div key={b._id} style={{ 
                        border: '1px solid #444', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        backgroundColor: '#222',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ marginTop: 0 }}>{b.show?.movie?.title}</h3>
                            <p style={{ margin: '4px 0' }}><strong>Theater:</strong> {b.show?.theater?.name} ({b.show?.theater?.location})</p>
                            <p style={{ margin: '4px 0' }}><strong>Date & Time:</strong> {b.show?.date} at {b.show?.time}</p>
                            <p style={{ margin: '4px 0' }}><strong>Seats:</strong> {b.seatNumbers?.join(', ')}</p>
                            <p style={{ margin: '4px 0' }}><strong>Total Paid:</strong> ₹{b.totalPrice}</p>
                            <p style={{ margin: '4px 0' }}>
                                <strong>Status:</strong> 
                                <span style={{ color: b.status === 'Confirmed' ? '#4caf50' : '#f44336', marginLeft: '6px' }}>
                                    {b.status}
                                </span>
                            </p>
                        </div>

                        {b.status === 'Confirmed' && (
                            <button 
                                onClick={() => handleCancelBooking(b._id)}
                                style={{
                                    padding: '10px 15px',
                                    backgroundColor: '#d32f2f',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel Ticket
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyBookings;