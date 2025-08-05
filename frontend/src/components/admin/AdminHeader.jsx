import React from 'react';
import useAdminStore from '../../stores/adminStore';

const AdminHeader = () => {
    const { adminUser, logout } = useAdminStore();

    const handleLogout = () => {
        logout();
    };

    return (
        <header style={headerStyle}>
            <div style={leftSectionStyle}>
                <h1 style={titleStyle}>🛡️ Right to Remain Admin</h1>
            </div>
            
            <div style={rightSectionStyle}>
                <div style={userInfoStyle}>
                    <span style={welcomeStyle}>Welcome, {adminUser?.username}</span>
                    <span style={emailStyle}>{adminUser?.email}</span>
                </div>
                <button 
                    onClick={handleLogout}
                    style={logoutButtonStyle}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c53030'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#e53e3e'}
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#2d3748',
    color: 'white',
    borderBottom: '3px solid #4a5568',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const leftSectionStyle = {
    display: 'flex',
    alignItems: 'center'
};

const titleStyle = {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold'
};

const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
};

const userInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.25rem'
};

const welcomeStyle = {
    fontSize: '0.9rem',
    fontWeight: 'bold'
};

const emailStyle = {
    fontSize: '0.8rem',
    color: '#a0aec0'
};

const logoutButtonStyle = {
    padding: '0.5rem 1rem',
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
};

export default AdminHeader;
