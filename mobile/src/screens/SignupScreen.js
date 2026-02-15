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
import { authAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

// Design colors matching Arimo style
const SIGNUP_COLORS = {
  primary: '#7ED321', // Bright green like Arimo
  background: '#FFFFFF',
  cardBackground: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  inputBackground: '#F8F9FA',
  inputBorder: '#E9ECEF',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

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
      <StatusBar barStyle="light-content" backgroundColor={SIGNUP_COLORS.primary} />
      
      {/* Curved Green Background */}
      <View style={styles.topSection}>
        <Svg
          height={height * 0.35}
          width={width}
          viewBox={`0 0 ${width} ${height * 0.35}`}
          style={styles.waveSvg}>
          <Path
            d={`M0,0 L${width},0 L${width},${height * 0.22} Q${width * 0.5},${height * 0.32} 0,${height * 0.22} Z`}
            fill={SIGNUP_COLORS.primary}
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
                placeholderTextColor={SIGNUP_COLORS.textSecondary}
                value={formData.first_name}
                onChangeText={(value) => updateField('first_name', value)}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.nameInputContainer}>
              <TextInput
                style={styles.nameInput}
                placeholder="Last name"
                placeholderTextColor={SIGNUP_COLORS.textSecondary}
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
              placeholderTextColor={SIGNUP_COLORS.textSecondary}
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
              placeholderTextColor={SIGNUP_COLORS.textSecondary}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
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
              placeholderTextColor={SIGNUP_COLORS.textSecondary}
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={SIGNUP_COLORS.textSecondary}
              value={formData.password_confirm}
              onChangeText={(value) => updateField('password_confirm', value)}
              secureTextEntry
              autoCapitalize="none"
            />
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
    backgroundColor: SIGNUP_COLORS.background,
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
    paddingHorizontal: 32,
  },
  headerTitle: {
    fontSize: 26,
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
    marginTop: height * 0.25,
    paddingHorizontal: 20,
    paddingBottom: 40,
    zIndex: 2,
  },
  card: {
    backgroundColor: SIGNUP_COLORS.cardBackground,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: SIGNUP_COLORS.shadow,
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
    color: SIGNUP_COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SIGNUP_COLORS.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  nameRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  nameInputContainer: {
    flex: 1,
  },
  nameInput: {
    backgroundColor: SIGNUP_COLORS.inputBackground,
    borderWidth: 1,
    borderColor: SIGNUP_COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: SIGNUP_COLORS.text,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: SIGNUP_COLORS.inputBackground,
    borderWidth: 1,
    borderColor: SIGNUP_COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: SIGNUP_COLORS.text,
  },
  continueButton: {
    backgroundColor: SIGNUP_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: SIGNUP_COLORS.textSecondary,
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
    backgroundColor: SIGNUP_COLORS.inputBorder,
  },
  dividerText: {
    color: SIGNUP_COLORS.textSecondary,
    fontSize: 14,
    paddingHorizontal: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SIGNUP_COLORS.inputBackground,
    borderWidth: 1,
    borderColor: SIGNUP_COLORS.inputBorder,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  socialIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  socialButtonText: {
    color: SIGNUP_COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: SIGNUP_COLORS.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: SIGNUP_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SignupScreen;
