import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { authAPI } from '../services/api';

const ChangePasswordScreen = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters');
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from old password');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });
      
      Alert.alert(
        'Success',
        'Password changed successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Change password error:', error);
      
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (error.old_password) {
        errorMessage = error.old_password[0];
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
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Password</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Update Your Password</Text>
              <Text style={styles.cardSubtitle}>
                Enter your current password and choose a new secure password
              </Text>

              {/* Old Password Input */}
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Text style={styles.inputIcon}>🔑</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Current Password"
                  placeholderTextColor={COLORS.textMuted}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={!showOldPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowOldPassword(!showOldPassword)}
                  style={styles.eyeButton}>
                  <Text style={styles.eyeIcon}>{showOldPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
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

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                <Text style={styles.requirementItem}>• At least 8 characters long</Text>
                <Text style={styles.requirementItem}>• Different from current password</Text>
              </View>

              {/* Change Password Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleChangePassword}
                disabled={loading}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}>
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

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
    padding: SIZES.lg,
    paddingTop: SIZES.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    ...SHADOWS.medium,
  },
  cardTitle: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
  },
  cardSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.md,
    paddingHorizontal: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  requirementsContainer: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  requirementsTitle: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  requirementItem: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs / 2,
  },
  submitButton: {
    borderRadius: SIZES.buttonRadius,
    overflow: 'hidden',
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
});

export default ChangePasswordScreen;
