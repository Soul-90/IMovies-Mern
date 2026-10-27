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
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ marginBottom: '36px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Admin Control Center</h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>Manage inventory, track financial analytics, and monitor live platform transactions.</p>
            </div>

            {/* MODULE 1: Management Tools */}
            <div style={{ marginBottom: '48px' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', color: 'var(--text-main)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⚡ Management Modules
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
                    <div onClick={() => navigate('/admin/add-movie')} className="movie-card" style={{ cursor: 'pointer', textAlign: 'center', padding: '24px 16px', minHeight: 'auto' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎬</div>
                        <h4 style={{ margin: '0 0 4px 0' }}>Add New Movie</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Expand film catalog</span>
                    </div>
                    <div onClick={() => navigate('/admin/add-theater')} className="movie-card" style={{ cursor: 'pointer', textAlign: 'center', padding: '24px 16px', minHeight: 'auto' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏢</div>
                        <h4 style={{ margin: '0 0 4px 0' }}>Register Theater</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Add new cinema locations</span>
                    </div>
                    <div onClick={() => navigate('/admin/add-show')} className="movie-card" style={{ cursor: 'pointer', textAlign: 'center', padding: '24px 16px', minHeight: 'auto', borderColor: 'var(--border-accent)', background: 'rgba(244, 63, 94, 0.05)' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
                        <h4 style={{ margin: '0 0 4px 0', color: 'var(--primary)' }}>Schedule Show</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Map movies to theater screens</span>
                    </div>
                </div>
            </div>

            {/* MODULE 2: Platform Analytics */}
            <div style={{ marginBottom: '48px' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', color: 'var(--text-main)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📊 Platform Metrics
                </h3>
                <div className="card-grid" style={{ marginTop: '20px' }}>
                    <div className="bill-card" style={{ padding: '24px', textAlign: 'center', marginTop: 0 }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '1px' }}>NET REVENUE</span>
                        <h2 style={{ color: 'var(--accent-green)', margin: '12px 0 0 0', fontSize: '36px' }}>₹{stats.totalRevenue.toLocaleString('en-IN')}</h2>
                    </div>
                    <div className="bill-card" style={{ padding: '24px', textAlign: 'center', marginTop: 0 }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '1px' }}>TOTAL BOOKINGS</span>
                        <h2 style={{ margin: '12px 0 0 0', fontSize: '36px' }}>{stats.totalBookings}</h2>
                    </div>
                    <div className="bill-card" style={{ padding: '24px', textAlign: 'center', marginTop: 0 }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '1px' }}>ACTIVE MOVIES</span>
                        <h2 style={{ margin: '12px 0 0 0', fontSize: '36px' }}>{stats.totalMovies}</h2>
                    </div>
                    <div className="bill-card" style={{ padding: '24px', textAlign: 'center', marginTop: 0 }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '1px' }}>THEATERS</span>
                        <h2 style={{ margin: '12px 0 0 0', fontSize: '36px' }}>{stats.totalTheaters}</h2>
                    </div>
                    <div className="bill-card" style={{ padding: '24px', textAlign: 'center', marginTop: 0 }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '1px' }}>SCHEDULED SHOWS</span>
                        <h2 style={{ margin: '12px 0 0 0', fontSize: '36px' }}>{stats.totalShows}</h2>
                    </div>
                </div>
            </div>

            {/* MODULE 3: Transaction Ledger */}
            <div>
                <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', color: 'var(--text-main)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🧾 Live Transaction Ledger
                </h3>
                <div className="bill-card" style={{ padding: '0', overflowX: 'auto', marginTop: '20px' }}>
                    {stats.recentBookings.length === 0 ? (
                        <p style={{ padding: '30px', color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>No recent bookings registered.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                                    <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>Customer</th>
                                    <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>Movie / Theater</th>
                                    <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>Seats</th>
                                    <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>Net Total</th>
                                    <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentBookings.map((b) => (
                                    <tr key={b._id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontWeight: '600' }}>{b.user?.username || 'Guest'}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{b.user?.email || 'N/A'}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{b.show?.movie?.title || 'Deleted Movie'}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.show?.theater?.name || 'N/A'}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: '13px' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>{b.seatNumbers?.join(', ')}</span>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontWeight: '600' }}>₹{b.totalPrice}</td>
                                        <td style={{ padding: '16px 20px' }}>
                                            {b.status === 'Confirmed' ? (
                                                <span className="status-chip status-chip-confirmed">Confirmed</span>
                                            ) : (
                                                <span className="status-chip status-chip-cancelled">Cancelled</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;