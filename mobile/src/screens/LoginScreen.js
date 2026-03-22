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
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../services/api';
import { COLORS, SIZES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Curved Primary Background */}
      <View style={styles.topSection}>
        <Svg
          height={height * 0.4}
          width={width}
          viewBox={`0 0 ${width} ${height * 0.4}`}
          style={styles.waveSvg}>
          <Path
            d={`M0,0 L${width},0 L${width},${height * 0.25} Q${width * 0.5},${height * 0.35} 0,${height * 0.25} Z`}
            fill={COLORS.primary}
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
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={showPassword ? "eye" : "eye-off"} 
                  size={24} 
                  color={COLORS.textSecondary} 
                />
              </TouchableOpacity>
            </View>
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
    backgroundColor: COLORS.background,
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
    paddingHorizontal: SIZES.lg,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  headerSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.white,
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
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.lg,
    zIndex: 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusXl,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xl,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.xs,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
  inputContainer: {
    marginBottom: SIZES.md,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.inputRadius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    fontSize: SIZES.body,
    color: COLORS.textPrimary,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.inputRadius,
    paddingHorizontal: SIZES.md,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: SIZES.md,
    fontSize: SIZES.body,
    color: COLORS.textPrimary,
  },
  eyeIcon: {
    paddingLeft: SIZES.sm,
    paddingRight: SIZES.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.inputRadius,
    alignItems: 'center',
    marginTop: SIZES.sm,
    marginBottom: SIZES.xl,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    paddingHorizontal: SIZES.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SIZES.md - 2,
    borderRadius: SIZES.inputRadius,
    marginBottom: SIZES.md,
  },
  socialIcon: {
    fontSize: SIZES.h4,
    marginRight: SIZES.md,
  },
  socialButtonText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.body,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.lg,
  },
  signupText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
  },
  signupLink: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
});

export default LoginScreen;
