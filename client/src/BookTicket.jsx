import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

function BookTicket() {
    const [shows, setShows] = useState([]);
    const [filteredShows, setFilteredShows] = useState([]);
    const [selectedShow, setSelectedShow] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [receipt, setReceipt] = useState(null);
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const targetMovieId = searchParams.get('movieId');

    const seatRows = ['A', 'B', 'C'];
    const seatsPerRow = 8;

    useEffect(() => {
        const fetchShows = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/shows');
                setShows(res.data);

                if (res.data.length > 0) {
                    if (targetMovieId) {
                        const matching = res.data.filter(s => s.movie?._id === targetMovieId);
                        setFilteredShows(matching);
                        if (matching.length > 0) setSelectedShow(matching[0]);
                    } else {
                        setFilteredShows(res.data);
                        setSelectedShow(res.data[0]);
                    }
                }
            } catch (err) {
                console.error("Error fetching shows", err);
            }
        };
        fetchShows();
    }, [targetMovieId]);

    const toggleSeat = (seatId) => {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const handleBookingAndPayment = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Please login first to book tickets.');
            return;
        }

        if (!selectedShow || selectedSeats.length === 0) return;

        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            
            // Step 1: Create Booking
            const bookingRes = await axios.post('http://localhost:8000/api/bookings/create', {
                userId: tokenData.id,
                showId: selectedShow._id,
                seatNumbers: selectedSeats
            });

            const createdBooking = bookingRes.data.booking;

            // Step 2: Process Payment Transaction
            const paymentRes = await axios.post('http://localhost:8000/api/payments/process', {
                bookingId: createdBooking._id,
                userId: tokenData.id,
                amount: createdBooking.totalPrice,
                paymentMethod
            });

            setReceipt(paymentRes.data.payment);
            setMessage('Booking & Payment Confirmed!');
            setSelectedSeats([]);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error processing transaction');
        }
    };

    const ticketTotal = selectedShow ? selectedShow.ticketPrice * selectedSeats.length : 0;
    const convenienceFee = selectedSeats.length > 0 ? 30 : 0;
    const grandTotal = ticketTotal + convenienceFee;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Select Seats & Payment</h2>
            
            {receipt ? (
                <div className="bill-card" style={{ borderColor: 'var(--accent-green)', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--accent-green)', marginTop: 0 }}>Payment Successful!</h3>
                    <p><strong>Transaction ID:</strong> {receipt.transactionId}</p>
                    <p><strong>Payment Method:</strong> {receipt.paymentMethod}</p>
                    <p><strong>Amount Paid:</strong> ₹{receipt.amount}</p>
                    <p><strong>Status:</strong> {receipt.status}</p>
                    <button onClick={() => setReceipt(null)} className="btn-primary" style={{ marginTop: '15px' }}>
                        Book Another Ticket
                    </button>
                </div>
            ) : filteredShows.length === 0 ? (
                <p style={{ color: 'var(--accent-red)' }}>{message || 'No scheduled shows available.'}</p>
            ) : (
                <form onSubmit={handleBookingAndPayment}>
                    <div className="form-group">
                        <label>Select Scheduled Show</label>
                        <select 
                            value={selectedShow?._id || ''} 
                            onChange={(e) => {
                                const found = filteredShows.find(s => s._id === e.target.value);
                                setSelectedShow(found);
                                setSelectedSeats([]);
                            }}
                        >
                            {filteredShows.map(s => (
                                <option key={s._id} value={s._id}>
                                    {s.movie?.title} — {s.theater?.name} ({s.date} at {s.time}) — ₹{s.ticketPrice}/seat
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="screen-container">
                        <div className="cinema-screen"></div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px' }}>SCREEN</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
                        {seatRows.map(row => (
                            <div key={row} style={{ display: 'flex', gap: '10px' }}>
                                {Array.from({ length: seatsPerRow }, (_, i) => {
                                    const seatId = `${row}${i + 1}`;
                                    const isSelected = selectedSeats.includes(seatId);
                                    return (
                                        <button
                                            type="button"
                                            key={seatId}
                                            onClick={() => toggleSeat(seatId)}
                                            className={`seat-btn ${isSelected ? 'seat-btn-selected' : 'seat-btn-available'}`}
                                        >
                                            {seatId}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Payment Gateway Option</label>
                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                            <option value="Card">Credit / Debit Card</option>
                            <option value="NetBanking">Net Banking</option>
                            <option value="Wallet">Digital Wallet</option>
                        </select>
                    </div>

                    <div className="bill-card">
                        <h4 style={{ margin: '0 0 12px 0' }}>Booking & Payment Summary</h4>
                        <div className="bill-row">
                            <span>Selected Seats</span>
                            <strong>{selectedSeats.join(', ') || 'None'}</strong>
                        </div>
                        <div className="bill-row">
                            <span>Subtotal</span>
                            <span>₹{ticketTotal}</span>
                        </div>
                        <div className="bill-row">
                            <span>Convenience Fee</span>
                            <span>₹{convenienceFee}</span>
                        </div>
                        <div className="bill-row bill-row-total">
                            <span>Grand Total</span>
                            <span style={{ color: 'var(--primary)' }}>₹{grandTotal}</span>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={selectedSeats.length === 0}
                        className="btn-primary"
                        style={{ marginTop: '20px' }}
                    >
                        Pay ₹{grandTotal} via {paymentMethod}
                    </button>
                </form>
            )}
            <p style={{ marginTop: '15px' }}>{message}</p>
        </div>
    );
}

export default BookTicket;