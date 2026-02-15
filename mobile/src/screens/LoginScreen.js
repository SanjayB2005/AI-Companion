import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

// Design colors matching Arimo style
const LOGIN_COLORS = {
  primary: '#7ED321', // Bright green like Arimo
  background: '#FFFFFF',
  cardBackground: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  inputBackground: '#F8F9FA',
  inputBorder: '#E9ECEF',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await authAPI.login({ email, password });
      console.log('✅ Login successful, navigating to Home');
      navigation.replace('Home');
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Invalid credentials. Please check your email and password.';
      
      if (error.detail) {
        errorMessage = error.detail;
      } else if (error.error) {
        errorMessage = error.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={LOGIN_COLORS.primary} />
      
      {/* Curved Green Background */}
      <View style={styles.topSection}>
        <Svg
          height={height * 0.4}
          width={width}
          viewBox={`0 0 ${width} ${height * 0.4}`}
          style={styles.waveSvg}>
          <Path
            d={`M0,0 L${width},0 L${width},${height * 0.25} Q${width * 0.5},${height * 0.35} 0,${height * 0.25} Z`}
            fill={LOGIN_COLORS.primary}
          />
        </Svg>
        
        {/* Header Text */}
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Welcome back! 👋</Text>
          <Text style={styles.headerSubtitle}>Sign in to continue your journey</Text>
        </View>
      </View>

      {/* White Card Container */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          
          {/* Title */}
          <Text style={styles.title}>Welcome to Emotion{'\n'}Companion</Text>
          <Text style={styles.subtitle}>Login now!</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={LOGIN_COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={LOGIN_COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}>
            <Text style={styles.continueButtonText}>
              {loading ? 'Signing in...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
            <Text style={styles.socialIcon}>🌐</Text>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
            <Text style={styles.socialIcon}>🍎</Text>
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Create an account</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOGIN_COLORS.background,
  },
  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    position: 'absolute',
    top: height * 0.08,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  waveSvg: {
    position: 'absolute',
    top: 0,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
    zIndex: 2,
  },
  card: {
    backgroundColor: LOGIN_COLORS.cardBackground,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: LOGIN_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LOGIN_COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LOGIN_COLORS.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: LOGIN_COLORS.inputBackground,
    borderWidth: 1,
    borderColor: LOGIN_COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: LOGIN_COLORS.text,
  },
  continueButton: {
    backgroundColor: LOGIN_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: LOGIN_COLORS.textSecondary,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: LOGIN_COLORS.inputBorder,
  },
  dividerText: {
    color: LOGIN_COLORS.textSecondary,
    fontSize: 14,
    paddingHorizontal: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LOGIN_COLORS.inputBackground,
    borderWidth: 1,
    borderColor: LOGIN_COLORS.inputBorder,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  socialIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  socialButtonText: {
    color: LOGIN_COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    color: LOGIN_COLORS.textSecondary,
    fontSize: 14,
  },
  signupLink: {
    color: LOGIN_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
