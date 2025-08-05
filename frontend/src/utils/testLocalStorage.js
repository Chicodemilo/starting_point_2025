/**
 * Test file to demonstrate localStorage functionality
 * This can be run in the browser console to test our localStorage utility
 */

import { AdminStorage, ADMIN_STORAGE_KEYS } from './localStorage.js';

// Test data that matches the API response format
const testAdminData = {
    id: 1,
    username: "m",
    email: "m@test.com",
    is_admin: true,
    created_at: "2025-07-21T19:22:22"
};

const testAuthToken = "fake-jwt-token-12345";

// Test functions
export const testLocalStorageFunctions = {
    
    // Test saving admin data
    testSaveAdminData() {
        console.log('🧪 Testing AdminStorage.saveAdminLogin()...');
        AdminStorage.saveAdminLogin(testAdminData);
        AdminStorage.saveAuthToken(testAuthToken);
        
        console.log('✅ Admin data saved to localStorage');
        console.log('📦 Saved data:', testAdminData);
        console.log('🔑 Saved token:', testAuthToken);
    },
    
    // Test getting admin data
    testGetAdminData() {
        console.log('🧪 Testing AdminStorage.getAdminData()...');
        const retrievedData = AdminStorage.getAdminData();
        const retrievedToken = AdminStorage.getAuthToken();
        
        console.log('✅ Retrieved admin data:', retrievedData);
        console.log('🔑 Retrieved token:', retrievedToken);
        
        return { data: retrievedData, token: retrievedToken };
    },
    
    // Test login status check
    testLoginStatus() {
        console.log('🧪 Testing AdminStorage.isAdminLoggedIn()...');
        const isLoggedIn = AdminStorage.isAdminLoggedIn();
        
        console.log('✅ Is admin logged in?', isLoggedIn);
        return isLoggedIn;
    },
    
    // Test clearing admin data
    testClearAdminData() {
        console.log('🧪 Testing AdminStorage.clearAdminData()...');
        AdminStorage.clearAdminData();
        
        const dataAfterClear = AdminStorage.getAdminData();
        const isLoggedInAfterClear = AdminStorage.isAdminLoggedIn();
        
        console.log('✅ Data after clear:', dataAfterClear);
        console.log('✅ Is logged in after clear?', isLoggedInAfterClear);
    },
    
    // Run all tests in sequence
    runAllTests() {
        console.log('🚀 Starting localStorage tests...\n');
        
        // Test 1: Save data
        this.testSaveAdminData();
        console.log('\n');
        
        // Test 2: Get data
        const retrieved = this.testGetAdminData();
        console.log('\n');
        
        // Test 3: Check login status
        this.testLoginStatus();
        console.log('\n');
        
        // Test 4: Clear data
        this.testClearAdminData();
        console.log('\n');
        
        console.log('🎉 All localStorage tests completed!');
        
        return {
            testData: testAdminData,
            retrievedData: retrieved,
            message: 'Tests completed successfully'
        };
    },
    
    // Inspect current localStorage state
    inspectLocalStorage() {
        console.log('🔍 Current localStorage state:');
        
        Object.values(ADMIN_STORAGE_KEYS).forEach(key => {
            const value = localStorage.getItem(key);
            console.log(`  ${key}:`, value);
        });
        
        console.log('\n📊 localStorage usage:');
        console.log('  Total keys:', Object.keys(localStorage).length);
        console.log('  Admin keys:', Object.values(ADMIN_STORAGE_KEYS).filter(key => 
            localStorage.getItem(key) !== null
        ).length);
    }
};

// Export for console testing
window.testLocalStorage = testLocalStorageFunctions;

console.log('📝 localStorage test functions loaded!');
console.log('💡 Run window.testLocalStorage.runAllTests() in console to test');
console.log('💡 Run window.testLocalStorage.inspectLocalStorage() to inspect current state');
