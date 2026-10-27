import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

function BookTicket() {
    const [filteredShows, setFilteredShows] = useState([]);
    const [selectedShow, setSelectedShow] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [receipt, setReceipt] = useState(null);
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const targetMovieId = searchParams.get('movieId');

    const seatRows = ['A', 'B', 'C'];
    const seatsPerRow = 8;

    // DYNAMIC PRICING STATE CALCULATION
    const ticketTotal = selectedShow ? selectedShow.ticketPrice * selectedSeats.length : 0;
    const convenienceFee = selectedSeats.length > 0 ? 30 : 0;
    const grandTotal = ticketTotal + convenienceFee;

    useEffect(() => {
        const fetchShows = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/shows');
                const currentTime = new Date();

                const activeShows = res.data.filter(s => {
                    if (!s.date || !s.time) return false;
                    // TIMEZONE FIX: Append +05:30 to match IST
                    const showTime = new Date(`${s.date}T${s.time}:00+05:30`);
                    return showTime > currentTime;
                });

                if (activeShows.length > 0) {
                    if (targetMovieId) {
                        const matching = activeShows.filter(s => s.movie?._id === targetMovieId);
                        setFilteredShows(matching);
                        if (matching.length > 0) setSelectedShow(matching[0]);
                    } else {
                        setFilteredShows(activeShows);
                        setSelectedShow(activeShows[0]);
                    }
                } else {
                    setFilteredShows([]);
                }
            } catch (err) {
                console.error("Error fetching shows", err);
            }
        };

        fetchShows();
    }, [targetMovieId]);

    useEffect(() => {
        const fetchOccupiedSeats = async () => {
            if (!selectedShow) return;
            try {
                const res = await axios.get(`http://localhost:8000/api/bookings/show/${selectedShow._id}`);
                setOccupiedSeats(res.data);
            } catch (err) {
                console.error("Error fetching occupied seats", err);
            }
        };

        fetchOccupiedSeats();
    }, [selectedShow]);

    const toggleSeat = (seatId) => {
        if (occupiedSeats.includes(seatId)) return;

        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const handleBookingAndPayment = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Please login first to book tickets.');
            return;
        }

        if (!selectedShow || selectedSeats.length === 0) return;

        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            
            // SECURITY FIX: Pass 'expectedPrice: grandTotal' to prevent Bait-and-Switch
            const bookingRes = await axios.post('http://localhost:8000/api/bookings/create', {
                userId: tokenData.id,
                showId: selectedShow._id,
                seatNumbers: selectedSeats,
                expectedPrice: grandTotal 
            });

            const createdBooking = bookingRes.data.booking;

            const paymentRes = await axios.post('http://localhost:8000/api/payments/process', {
                bookingId: createdBooking._id,
                userId: tokenData.id,
                amount: createdBooking.totalPrice,
                paymentMethod
            });

            setReceipt(paymentRes.data.payment);
            setMessage('Booking & Payment Confirmed!');
            setOccupiedSeats(prev => [...prev, ...selectedSeats]);
            setSelectedSeats([]);
        } catch (err) {
            // This will correctly display the 409 Conflict message if prices surge during checkout
            setMessage(err.response?.data?.message || 'Error processing transaction');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Select Seats & Payment</h2>
            
            {receipt ? (
                <div className="bill-card" style={{ borderColor: 'var(--accent-green)', textAlign: 'center', padding: '32px' }}>
                    <span className="status-chip status-chip-confirmed" style={{ marginBottom: '12px' }}>Payment Confirmed</span>
                    <h3 style={{ color: '#ffffff', margin: '8px 0 16px 0' }}>Booking Receipt</h3>
                    
                    <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                        <p style={{ margin: '6px 0', fontSize: '13px' }}><strong>Transaction ID:</strong> <span style={{ color: 'var(--accent-green)' }}>{receipt.transactionId}</span></p>
                        <p style={{ margin: '6px 0', fontSize: '13px' }}><strong>Payment Gateway:</strong> {receipt.paymentMethod}</p>
                        <p style={{ margin: '6px 0', fontSize: '13px' }}><strong>Amount Charged:</strong> ₹{receipt.amount}</p>
                    </div>

                    <button onClick={() => setReceipt(null)} className="btn-primary">
                        Reserve Additional Seats
                    </button>
                </div>
            ) : filteredShows.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>{message || 'No scheduled shows available at this time.'}</p>
            ) : (
                <form onSubmit={handleBookingAndPayment}>
                    <div className="form-group">
                        <label>Scheduled Screening</label>
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
                                    {s.movie?.title} — {s.theater?.name} ({s.date} at {s.time}) — ₹{s.ticketPrice}/seat {s.isSurgePricing ? '🔥 Surge' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="screen-container">
                        <div className="cinema-screen"></div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '3px', fontWeight: '700' }}>CINEMA SCREEN</span>
                    </div>

                    <div className="seat-legend">
                        <div className="seat-legend-item">
                            <div className="seat-legend-box" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)' }}></div>
                            <span>Available</span>
                        </div>
                        <div className="seat-legend-item">
                            <div className="seat-legend-box" style={{ background: 'var(--primary)' }}></div>
                            <span>Selected</span>
                        </div>
                        <div className="seat-legend-item">
                            <div className="seat-legend-box" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.03)' }}></div>
                            <span>Booked</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginBottom: '28px' }}>
                        {seatRows.map(row => (
                            <div key={row} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-dim)', width: '12px', fontWeight: 'bold' }}>{row}</span>
                                {Array.from({ length: seatsPerRow }, (_, i) => {
                                    const seatId = `${row}${i + 1}`;
                                    const isOccupied = occupiedSeats.includes(seatId);
                                    const isSelected = selectedSeats.includes(seatId);

                                    let seatClass = 'seat-btn-available';
                                    if (isOccupied) seatClass = 'seat-btn-occupied';
                                    else if (isSelected) seatClass = 'seat-btn-selected';

                                    return (
                                        <button
                                            type="button"
                                            key={seatId}
                                            disabled={isOccupied}
                                            onClick={() => toggleSeat(seatId)}
                                            className={`seat-btn ${seatClass}`}
                                            aria-label={`Seat ${seatId} ${isOccupied ? 'Occupied' : isSelected ? 'Selected' : 'Available'}`}
                                        >
                                            {seatId}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Payment Method</label>
                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                            <option value="Card">Credit / Debit Card</option>
                            <option value="NetBanking">Net Banking</option>
                            <option value="Wallet">Digital Wallet</option>
                        </select>
                    </div>

                    <div className="bill-card">
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Order Breakdown</h4>
                        {selectedShow?.isSurgePricing && (
                            <div className="bill-row" style={{ color: 'var(--accent-red)' }}>
                                <span>⚡ High Demand Surge Applied</span>
                                <span>+₹{(selectedShow.ticketPrice - selectedShow.originalPrice)}/seat</span>
                            </div>
                        )}
                        <div className="bill-row">
                            <span>Selected Seat Numbers</span>
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
                        Confirm & Pay ₹{grandTotal} via {paymentMethod}
                    </button>
                </form>
            )}
            <p style={{ marginTop: '16px', color: message.includes('Error') || message.includes('Cannot') || message.includes('Price Update') ? 'var(--accent-red)' : 'var(--accent-green)' }}>{message}</p>
        </div>
    );
}

export default BookTicket;