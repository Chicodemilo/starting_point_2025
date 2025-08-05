/**
 * MainConnector - Frontend to Backend API Connection Class for General Components
 * 
 * This class handles API communications for public-facing frontend components
 * that don't require admin privileges. It provides a centralized way to manage
 * general API calls with proper error handling and user session management.
 * 
 * HELPER FUNCTIONS (used by multiple endpoints):
 * - makeRequest: Core HTTP request handler with error handling
 * - handleApiError: Standardized error processing using ErrorHandler
 * - getUserHeaders: User session header management
 */

import axios from 'axios';
import LocalStorageUtil from '../utils/localStorage';
import errorHandler from './ErrorHandler';

class MainConnector {
    /**
     * Constructor - Initialize shared values and configuration
     */
    constructor() {
        this.baseURL = '/api';
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
        
        // Add request interceptor for user session
        this.apiClient.interceptors.request.use(
            (config) => {
                const userHeaders = this.getUserHeaders();
                config.headers = { ...config.headers, ...userHeaders };
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
     * Get user session headers from localStorage
     * Used by: Authenticated endpoints
     */
    getUserHeaders() {
        const headers = {};
        
        // Add user session token if available
        const userToken = LocalStorageUtil.get('user_token');
        if (userToken) {
            headers['Authorization'] = `Bearer ${userToken}`;
        }
        
        // Add user ID if available
        const userId = LocalStorageUtil.get('user_id');
        if (userId) {
            headers['X-User-ID'] = userId;
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
            connector: 'MainConnector'
        });
        
        // Log the error with source identifier
        errorHandler.logError(processedError, 'main_connector');
        
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
    // PUBLIC CONTENT ENDPOINTS
    // ========================================
    
    /**
     * Get public content/posts with pagination
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number (default: 1)
     * @param {number} params.limit - Items per page (default: 20)
     * @param {string} params.category - Filter by category
     * @param {string} params.search - Search term
     * @returns {Promise<Object>} Content data with pagination
     */
    async getContent(params = {}) {
        try {
            const queryParams = {
                page: params.page || 1,
                limit: params.limit || 20,
                category: params.category || '',
                search: params.search || ''
            };
            
            const response = await this.makeRequest('GET', '/content', queryParams);
            
            return {
                success: true,
                data: response.content || response.data || response,
                pagination: response.pagination || null,
                total: response.total || 0
            };
        } catch (error) {
            const processedError = errorHandler.processError(error, {
                method: 'getContent',
                endpoint: '/content'
            });
            
            return {
                ...errorHandler.createApiResponse(processedError),
                data: [],
                total: 0
            };
        }
    }
    
    /**
     * Get a specific content item by ID
     * @param {number} contentId - Content ID
     * @returns {Promise<Object>} Content data
     */
    async getContentById(contentId) {
        try {
            const response = await this.makeRequest('GET', `/content/${contentId}`);
            
            return {
                success: true,
                data: response.content || response.data || response
            };
        } catch (error) {
            const processedError = errorHandler.processError(error, {
                method: 'getContentById',
                endpoint: `/content/${contentId}`,
                contentId
            });
            
            return errorHandler.createApiResponse(processedError);
        }
    }
    
    /**
     * Get available categories
     * @returns {Promise<Object>} Categories data
     */
    async getCategories() {
        try {
            const response = await this.makeRequest('GET', '/categories');
            
            return {
                success: true,
                data: response.categories || response.data || response
            };
        } catch (error) {
            const processedError = errorHandler.processError(error, {
                method: 'getCategories',
                endpoint: '/categories'
            });
            
            return {
                ...errorHandler.createApiResponse(processedError),
                data: []
            };
        }
    }
    
    // ========================================
    // USER AUTHENTICATION ENDPOINTS
    // ========================================
    
    /**
     * User registration
     * @param {Object} userData - User registration data
     * @param {string} userData.username - Username
     * @param {string} userData.email - Email address
     * @param {string} userData.password - Password
     * @returns {Promise<Object>} Registration result
     */
    async registerUser(userData) {
        try {
            const response = await this.makeRequest('POST', '/auth/register', userData);
            
            return {
                success: true,
                data: response.user || response.data || response,
                token: response.token || null,
                message: response.message || 'Registration successful'
            };
        } catch (error) {
            const processedError = errorHandler.processError(error, {
                method: 'registerUser',
                endpoint: '/auth/register'
            });
            
            return errorHandler.createApiResponse(processedError);
        }
    }
    
    /**
     * User login
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Login result
     */
    async loginUser(email, password) {
        try {
            const response = await this.makeRequest('POST', '/auth/login', {
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
            const processedError = errorHandler.processError(error, {
                method: 'loginUser',
                endpoint: '/auth/login'
            });
            
            return errorHandler.createApiResponse(processedError);
        }
    }
    
    /**
     * User logout
     * @returns {Promise<Object>} Logout result
     */
    async logoutUser() {
        try {
            const response = await this.makeRequest('POST', '/auth/logout');
            
            // Clear user session from localStorage
            LocalStorageUtil.remove('user_token');
            LocalStorageUtil.remove('user_id');
            LocalStorageUtil.remove('user_email');
            LocalStorageUtil.remove('username');
            
            return {
                success: true,
                message: response.message || 'Logout successful'
            };
        } catch (error) {
            // Even if logout fails on server, clear local session
            LocalStorageUtil.remove('user_token');
            LocalStorageUtil.remove('user_id');
            LocalStorageUtil.remove('user_email');
            LocalStorageUtil.remove('username');
            
            const processedError = errorHandler.processError(error, {
                method: 'logoutUser',
                endpoint: '/auth/logout'
            });
            
            return errorHandler.createApiResponse(processedError);
        }
    }
    
    /**
     * Verify user session
     * @returns {Promise<Object>} Session verification result
     */
    async verifyUserSession() {
        try {
            const response = await this.makeRequest('GET', '/auth/verify');
            
            return {
                success: true,
                data: response.user || response.data || response,
                message: 'Session valid'
            };
        } catch (error) {
            const processedError = errorHandler.processError(error, {
                method: 'verifyUserSession',
                endpoint: '/auth/verify'
            });
            
            return errorHandler.createApiResponse(processedError);
        }
    }
    
    // ========================================
    // USER INTERACTION ENDPOINTS
    // ========================================
    
    /**
     * Submit user feedback/contact form
     * @param {Object} feedbackData - Feedback data
     * @param {string} feedbackData.name - User name
     * @param {string} feedbackData.email - User email
     * @param {string} feedbackData.subject - Subject
     * @param {string} feedbackData.message - Message content
     * @returns {Promise<Object>} Submission result
     */
    async submitFeedback(feedbackData) {
        try {
            const response = await this.makeRequest('POST', '/feedback', feedbackData);
            
            return {
                success: true,
                message: response.message || 'Feedback submitted successfully'
            };
        } catch (error) {
            const processedError = errorHandler.processError(error, {
                method: 'submitFeedback',
                endpoint: '/feedback'
            });
            
            return errorHandler.createApiResponse(processedError);
        }
    }
    
    /**
     * Subscribe to newsletter
     * @param {string} email - Email address
     * @returns {Promise<Object>} Subscription result
     */
    async subscribeNewsletter(email) {
        try {
            const response = await this.makeRequest('POST', '/newsletter/subscribe', {
                email
            });
            
            return {
                success: true,
                message: response.message || 'Successfully subscribed to newsletter'
            };
        } catch (error) {
            const processedError = errorHandler.processError(error, {
                method: 'subscribeNewsletter',
                endpoint: '/newsletter/subscribe'
            });
            
            return errorHandler.createApiResponse(processedError);
        }
    }
    
    // ========================================
    // SYSTEM STATUS ENDPOINTS
    // ========================================
    
    /**
     * Get system health status (public endpoint)
     * @returns {Promise<Object>} System health data
     */
    async getSystemStatus() {
        try {
            const response = await this.makeRequest('GET', '/status');
            
            return {
                success: true,
                data: response.status || response.data || response
            };
        } catch (error) {
            const processedError = errorHandler.processError(error, {
                method: 'getSystemStatus',
                endpoint: '/status'
            });
            
            return {
                ...errorHandler.createApiResponse(processedError),
                data: {
                    status: 'unknown',
                    services: []
                }
            };
        }
    }
    
    /**
     * Get application version info
     * @returns {Promise<Object>} Version information
     */
    async getVersionInfo() {
        try {
            const response = await this.makeRequest('GET', '/version');
            
            return {
                success: true,
                data: response.version || response.data || response
            };
        } catch (error) {
            const processedError = errorHandler.processError(error, {
                method: 'getVersionInfo',
                endpoint: '/version'
            });
            
            return {
                ...errorHandler.createApiResponse(processedError),
                data: {
                    version: 'unknown',
                    build: 'unknown'
                }
            };
        }
    }
}

// Export singleton instance
const mainConnector = new MainConnector();
export default mainConnector;