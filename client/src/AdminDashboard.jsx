import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalMovies: 0,
        totalTheaters: 0,
        totalShows: 0,
        totalBookings: 0,
        totalRevenue: 0,
        recentBookings: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/admin/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching admin stats", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Admin Overview Dashboard</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate('/admin/add-movie')} className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }}>
                        + Add Movie
                    </button>
                    <button onClick={() => navigate('/admin/add-show')} className="btn-primary" style={{ width: 'auto', padding: '8px 16px', backgroundColor: '#374151' }}>
                        + Schedule Show
                    </button>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '32px' }}>
                <div className="movie-card" style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>TOTAL REVENUE</span>
                    <h2 style={{ color: 'var(--accent-green)', margin: '8px 0 0 0', fontSize: '28px' }}>₹{stats.totalRevenue}</h2>
                </div>
                <div className="movie-card" style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>TOTAL BOOKINGS</span>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '28px' }}>{stats.totalBookings}</h2>
                </div>
                <div className="movie-card" style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ACTIVE MOVIES</span>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '28px' }}>{stats.totalMovies}</h2>
                </div>
                <div className="movie-card" style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>THEATERS</span>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '28px' }}>{stats.totalTheaters}</h2>
                </div>
                <div className="movie-card" style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SCHEDULED SHOWS</span>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '28px' }}>{stats.totalShows}</h2>
                </div>
            </div>

            {/* Recent System Activity Table */}
            <h3>Recent Customer Bookings</h3>
            <div className="bill-card" style={{ padding: '0', overflow: 'hidden' }}>
                {stats.recentBookings.length === 0 ? (
                    <p style={{ padding: '20px', color: 'var(--text-muted)', margin: 0 }}>No recent bookings registered yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                                <th style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>User</th>
                                <th style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>Movie</th>
                                <th style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>Theater</th>
                                <th style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>Seats</th>
                                <th style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>Amount</th>
                                <th style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentBookings.map((b) => (
                                <tr key={b._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '14px 16px' }}>{b.user?.username || 'Customer'}</td>
                                    <td style={{ padding: '14px 16px' }}><strong>{b.show?.movie?.title || 'N/A'}</strong></td>
                                    <td style={{ padding: '14px 16px' }}>{b.show?.theater?.name || 'N/A'}</td>
                                    <td style={{ padding: '14px 16px' }}>{b.seatNumbers?.join(', ')}</td>
                                    <td style={{ padding: '14px 16px' }}>₹{b.totalPrice}</td>
                                    <td style={{ padding: '14px 16px', color: b.status === 'Confirmed' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                        {b.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;