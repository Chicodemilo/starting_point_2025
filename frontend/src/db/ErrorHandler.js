/**
 * ErrorHandler - Centralized Error Management Class
 * 
 * This class provides standardized error handling for all API communications
 * and frontend operations. It includes error categorization, user-friendly
 * message generation, logging, and session management for authentication errors.
 * 
 * Features:
 * - HTTP status code handling
 * - Network error management
 * - Authentication error handling with session cleanup
 * - User-friendly error messages
 * - Error logging and categorization (console + file)
 * - File logging to /logs/error_log.txt with timestamp formatting
 * - Retry logic recommendations
 */

import { AdminStorage } from '../utils/localStorage';
import axios from 'axios';

class ErrorHandler {
    constructor() {
        this.errorCategories = {
            NETWORK: 'network',
            AUTHENTICATION: 'authentication',
            AUTHORIZATION: 'authorization',
            VALIDATION: 'validation',
            SERVER: 'server',
            CLIENT: 'client',
            UNKNOWN: 'unknown'
        };
        
        this.retryableErrors = [408, 429, 500, 502, 503, 504];
        
        // File logging configuration
        this.logFilePath = '/logs/error_log.txt';
        this.enableFileLogging = true;
        
        // Create logs directory if it doesn't exist
        this.initializeLogging();
    }
    
    /**
     * Initialize logging system and ensure logs directory exists
     */
    async initializeLogging() {
        if (!this.enableFileLogging) return;
        
        try {
            // In a browser environment, we'll use an API endpoint to write logs
            // This is a placeholder - actual implementation depends on backend setup
            console.log('ErrorHandler file logging initialized');
        } catch (error) {
            console.warn('Failed to initialize file logging:', error);
            this.enableFileLogging = false;
        }
    }
    
    /**
     * Main error processing method
     * @param {Error|Object} error - The error object from axios or other sources
     * @param {Object} context - Additional context (method, endpoint, etc.)
     * @returns {Object} Processed error with category, message, and metadata
     */
    processError(error, context = {}) {
        console.error('ErrorHandler processing error:', error, 'Context:', context);
        
        const processedError = {
            originalError: error,
            category: this.errorCategories.UNKNOWN,
            message: 'An unexpected error occurred.',
            userMessage: 'Something went wrong. Please try again.',
            isRetryable: false,
            shouldClearSession: false,
            statusCode: null,
            context: context,
            timestamp: new Date().toISOString()
        };
        
        if (error?.response) {
            // HTTP response error
            return this.handleHttpError(error, processedError);
        } else if (error?.request) {
            // Network error
            return this.handleNetworkError(error, processedError);
        } else if (error?.message) {
            // JavaScript error or custom error
            return this.handleJavaScriptError(error, processedError);
        } else {
            // Unknown error format
            return this.handleUnknownError(error, processedError);
        }
    }
    
