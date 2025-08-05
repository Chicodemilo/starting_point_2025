import React, { useState, useEffect } from 'react';

const AdminNavigation = ({ activeView, onViewChange }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 750);
            if (window.innerWidth > 750) {
                setIsMenuOpen(false); // Close menu when switching to desktop
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const handleViewChange = (viewId) => {
        onViewChange(viewId);
        setIsMenuOpen(false); // Close menu after selection on mobile
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    const navItems = [
        { id: 'home', label: '🏠 Dashboard', icon: '📊' },
        { id: 'users', label: '👥 Users', icon: '👤' },
        { id: 'settings', label: '⚙️ Settings', icon: '🔧' },
        { id: 'reports', label: '📈 Reports', icon: '📋' },
        { id: 'logs', label: '📝 System Logs', icon: '📄' }
    ];

    if (isMobile) {
        return (
            <>
                {/* Hamburger Menu Button */}
                <button 
                    onClick={toggleMenu}
                    style={hamburgerButtonStyle}
                    aria-label="Toggle navigation menu"
                >
                    <span style={hamburgerIconStyle}>
                        {isMenuOpen ? '✕' : '☰'}
                    </span>
                </button>

                {/* Mobile Dropdown Menu */}
                {isMenuOpen && (
                    <>
                        <div style={overlayStyle} onClick={() => setIsMenuOpen(false)} />
                        <nav style={mobileNavStyle}>
                            <div style={mobileNavHeaderStyle}>
                                <h3 style={navTitleStyle}>Navigation</h3>
                                <button 
                                    onClick={() => setIsMenuOpen(false)}
                                    style={closeButtonStyle}
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <ul style={navListStyle}>
                                {navItems.map((item) => (
                                    <li key={item.id} style={navItemStyle}>
                                        <button
                                            onClick={() => handleViewChange(item.id)}
                                            style={{
                                                ...navButtonStyle,
                                                ...(activeView === item.id ? activeNavButtonStyle : {})
                                            }}
                                        >
                                            <span style={iconStyle}>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </>
                )}
            </>
        );
    }

    // Desktop Navigation
    return (
        <nav style={navStyle}>
            <div style={navHeaderStyle}>
                <h3 style={navTitleStyle}>Navigation</h3>
            </div>
            
            <ul style={navListStyle}>
                {navItems.map((item) => (
                    <li key={item.id} style={navItemStyle}>
                        <button
                            onClick={() => handleViewChange(item.id)}
                            style={{
                                ...navButtonStyle,
                                ...(activeView === item.id ? activeNavButtonStyle : {})
                            }}
                            onMouseOver={(e) => {
                                if (activeView !== item.id) {
                                    e.target.style.backgroundColor = '#4a5568';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (activeView !== item.id) {
                                    e.target.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span style={iconStyle}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

const navStyle = {
    width: '250px',
    backgroundColor: '#1a202c',
    color: 'white',
    height: '100%',
    borderRight: '2px solid #2d3748',
    padding: '1rem 0'
};

const navHeaderStyle = {
    padding: '0 1rem 1rem 1rem',
    borderBottom: '1px solid #2d3748',
    marginBottom: '1rem'
};

const navTitleStyle = {
    margin: 0,
    fontSize: '1.1rem',
    color: '#a0aec0',
    fontWeight: 'bold'
};

const navListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0
};

const navItemStyle = {
    margin: '0.25rem 0'
};

const navButtonStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'background-color 0.2s'
};

const activeNavButtonStyle = {
    backgroundColor: '#3182ce',
    borderRight: '3px solid #63b3ed'
};

const iconStyle = {
    fontSize: '1.1rem'
};

// Mobile-specific styles
const hamburgerButtonStyle = {
    position: 'fixed',
    top: '1rem',
    left: '1rem',
    zIndex: 1001,
    backgroundColor: '#2d3748',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.75rem',
    cursor: 'pointer',
    fontSize: '1.2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
};

const hamburgerIconStyle = {
    display: 'block',
    fontSize: '1.2rem'
};

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999
};

const mobileNavStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '280px',
    height: '100vh',
    backgroundColor: '#1a202c',
    color: 'white',
    zIndex: 1000,
    padding: '1rem 0',
    boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
    overflowY: 'auto'
};

const mobileNavHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1rem 1rem 1rem',
    borderBottom: '1px solid #2d3748',
    marginBottom: '1rem'
};

const closeButtonStyle = {
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0.25rem'
};

export default AdminNavigation;
