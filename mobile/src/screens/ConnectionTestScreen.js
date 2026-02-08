import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import axios from 'axios';

const ConnectionTestScreen = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (test, status, message) => {
    setResults(prev => [...prev, { test, status, message, time: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setResults([]);
    setTesting(true);

    // Test 1: Basic connectivity
    addResult('Backend Connection', 'testing', 'Checking if backend is reachable...');
    try {
      const response = await axios.get('http://10.0.2.2:8000/admin/', { timeout: 10000 });
      addResult('Backend Connection', 'success', `✅ Backend is running! Status: ${response.status}`);
    } catch (error) {
      addResult('Backend Connection', 'error', `❌ Cannot reach backend: ${error.message}`);
      setTesting(false);
      return;
    }

    // Test 2: API endpoint
    addResult('API Endpoint', 'testing', 'Testing API endpoint...');
    try {
      const response = await axios.get('http://10.0.2.2:8000/api/auth/users/', { timeout: 10000 });
      addResult('API Endpoint', 'success', `✅ API working! Found ${response.data.length} users`);
    } catch (error) {
      addResult('API Endpoint', 'error', `❌ API error: ${error.message}`);
    }

    // Test 3: Registration format
    addResult('Registration Test', 'testing', 'Testing registration endpoint...');
    try {
      const testUser = {
        email: `test${Date.now()}@example.com`,
        username: `test${Date.now()}`,
        password: 'TestPass123!',
        password_confirm: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User'
      };
      
      const response = await axios.post('http://10.0.2.2:8000/api/auth/register/', testUser, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      if (response.status === 201) {
        addResult('Registration Test', 'success', `✅ Registration works! User created: ${response.data.user.username}`);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.email) {
        addResult('Registration Test', 'success', '✅ Registration endpoint works (test user exists)');
      } else {
        addResult('Registration Test', 'error', `❌ Registration error: ${error.message}`);
      }
    }

    setTesting(false);
    addResult('Complete', 'success', '🎉 All tests completed!');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>🔧 Connection Test</Text>
        <Text style={styles.subtitle}>Test backend connectivity from your mobile app</Text>

        <TouchableOpacity
          style={[styles.button, testing && styles.buttonDisabled]}
          onPress={runTests}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? '⏳ Testing...' : '▶️ Run Tests'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resultsContainer}>
          {results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTest}>{result.test}</Text>
                <Text style={styles.resultTime}>{result.time}</Text>
              </View>
              <Text style={[
                styles.resultMessage,
                result.status === 'success' && styles.successText,
                result.status === 'error' && styles.errorText,
                result.status === 'testing' && styles.testingText
              ]}>
                {result.message}
              </Text>
            </View>
          ))}
        </View>

        {results.length === 0 && !testing && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>👆 Click "Run Tests" to check your connection</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    padding: SIZES.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xl,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.xl,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: SIZES.md,
  },
  resultItem: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.radiusSm,
    marginBottom: SIZES.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  resultTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  resultMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  successText: {
    color: '#28a745',
  },
  errorText: {
    color: '#dc3545',
  },
  testingText: {
    color: '#ffc107',
  },
  emptyState: {
    padding: SIZES.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default ConnectionTestScreen;