    /**
     * Handle HTTP response errors (4xx, 5xx)
     */
    handleHttpError(error, processedError) {
        const { status, data } = error.response;
        processedError.statusCode = status;
        
        switch (status) {
            case 400:
                processedError.category = this.errorCategories.VALIDATION;
                processedError.message = data?.message || 'Invalid request data.';
                processedError.userMessage = 'Please check your input and try again.';
                break;
                
            case 401:
                processedError.category = this.errorCategories.AUTHENTICATION;
                processedError.message = data?.message || 'Authentication failed.';
                processedError.userMessage = 'Your session has expired. Please login again.';
                processedError.shouldClearSession = true;
                this.clearUserSession();
                break;
                
            case 403:
                processedError.category = this.errorCategories.AUTHORIZATION;
                processedError.message = data?.message || 'Access denied.';
                processedError.userMessage = 'You don\'t have permission to perform this action.';
                break;
                
            case 404:
                processedError.category = this.errorCategories.CLIENT;
                processedError.message = data?.message || 'Resource not found.';
                processedError.userMessage = 'The requested resource was not found.';
                break;
                
            case 408:
                processedError.category = this.errorCategories.NETWORK;
                processedError.message = 'Request timeout.';
                processedError.userMessage = 'The request took too long. Please try again.';
                processedError.isRetryable = true;
                break;
                
            case 409:
                processedError.category = this.errorCategories.VALIDATION;
                processedError.message = data?.message || 'Conflict with existing data.';
                processedError.userMessage = 'This action conflicts with existing data.';
                break;
                
            case 422:
                processedError.category = this.errorCategories.VALIDATION;
                processedError.message = data?.message || 'Validation failed.';
                processedError.userMessage = 'Please check your input data.';
                break;
                
            case 429:
                processedError.category = this.errorCategories.CLIENT;
                processedError.message = 'Too many requests.';
                processedError.userMessage = 'Too many requests. Please wait a moment and try again.';
                processedError.isRetryable = true;
                break;
                
            case 500:
                processedError.category = this.errorCategories.SERVER;
                processedError.message = data?.message || 'Internal server error.';
                processedError.userMessage = 'Server error. Please try again later.';
                processedError.isRetryable = true;
                break;
                
            case 502:
                processedError.category = this.errorCategories.SERVER;
                processedError.message = 'Bad gateway.';
                processedError.userMessage = 'Service temporarily unavailable. Please try again.';
                processedError.isRetryable = true;
                break;
                
            case 503:
                processedError.category = this.errorCategories.SERVER;
                processedError.message = 'Service unavailable.';
                processedError.userMessage = 'Service is temporarily down. Please try again later.';
                processedError.isRetryable = true;
                break;
                
            case 504:
                processedError.category = this.errorCategories.SERVER;
                processedError.message = 'Gateway timeout.';
                processedError.userMessage = 'Request timed out. Please try again.';
                processedError.isRetryable = true;
                break;
                
            default:
                if (status >= 400 && status < 500) {
                    processedError.category = this.errorCategories.CLIENT;
                    processedError.message = data?.message || `Client error (${status}).`;
                    processedError.userMessage = 'There was a problem with your request.';
                } else if (status >= 500) {
                    processedError.category = this.errorCategories.SERVER;
                    processedError.message = data?.message || `Server error (${status}).`;
                    processedError.userMessage = 'Server error. Please try again later.';
                    processedError.isRetryable = true;
                }
                break;
        }
        
        return processedError;
    }
    
    /**
     * Handle network errors (no response received)
     */
    handleNetworkError(error, processedError) {
        processedError.category = this.errorCategories.NETWORK;
        processedError.isRetryable = true;
        
        if (error.code === 'ECONNABORTED') {
            processedError.message = 'Request timeout.';
            processedError.userMessage = 'Connection timed out. Please check your internet connection.';
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            processedError.message = 'Cannot connect to server.';
            processedError.userMessage = 'Unable to connect to the server. Please try again.';
        } else {
            processedError.message = 'Network error occurred.';
            processedError.userMessage = 'Network error. Please check your connection and try again.';
        }
        
        return processedError;
    }
    
    /**
     * Handle JavaScript errors or custom errors
     */
    handleJavaScriptError(error, processedError) {
        processedError.message = error.message;
        
        // Check for common error patterns
        if (error.message.includes('fetch')) {
            processedError.category = this.errorCategories.NETWORK;
            processedError.userMessage = 'Network error. Please try again.';
            processedError.isRetryable = true;
        } else if (error.message.includes('JSON')) {
            processedError.category = this.errorCategories.CLIENT;
            processedError.userMessage = 'Data format error. Please refresh and try again.';
        } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
            processedError.category = this.errorCategories.AUTHENTICATION;
            processedError.userMessage = 'Authentication error. Please login again.';
            processedError.shouldClearSession = true;
            this.clearUserSession();
        } else {
            processedError.category = this.errorCategories.UNKNOWN;
            processedError.userMessage = 'An unexpected error occurred. Please try again.';
        }
        
