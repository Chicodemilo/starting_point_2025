import React from 'react';
import AdminHome from './AdminHome';
import UsersList from './UsersList';

const AdminMain = ({ activeView }) => {
    const renderContent = () => {
        switch (activeView) {
            case 'home':
                return <AdminHome />;
            case 'users':
                return <UsersList />;
            case 'settings':
                return <div style={placeholderStyle}>⚙️ Settings Panel - Coming Soon</div>;
            case 'reports':
                return <div style={placeholderStyle}>📈 Reports Panel - Coming Soon</div>;
            case 'logs':
                return <div style={placeholderStyle}>📝 System Logs - Coming Soon</div>;
            default:
                return <AdminHome />;
        }
    };

    return (
        <main style={mainStyle}>
            <div style={contentStyle}>
                {renderContent()}
            </div>
        </main>
    );
};

const mainStyle = {
    flex: 1,
    backgroundColor: '#f7fafc',
    overflow: 'auto'
};

const contentStyle = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
};

const placeholderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    fontSize: '1.5rem',
    color: '#718096',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '2px dashed #e2e8f0'
};

export default AdminMain;
