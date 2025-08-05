/**
 * AdminConnector - Frontend to Backend API Connection Class
 * 
 * This class handles all API communications between the frontend admin panel
 * and the backend API endpoints. It provides a centralized way to manage
 * admin-related API calls with proper error handling and authentication.
 * 
 * HELPER FUNCTIONS (used by multiple endpoints):
 * - makeRequest: Core HTTP request handler with auth and error handling
 * - handleApiError: Standardized error processing
 * - getAuthHeaders: Authentication header management
 */

import axios from 'axios';
import { AdminStorage } from '../utils/localStorage';
import errorHandler from './ErrorHandler';

class AdminConnector {
    /**
     * Constructor - Initialize shared values and configuration
     */
    constructor() {
        this.baseURL = '/api/admin';
        this.timeout = 10000; // 10 second timeout
        this.retryAttempts = 3;
        
        // Create axios instance with default config
        this.apiClient = axios.create({
            baseURL: this.baseURL,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Add request interceptor for authentication
        this.apiClient.interceptors.request.use(
            (config) => {
                const authHeaders = this.getAuthHeaders();
                config.headers = { ...config.headers, ...authHeaders };
                return config;
            },
            (error) => Promise.reject(error)
        );
        
        // Add response interceptor for error handling
        this.apiClient.interceptors.response.use(
            (response) => response,
            (error) => {
                const context = {
                    method: error.config?.method?.toUpperCase(),
                    url: error.config?.url,
                    baseURL: error.config?.baseURL
                };
                return Promise.reject(this.handleApiError(error, context));
            }
        );
    }
    
    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    
    /**
     * Get authentication headers from localStorage
     * Used by: All authenticated endpoints
     */
    getAuthHeaders() {
        const authToken = AdminStorage.getAuthToken();
        const adminData = AdminStorage.getAdminData();
        
        const headers = {};
        
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        if (adminData?.id) {
            headers['X-Admin-ID'] = adminData.id;
        }
        
        return headers;
    }
    
    /**
     * Standardized API error handler using ErrorHandler class
     * Used by: All API methods
     */
    handleApiError(error, context = {}) {
        const processedError = errorHandler.processError(error, {
            ...context,
            connector: 'AdminConnector'
        });
        
        // Log the error with source identifier
        errorHandler.logError(processedError, 'admin_connector');
        
        // Return a standard Error object with the user message
        const errorObj = new Error(processedError.userMessage);
        errorObj.processedError = processedError;
        errorObj.isRetryable = processedError.isRetryable;
        
        return errorObj;
    }
    
    /**
     * Core HTTP request method with retry logic
     * Used by: All endpoint methods
     */
    async makeRequest(method, endpoint, data = null, options = {}) {
        const config = {
            method,
            url: endpoint,
            ...options
        };
        
        if (data) {
            if (method.toLowerCase() === 'get') {
                config.params = data;
            } else {
                config.data = data;
            }
        }
        
        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await this.apiClient(config);
                return response.data;
            } catch (error) {
                lastError = error;
                
                // Check if error is retryable using ErrorHandler
                const isRetryable = error.isRetryable || 
                    errorHandler.isRetryable({ 
                        statusCode: error.response?.status,
                        isRetryable: error.isRetryable 
                    });
                
                // Don't retry non-retryable errors
                if (!isRetryable) {
                    throw error;
                }
                
                // Wait before retry using ErrorHandler's delay calculation
                if (attempt < this.retryAttempts) {
                    const delay = errorHandler.getRetryDelay(attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw lastError;
    }
    
    // ========================================
    // USER MANAGEMENT ENDPOINTS
    // ========================================
    
    /**
     * Get all users with optional filtering and pagination
     * @param {Object} params - Query parameters
     * @param {string} params.search - Search term for username/email
     * @param {string} params.filter - Filter type (all, admin, regular, authenticated, unauthenticated)
     * @param {string} params.sortBy - Sort field (username, email, created_at, last_login)
     * @param {string} params.sortOrder - Sort direction (asc, desc)
     * @param {number} params.page - Page number (default: 1)
     * @param {number} params.limit - Items per page (default: 50)
     * @returns {Promise<Object>} Users data with pagination info
     */
    async getAllUsers(params = {}) {
        try {
            const queryParams = {
                search: params.search || '',
                filter: params.filter || 'all',
                sortBy: params.sortBy || 'username',
                sortOrder: params.sortOrder || 'asc',
                page: params.page || 1,
                limit: params.limit || 50
            };
            
            const response = await this.makeRequest('GET', '/users', queryParams);
            
            return {
                success: true,
                data: response.users || response.data || response,
                pagination: response.pagination || null,
                total: response.total || (response.users ? response.users.length : 0)
            };
        } catch (error) {
            const processedError = errorHandler.processError(error, {
                method: 'getAllUsers',
                endpoint: '/users'
            });
            
            return {
                ...errorHandler.createApiResponse(processedError),
                data: [],
                total: 0
            };
        }
    }
    
    /**
     * Get a specific user by ID
     * @param {number} userId - User ID
     * @returns {Promise<Object>} User data
     */
    async getUserById(userId) {
        try {
            const response = await this.makeRequest('GET', `/users/${userId}`);
            
            return {
                success: true,
                data: response.user || response.data || response
            };
        } catch (error) {
            console.error(`Failed to fetch user ${userId}:`, error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }
    
    /**
     * Delete a user by ID
     * @param {number} userId - User ID to delete
     * @returns {Promise<Object>} Deletion result
     */
    async deleteUser(userId) {
        try {
            const response = await this.makeRequest('DELETE', `/users/${userId}`);
            
            return {
                success: true,
                message: response.message || 'User deleted successfully'
            };
        } catch (error) {
            const processedError = errorHandler.processError(error, {
                method: 'deleteUser',
                endpoint: `/users/${userId}`,
                userId
            });
            
            return errorHandler.createApiResponse(processedError);
        }
    }
    
    /**
     * Update user information
     * @param {number} userId - User ID to update
     * @param {Object} userData - Updated user data
     * @returns {Promise<Object>} Update result
     */
    async updateUser(userId, userData) {
        try {
            const response = await this.makeRequest('PUT', `/users/${userId}`, userData);
            
            return {
                success: true,
                data: response.user || response.data || response,
                message: response.message || 'User updated successfully'
            };
        } catch (error) {
            console.error(`Failed to update user ${userId}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // ========================================
    // ADMIN STATISTICS ENDPOINTS
    // ========================================
    
    /**
     * Get admin dashboard statistics
     * @returns {Promise<Object>} Dashboard stats
     */
    async getDashboardStats() {
        try {
            const response = await this.makeRequest('GET', '/stats');
            
            return {
                success: true,
                data: response.stats || response.data || response
            };
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            return {
                success: false,
                error: error.message,
                data: {
                    totalUsers: 0,
                    adminUsers: 0,
                    regularUsers: 0,
                    recentActivity: 0
                }
            };
        }
    }
    
    /**
     * Get system health information
     * @returns {Promise<Object>} System health data
     */
    async getSystemHealth() {
        try {
            const response = await this.makeRequest('GET', '/health');
            
            return {
                success: true,
                data: response.health || response.data || response
            };
        } catch (error) {
            console.error('Failed to fetch system health:', error);
            return {
                success: false,
                error: error.message,
                data: {
                    database: 'unknown',
                    api: 'unknown',
                    frontend: 'unknown'
                }
            };
        }
    }
    
    // ========================================
    // AUTHENTICATION ENDPOINTS
    // ========================================
    
    /**
     * Admin login
     * @param {string} email - Admin email
     * @param {string} password - Admin password
     * @returns {Promise<Object>} Login result
     */
    async login(email, password) {
        try {
            const response = await this.makeRequest('POST', '/login', {
                email,
                password
            });
            
            return {
                success: true,
                data: response.user || response.data || response,
                token: response.token || null,
                message: response.message || 'Login successful'
            };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Verify current admin session
     * @returns {Promise<Object>} Session verification result
     */
    async verifySession() {
        try {
            const response = await this.makeRequest('GET', '/verify');
            
            return {
                success: true,
                data: response.user || response.data || response,
                message: 'Session valid'
            };
        } catch (error) {
            console.error('Session verification failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export singleton instance
const adminConnector = new AdminConnector();
export default adminConnector;