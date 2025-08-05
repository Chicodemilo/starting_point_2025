import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('username');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterBy, setFilterBy] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterAndSortUsers();
    }, [users, sortBy, sortOrder, filterBy, searchTerm]);

    const fetchUsers = async () => {
        try {
            // Mock data for demonstration - replace with actual API call
            const mockUsers = [
                { id: 1, username: 'admin', email: 'm@test.com', is_admin: true, created_at: '2024-01-15', last_login: '2025-07-21' },
                { id: 2, username: 'john_doe', email: 'john@example.com', is_admin: false, created_at: '2024-02-20', last_login: '2025-07-20' },
                { id: 3, username: 'jane_smith', email: 'jane@example.com', is_admin: false, created_at: '2024-03-10', last_login: null },
                { id: 4, username: 'bob_wilson', email: 'bob@example.com', is_admin: false, created_at: '2024-04-05', last_login: '2025-07-19' },
                { id: 5, username: 'alice_brown', email: 'alice@example.com', is_admin: false, created_at: '2024-05-12', last_login: null },
                { id: 6, username: 'charlie_davis', email: 'charlie@example.com', is_admin: true, created_at: '2024-06-01', last_login: '2025-07-18' }
            ];
            setUsers(mockUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortUsers = () => {
        let filtered = [...users];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply type filter
        switch (filterBy) {
            case 'admin':
                filtered = filtered.filter(user => user.is_admin);
                break;
            case 'regular':
                filtered = filtered.filter(user => !user.is_admin);
                break;
            case 'unauthenticated':
                filtered = filtered.filter(user => !user.last_login);
                break;
            case 'authenticated':
                filtered = filtered.filter(user => user.last_login);
                break;
            default:
                // 'all' - no additional filtering
                break;
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            // Handle null values for last_login
            if (sortBy === 'last_login') {
                if (!aValue && !bValue) return 0;
                if (!aValue) return sortOrder === 'asc' ? 1 : -1;
                if (!bValue) return sortOrder === 'asc' ? -1 : 1;
            }

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        setFilteredUsers(filtered);
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const handleDelete = async (userId, username) => {
        if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
            try {
                // await axios.delete(`/api/admin/users/${userId}`);
                setUsers(users.filter(user => user.id !== userId));
                console.log(`User ${username} deleted`);
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error deleting user. Please try again.');
            }
        }
    };

    const getSortIcon = (column) => {
        if (sortBy !== column) return '↕️';
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    if (loading) {
        return <div style={loadingStyle}>Loading users...</div>;
    }

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>👥 Users Management</h2>

            <div style={controlsStyle}>
                <div style={searchStyle}>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchInputStyle}
                    />
                </div>

                <div style={filtersStyle}>
                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="all">All Users</option>
                        <option value="admin">Admin Users</option>
                        <option value="regular">Regular Users</option>
                        <option value="authenticated">Authenticated</option>
                        <option value="unauthenticated">Unauthenticated</option>
                    </select>
                </div>
            </div>

            <div style={statsStyle}>
                <span>Showing {filteredUsers.length} of {users.length} users</span>
            </div>

            <div style={tableContainerStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={headerRowStyle}>
                            <th style={headerCellStyle} onClick={() => handleSort('username')}>
                                Username {getSortIcon('username')}
                            </th>
                            <th style={headerCellStyle} onClick={() => handleSort('email')}>
                                Email {getSortIcon('email')}
                            </th>
                            <th style={headerCellStyle} onClick={() => handleSort('is_admin')}>
                                Type {getSortIcon('is_admin')}
                            </th>
                            <th style={headerCellStyle} onClick={() => handleSort('created_at')}>
                                Created {getSortIcon('created_at')}
                            </th>
                            <th style={headerCellStyle} onClick={() => handleSort('last_login')}>
                                Last Login {getSortIcon('last_login')}
                            </th>
                            <th style={headerCellStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} style={rowStyle}>
                                <td style={cellStyle}>
                                    <strong>{user.username}</strong>
                                </td>
                                <td style={cellStyle}>{user.email}</td>
                                <td style={cellStyle}>
                                    <span style={{
                                        ...badgeStyle,
                                        ...(user.is_admin ? adminBadgeStyle : userBadgeStyle)
                                    }}>
                                        {user.is_admin ? '🛡️ Admin' : '👤 User'}
                                    </span>
                                </td>
                                <td style={cellStyle}>{user.created_at}</td>
                                <td style={cellStyle}>
                                    {user.last_login ? (
                                        <span style={authenticatedStyle}>{user.last_login}</span>
                                    ) : (
                                        <span style={unauthenticatedStyle}>Never</span>
                                    )}
                                </td>
                                <td style={cellStyle}>
                                    <button
                                        onClick={() => handleDelete(user.id, user.username)}
                                        style={deleteButtonStyle}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#c53030'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#e53e3e'}
                                    >
                                        🗑️ Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div style={noResultsStyle}>
                    No users found matching your criteria.
                </div>
            )}
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

const controlsStyle = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap'
};

const searchStyle = {
    flex: 1,
    minWidth: '300px'
};

const searchInputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '1rem'
};

const filtersStyle = {
    display: 'flex',
    gap: '0.5rem'
};

const selectStyle = {
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '1rem',
    backgroundColor: 'white'
};

const statsStyle = {
    marginBottom: '1rem',
    color: '#718096',
    fontSize: '0.9rem'
};

const tableContainerStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
};

const headerRowStyle = {
    backgroundColor: '#f7fafc'
};

const headerCellStyle = {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#2d3748',
    cursor: 'pointer',
    borderBottom: '2px solid #e2e8f0',
    userSelect: 'none'
};

const rowStyle = {
    borderBottom: '1px solid #e2e8f0'
};

const cellStyle = {
    padding: '1rem',
    color: '#2d3748'
};

const badgeStyle = {
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
};

const adminBadgeStyle = {
    backgroundColor: '#fed7d7',
    color: '#c53030'
};

const userBadgeStyle = {
    backgroundColor: '#c6f6d5',
    color: '#2f855a'
};

const authenticatedStyle = {
    color: '#2f855a',
    fontWeight: 'bold'
};

const unauthenticatedStyle = {
    color: '#e53e3e',
    fontWeight: 'bold'
};

const deleteButtonStyle = {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
};

const noResultsStyle = {
    textAlign: 'center',
    padding: '2rem',
    color: '#718096',
    fontSize: '1.1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    marginTop: '1rem'
};

export default UsersList;