        return processedError;
    }
    
    /**
     * Handle unknown error formats
     */
    handleUnknownError(error, processedError) {
        processedError.message = typeof error === 'string' ? error : 'Unknown error occurred.';
        processedError.userMessage = 'Something unexpected happened. Please try again.';
        return processedError;
    }
    
    /**
     * Clear user session on authentication errors
     */
    clearUserSession() {
        try {
            AdminStorage.clearAdminData();
            console.log('User session cleared due to authentication error');
        } catch (error) {
            console.error('Failed to clear user session:', error);
        }
    }
    
    /**
     * Check if an error is retryable
     * @param {Object} processedError - The processed error object
     * @returns {boolean} Whether the error should be retried
     */
    isRetryable(processedError) {
        return processedError.isRetryable || 
               this.retryableErrors.includes(processedError.statusCode);
    }
    
    /**
     * Get retry delay based on attempt number
     * @param {number} attempt - Current attempt number (1-based)
     * @returns {number} Delay in milliseconds
     */
    getRetryDelay(attempt) {
        // Exponential backoff: 1s, 2s, 4s, 8s...
        return Math.min(Math.pow(2, attempt) * 1000, 30000); // Max 30 seconds
    }
    
    /**
     * Create a user-friendly error message for UI display
     * @param {Object} processedError - The processed error object
     * @returns {string} User-friendly error message
     */
    getUserMessage(processedError) {
        return processedError.userMessage || processedError.message || 'An error occurred.';
    }
    
    /**
     * Create a detailed error message for logging
     * @param {Object} processedError - The processed error object
     * @returns {string} Detailed error message
     */
    getDetailedMessage(processedError) {
        const parts = [
            `Category: ${processedError.category}`,
            `Message: ${processedError.message}`,
            `Status: ${processedError.statusCode || 'N/A'}`,
            `Retryable: ${processedError.isRetryable}`,
            `Context: ${JSON.stringify(processedError.context)}`
        ];
        
        return parts.join(' | ');
    }
    
    /**
     * Format timestamp for file logging
     * Format: [yyyy-mm-dd hh:mm:ss:millisec]
     */
    formatTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
        
        return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}:${milliseconds}]`;
    }
    
    /**
     * Format error message for file logging
     * Format: [timestamp] [source] error_message
     */
    formatFileLogMessage(processedError, source = 'unknown') {
        const timestamp = this.formatTimestamp();
        const errorMessage = this.getDetailedMessage(processedError);
        return `${timestamp} [${source}] ${errorMessage}`;
    }
    
    /**
     * Write error to file via API endpoint
     * @param {string} logMessage - Formatted log message
     */
    async writeToFile(logMessage) {
        if (!this.enableFileLogging) return;
        
        try {
            // Make API call to backend logging endpoint
            await axios.post('/api/logs/error', {
                message: logMessage,
                timestamp: new Date().toISOString()
            }, {
                timeout: 5000 // 5 second timeout for logging
            });
        } catch (error) {
            // Don't log errors about logging to avoid infinite loops
            console.warn('Failed to write error to file:', error.message);
        }
    }
    
    /**
     * Log error to both console and file
     * @param {Object} processedError - The processed error object
     * @param {string} source - Source identifier (e.g., 'admin_connector')
     */
    async logError(processedError, source = 'unknown') {
        const logLevel = this.getLogLevel(processedError);
        const consoleMessage = this.getDetailedMessage(processedError);
        
        // Console logging with emojis
        switch (logLevel) {
            case 'error':
                console.error('🚨 ERROR:', consoleMessage);
                break;
            case 'warn':
                console.warn('⚠️ WARNING:', consoleMessage);
                break;
            case 'info':
                console.info('ℹ️ INFO:', consoleMessage);
                break;
            default:
                console.log('📝 LOG:', consoleMessage);
        }
        
        // File logging with specified format
        const fileMessage = this.formatFileLogMessage(processedError, source);
        await this.writeToFile(fileMessage);
    }
    
    /**
     * Determine appropriate log level for error
     * @param {Object} processedError - The processed error object
     * @returns {string} Log level (error, warn, info, log)
     */
    getLogLevel(processedError) {
        if (processedError.category === this.errorCategories.SERVER) {
            return 'error';
        } else if (processedError.category === this.errorCategories.AUTHENTICATION) {
            return 'warn';
        } else if (processedError.category === this.errorCategories.NETWORK) {
            return 'warn';
        } else {
            return 'info';
        }
    }
    
    /**
     * Create a standardized API response format for errors
     * @param {Object} processedError - The processed error object
     * @returns {Object} Standardized error response
     */
    createApiResponse(processedError) {
        return {
            success: false,
            error: processedError.message,
            userMessage: processedError.userMessage,
            category: processedError.category,
            isRetryable: processedError.isRetryable,
            statusCode: processedError.statusCode,
            timestamp: processedError.timestamp
        };
    }
}

// Export singleton instance
const errorHandler = new ErrorHandler();
export default errorHandler;
