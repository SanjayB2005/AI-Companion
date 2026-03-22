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
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../services/api';
import { COLORS, SIZES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    const { email, username, password, password_confirm, first_name, last_name } = formData;
    
    if (!email || !username || !password || !password_confirm || !first_name || !last_name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== password_confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register(formData);
      console.log('✅ Registration successful, navigating to Home');
      navigation.replace('Home');
    } catch (error) {
      console.error('Signup error:', error);
      
      // Extract error messages from Django response
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.username) {
        errorMessage = Array.isArray(error.username) 
          ? error.username[0] 
          : error.username;
        // Make it more user-friendly
        if (errorMessage.includes('already exists')) {
          errorMessage = `Username "${username}" is already taken. Please choose a different username.`;
        }
      } else if (error.email) {
        errorMessage = Array.isArray(error.email) 
          ? error.email[0] 
          : error.email;
        if (errorMessage.includes('already exists')) {
          errorMessage = `Email "${email}" is already registered. Please use a different email or try logging in.`;
        }
      } else if (error.password) {
        errorMessage = Array.isArray(error.password) 
          ? error.password[0] 
          : error.password;
      } else if (error.detail) {
        errorMessage = error.detail;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert('Registration Failed', errorMessage);
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
          height={height * 0.35}
          width={width}
          viewBox={`0 0 ${width} ${height * 0.35}`}
          style={styles.waveSvg}>
          <Path
            d={`M0,0 L${width},0 L${width},${height * 0.22} Q${width * 0.5},${height * 0.32} 0,${height * 0.22} Z`}
            fill={COLORS.primary}
          />
        </Svg>
        
        {/* Header Text */}
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Join us today! ✨</Text>
          <Text style={styles.headerSubtitle}>Start your wellness journey</Text>
        </View>
      </View>

      {/* White Card Container */}
      <ScrollView style={styles.cardContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          
          {/* Title */}
          <Text style={styles.title}>Create your{'\n'}account</Text>
          <Text style={styles.subtitle}>Join us today!</Text>

          {/* Name Inputs */}
          <View style={styles.nameRow}>
            <View style={styles.nameInputContainer}>
              <TextInput
                style={styles.nameInput}
                placeholder="First name"
                placeholderTextColor={COLORS.textSecondary}
                value={formData.first_name}
                onChangeText={(value) => updateField('first_name', value)}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.nameInputContainer}>
              <TextInput
                style={styles.nameInput}
                placeholder="Last name"
                placeholderTextColor={COLORS.textSecondary}
                value={formData.last_name}
                onChangeText={(value) => updateField('last_name', value)}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.username}
              onChangeText={(value) => updateField('username', value)}
              autoCapitalize="none"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
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
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm password"
                placeholderTextColor={COLORS.textSecondary}
                value={formData.password_confirm}
                onChangeText={(value) => updateField('password_confirm', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye" : "eye-off"} 
                  size={24} 
                  color={COLORS.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}>
            <Text style={styles.continueButtonText}>
              {loading ? 'Creating account...' : 'Continue'}
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

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
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
    top: height * 0.07,
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
    marginTop: height * 0.25,
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
  nameRow: {
    flexDirection: 'row',
    marginBottom: SIZES.md,
    gap: SIZES.sm,
  },
  nameInputContainer: {
    flex: 1,
  },
  nameInput: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.inputRadius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    fontSize: SIZES.body,
    color: COLORS.textPrimary,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.lg,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
});

export default SignupScreen;
