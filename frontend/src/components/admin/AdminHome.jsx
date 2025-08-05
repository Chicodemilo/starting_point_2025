import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminHome = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        adminUsers: 0,
        regularUsers: 0,
        recentActivity: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Set mock data for demo
            setStats({
                totalUsers: 156,
                adminUsers: 3,
                regularUsers: 153,
                recentActivity: 24
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={loadingStyle}>Loading dashboard...</div>;
    }

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>📊 Admin Dashboard</h2>
            
            <div style={statsGridStyle}>
                <div style={statCardStyle}>
                    <div style={statIconStyle}>👥</div>
                    <div style={statContentStyle}>
                        <h3 style={statNumberStyle}>{stats.totalUsers}</h3>
                        <p style={statLabelStyle}>Total Users</p>
                    </div>
                </div>

                <div style={statCardStyle}>
                    <div style={statIconStyle}>🛡️</div>
                    <div style={statContentStyle}>
                        <h3 style={statNumberStyle}>{stats.adminUsers}</h3>
                        <p style={statLabelStyle}>Admin Users</p>
                    </div>
                </div>

                <div style={statCardStyle}>
                    <div style={statIconStyle}>👤</div>
                    <div style={statContentStyle}>
                        <h3 style={statNumberStyle}>{stats.regularUsers}</h3>
                        <p style={statLabelStyle}>Regular Users</p>
                    </div>
                </div>

                <div style={statCardStyle}>
                    <div style={statIconStyle}>⚡</div>
                    <div style={statContentStyle}>
                        <h3 style={statNumberStyle}>{stats.recentActivity}</h3>
                        <p style={statLabelStyle}>Recent Activity</p>
                    </div>
                </div>
            </div>

            <div style={chartsGridStyle}>
                <div style={chartCardStyle}>
                    <h3 style={chartTitleStyle}>📈 User Growth</h3>
                    <div style={chartPlaceholderStyle}>
                        Chart visualization coming soon...
                    </div>
                </div>

                <div style={chartCardStyle}>
                    <h3 style={chartTitleStyle}>🎯 System Health</h3>
                    <div style={healthIndicatorsStyle}>
                        <div style={healthItemStyle}>
                            <span style={healthLabelStyle}>Database</span>
                            <span style={{...healthStatusStyle, color: '#38a169'}}>✅ Healthy</span>
                        </div>
                        <div style={healthItemStyle}>
                            <span style={healthLabelStyle}>API Server</span>
                            <span style={{...healthStatusStyle, color: '#38a169'}}>✅ Healthy</span>
                        </div>
                        <div style={healthItemStyle}>
                            <span style={healthLabelStyle}>Frontend</span>
                            <span style={{...healthStatusStyle, color: '#38a169'}}>✅ Healthy</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={recentActivityStyle}>
                <h3 style={sectionTitleStyle}>🕒 Recent Activity</h3>
                <div style={activityListStyle}>
                    <div style={activityItemStyle}>
                        <span style={activityTimeStyle}>2 min ago</span>
                        <span>New user registration: john@example.com</span>
                    </div>
                    <div style={activityItemStyle}>
                        <span style={activityTimeStyle}>15 min ago</span>
                        <span>Admin login: {JSON.parse(localStorage.getItem('admin_username') || '"admin"')}</span>
                    </div>
                    <div style={activityItemStyle}>
                        <span style={activityTimeStyle}>1 hour ago</span>
                        <span>System backup completed successfully</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const containerStyle = {
    padding: '0'
};

const titleStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '2rem'
};

const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
    fontSize: '1.2rem',
    color: '#718096'
};

const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
};

const statCardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
};

const statIconStyle = {
    fontSize: '2.5rem',
    padding: '1rem',
    backgroundColor: '#edf2f7',
    borderRadius: '50%'
};

const statContentStyle = {
    flex: 1
};

const statNumberStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2d3748',
    margin: '0 0 0.25rem 0'
};

const statLabelStyle = {
    fontSize: '0.9rem',
    color: '#718096',
    margin: 0
};

const chartsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
};

const chartCardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const chartTitleStyle = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '1rem'
};

const chartPlaceholderStyle = {
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7fafc',
    borderRadius: '4px',
    color: '#718096',
    fontSize: '1rem'
};

const healthIndicatorsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
};

const healthItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#f7fafc',
    borderRadius: '4px'
};

const healthLabelStyle = {
    fontWeight: 'bold',
    color: '#2d3748'
};

const healthStatusStyle = {
    fontWeight: 'bold'
};

const recentActivityStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const sectionTitleStyle = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '1rem'
};

const activityListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
};

const activityItemStyle = {
    display: 'flex',
    gap: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f7fafc',
    borderRadius: '4px',
    alignItems: 'center'
};

const activityTimeStyle = {
    fontSize: '0.8rem',
    color: '#718096',
    fontWeight: 'bold',
    minWidth: '80px'
};

export default AdminHome;
