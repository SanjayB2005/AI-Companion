import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { authAPI } from '../services/api';

const PasswordResetScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: Code & Password
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.requestPasswordReset(email);
      
      // For development, show the reset code
      if (response.reset_code) {
        Alert.alert(
          'Reset Code Sent',
          `Your reset code is: ${response.reset_code}\n\n(In production, this would be sent via email)`,
          [{ text: 'OK', onPress: () => setStep(2) }]
        );
      } else {
        Alert.alert('Success', 'A reset code has been sent to your email', [
          { text: 'OK', onPress: () => setStep(2) }
        ]);
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      
      let errorMessage = 'Unable to process request. Please try again.';
      
      if (error.email) {
        errorMessage = error.email[0];
      } else if (error.detail) {
        errorMessage = error.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetCode || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await authAPI.confirmPasswordReset({
        email,
        reset_code: resetCode,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });
      
      Alert.alert(
        'Success',
        'Your password has been reset successfully! Please login with your new password.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.reset_code) {
        errorMessage = error.reset_code[0];
      } else if (error.new_password) {
        errorMessage = error.new_password[0];
      } else if (error.detail) {
        errorMessage = error.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}>
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>🔐</Text>
              <Text style={styles.title}>
                {step === 1 ? 'Reset Password' : 'Enter Reset Code'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 1
                  ? 'Enter your email to receive a reset code'
                  : 'Enter the code and your new password'}
              </Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              
              {step === 1 ? (
                <>
                  {/* Email Input */}
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <Text style={styles.inputIcon}>📧</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor={COLORS.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>

                  {/* Request Reset Button */}
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleRequestReset}
                    disabled={loading}
                    activeOpacity={0.8}>
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}>
                      <Text style={styles.submitButtonText}>
                        {loading ? 'Sending...' : 'Send Reset Code'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* Reset Code Input */}
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <Text style={styles.inputIcon}>🔢</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="6-digit Reset Code"
                      placeholderTextColor={COLORS.textMuted}
                      value={resetCode}
                      onChangeText={setResetCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>

                  {/* New Password Input */}
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <Text style={styles.inputIcon}>🔒</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="New Password"
                      placeholderTextColor={COLORS.textMuted}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity 
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeButton}>
                      <Text style={styles.eyeIcon}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Confirm Password Input */}
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <Text style={styles.inputIcon}>🔐</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm New Password"
                      placeholderTextColor={COLORS.textMuted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}>
                      <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Reset Password Button */}
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleConfirmReset}
                    disabled={loading}
                    activeOpacity={0.8}>
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}>
                      <Text style={styles.submitButtonText}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Back Button */}
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setStep(1)}>
                    <Text style={styles.backButtonText}>← Back to Email</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Back to Login */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.lg,
  },
  content: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xxl,
  },
  emoji: {
    fontSize: 60,
    marginBottom: SIZES.md,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SIZES.lg,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.md,
    paddingHorizontal: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  inputIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  inputIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    height: SIZES.inputHeight,
    color: COLORS.textPrimary,
    fontSize: SIZES.body,
  },
  eyeButton: {
    padding: SIZES.sm,
  },
  eyeIcon: {
    fontSize: 20,
  },
  submitButton: {
    borderRadius: SIZES.buttonRadius,
    overflow: 'hidden',
    marginTop: SIZES.md,
    ...SHADOWS.medium,
  },
  gradientButton: {
    height: SIZES.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: SIZES.h5,
    fontWeight: '600',
  },
  backButton: {
    marginTop: SIZES.md,
    alignItems: 'center',
    paddingVertical: SIZES.sm,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    paddingHorizontal: SIZES.md,
    fontSize: SIZES.small,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
});

export default PasswordResetScreen;
