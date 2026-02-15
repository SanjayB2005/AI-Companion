// Test connection from mobile app perspective
const axios = require('axios');
const { Platform } = require('react-native');

// Simulate the platform detection
const HOST_IP = '10.21.71.81';
const BASE_URL = `http://${HOST_IP}:8000/api`;

async function testConnection() {
    console.log('🧪 Testing Mobile App Connection...');
    console.log('📱 Base URL:', BASE_URL);
    
    try {
        // Test 1: Basic connectivity
        console.log('\n1️⃣ Testing basic connectivity...');
        const response = await axios.get(`${BASE_URL}/auth/profile/`, {
            timeout: 5000,
            validateStatus: (status) => status < 500 // Accept 4xx responses as successful connection
        });
        
        if (response.status === 401) {
            console.log('✅ Connection successful! (401 = Authentication required - expected)');
            console.log('🎉 Mobile app can now connect to backend!');
        } else {
            console.log(`✅ Connection successful! Status: ${response.status}`);
        }
        
        // Test 2: Test login endpoint
        console.log('\n2️⃣ Testing login endpoint...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login/`, {
            email: 'test@example.com',
            password: 'testpassword'
        }, { 
            timeout: 5000,
            validateStatus: (status) => status < 500 
        });
        
        console.log(`✅ Login endpoint accessible! Status: ${loginResponse.status}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Backend is not accessible. Check if Django server is running on 0.0.0.0:8000');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('💡 Connection timeout. Check IP address and firewall settings.');  
        }
        return false;
    }
}

testConnection().then(success => {
    if (success) {
        console.log('\n🎊 SUCCESS: Mobile app can connect to backend!');
        console.log('💡 You can now test your React Native app - the network errors should be resolved.');
    } else {
        console.log('\n🚨 FAILED: Connection issues still exist.');
    }
});