import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const [userToken, hasSeenWelcome] = await Promise.all([
        AsyncStorage.getItem('access_token'),
        AsyncStorage.getItem('hasSeenWelcome')
      ]);

      setTimeout(() => {
        if (userToken) {
          // User is logged in, go directly to Home
          navigation.replace('Home');
        } else if (hasSeenWelcome) {
          // User has seen welcome before, go to Login
          navigation.replace('Login');
        } else {
          // New user, show Welcome screen
          navigation.replace('Welcome');
        }
      }, 2000);
    } catch (error) {
      console.error('Error checking user status:', error);
      // Default to welcome screen on error
      setTimeout(() => navigation.replace('Welcome'), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🤗</Text>
        <Text style={styles.title}>Emotion Companion</Text>
        <Text style={styles.subtitle}>Your AI-powered emotional wellness assistant</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default SplashScreen;
