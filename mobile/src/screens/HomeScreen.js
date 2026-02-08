import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { authAPI } from '../services/api';

// Color constants
const HOME_COLORS = {
  primary: '#7ED321',
  background: '#F8F9FA',
  white: '#FFFFFF',
  text: '#2C3E50',
  lightText: '#8E8E93',
  purple: '#8B5FBF',
  blue: '#4A90E2',
  teal: '#50C9C3',
  pink: '#FF69B4',
  lightPurple: '#F0F0FF',
  lightBlue: '#E8F4F8',
};

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authAPI.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              navigation.replace('Login');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ]
    );
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  const requestVideoPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        if (
          granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          // Navigate to video companion screen
          Alert.alert(
            'Permissions Granted',
            'Starting video session with your AI companion!',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Companion', { videoMode: true })
              }
            ]
          );
        } else {
          Alert.alert(
            'Permissions Required',
            'Video and audio permissions are needed for video companion sessions.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // For iOS, you would handle permissions differently
        Alert.alert(
          'Video Session',
          'Starting video session with your AI companion!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Companion', { videoMode: true })
            }
          ]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={HOME_COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            {getCurrentGreeting()}, <Text style={styles.username}>{user?.first_name || user?.username || 'User'}!</Text>
          </Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Elevate Your Mind with AI Support</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* Featured Card */}
        <View style={styles.featuredCard}>
          <View style={styles.featuredContent}>
            <View style={styles.featuredText}>
              <Text style={styles.featuredTitle}>Find your inner peace</Text>
              <Text style={styles.featuredSubtitle}>Connect with your emotions daily</Text>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => navigation.navigate('Companion')}
              >
                <Text style={styles.playIcon}>▶</Text>
                <Text style={styles.playText}>AI Chat</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.featuredIllustration}>
              {/* Simple meditation illustration using SVG */}
              <Svg width="120" height="100" viewBox="0 0 120 100">
                {/* Person sitting in meditation */}
                <Circle cx="60" cy="35" r="15" fill="#FFE5B4" />
                <Ellipse cx="60" cy="60" rx="20" ry="25" fill="#7ED321" />
                <Circle cx="55" cy="32" r="2" fill="#333" />
                <Circle cx="65" cy="32" r="2" fill="#333" />
                <Path d="M55 38 Q60 42 65 38" stroke="#333" strokeWidth="1.5" fill="none" />
                {/* Arms in meditation position */}
                <Circle cx="40" cy="55" r="8" fill="#FFE5B4" />
                <Circle cx="80" cy="55" r="8" fill="#FFE5B4" />
                {/* Sparkles */}
                <Text x="30" y="25" fontSize="12" fill="#FFD700">✨</Text>
                <Text x="90" y="30" fontSize="10" fill="#FFD700">✨</Text>
                <Text x="25" y="50" fontSize="8" fill="#FFD700">✨</Text>
              </Svg>
            </View>
          </View>
        </View>

        {/* Popular Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.popularGrid}>
          {/* Anxiety Support Card */}
          <TouchableOpacity 
            style={[styles.popularCard, styles.anxietyCard]}
            onPress={() => navigation.navigate('Companion')}
          >
            <View style={styles.cardIllustration}>
              <Svg width="60" height="50" viewBox="0 0 60 50">
                <Circle cx="30" cy="20" r="12" fill="#FFF" />
                <Circle cx="27" cy="17" r="2" fill="#4A90E2" />
                <Circle cx="33" cy="17" r="2" fill="#4A90E2" />
                <Path d="M25 24 Q30 28 35 24" stroke="#4A90E2" strokeWidth="2" fill="none" />
                <Ellipse cx="30" cy="35" rx="15" ry="8" fill="#FFF" />
                <Text x="15" y="15" fontSize="8" fill="#50C9C3">💭</Text>
                <Text x="40" y="25" fontSize="6" fill="#50C9C3">💭</Text>
              </Svg>
            </View>
            <Text style={styles.cardTitle}>Anxiety</Text>
            <Text style={styles.cardDescription}>Calm down the stress volume</Text>
            <View style={styles.cardMeta}>
              <Text style={styles.cardSteps}>7 Steps</Text>
              <TouchableOpacity style={styles.cardPlayButton}>
                <Text style={styles.cardPlayIcon}>▶</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Happiness Card */}
          <TouchableOpacity 
            style={[styles.popularCard, styles.happinessCard]}
            onPress={() => navigation.navigate('Companion')}
          >
            <View style={styles.cardIllustration}>
              <Svg width="60" height="50" viewBox="0 0 60 50">
                <Circle cx="30" cy="20" r="12" fill="#FFF" />
                <Circle cx="27" cy="17" r="2" fill="#4A90E2" />
                <Circle cx="33" cy="17" r="2" fill="#4A90E2" />
                <Path d="M25 22 Q30 26 35 22" stroke="#4A90E2" strokeWidth="2" fill="none" />
                <Ellipse cx="30" cy="35" rx="15" ry="8" fill="#FFF" />
                {/* Arms raised in joy */}
                <Path d="M15 30 L20 20" stroke="#FFF" strokeWidth="3" />
                <Path d="M45 30 L40 20" stroke="#FFF" strokeWidth="3" />
                <Text x="10" y="15" fontSize="8" fill="#FFD700">🌟</Text>
                <Text x="45" y="25" fontSize="8" fill="#FFD700">🌟</Text>
              </Svg>
            </View>
            <Text style={styles.cardTitle}>Happiness</Text>
            <Text style={styles.cardDescription}>Turn down the stress volume</Text>
            <View style={styles.cardMeta}>
              <Text style={styles.cardSteps}>5 Steps</Text>
              <TouchableOpacity style={styles.cardPlayButton}>
                <Text style={styles.cardPlayIcon}>▶</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Video Companion Card */}
        <View style={styles.videoCard}>
          <View style={styles.videoCardContent}>
            <View style={styles.videoIllustration}>
              <Svg width="80" height="60" viewBox="0 0 80 60">
                {/* Video camera illustration */}
                <Circle cx="40" cy="30" r="20" fill={HOME_COLORS.primary} />
                <Circle cx="40" cy="30" r="15" fill={HOME_COLORS.white} />
                <Circle cx="40" cy="30" r="8" fill={HOME_COLORS.primary} />
                {/* Camera body */}
                <Path d="M20 20 L60 20 L65 25 L65 35 L60 40 L20 40 Z" fill={HOME_COLORS.text} />
                <Circle cx="35" cy="30" r="6" fill={HOME_COLORS.white} />
                <Circle cx="35" cy="30" r="3" fill={HOME_COLORS.primary} />
                {/* Recording indicator */}
                <Circle cx="55" cy="25" r="3" fill="#FF4444" />
              </Svg>
            </View>
            <View style={styles.videoTextContent}>
              <Text style={styles.videoTitle}>Video Companion</Text>
              <Text style={styles.videoSubtitle}>Face-to-face emotional support session</Text>
              <TouchableOpacity 
                style={styles.videoButton}
                onPress={requestVideoPermissions}
              >
                <Text style={styles.videoButtonIcon}>📹</Text>
                <Text style={styles.videoButtonText}>Start Video Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sweet Sleep Card */}
        <TouchableOpacity style={styles.sleepCard}>
          <Text style={styles.sleepTitle}>Sweet Sleep</Text>
          <Text style={styles.sleepSubtitle}>MUSIC • 12 sounds</Text>
          <TouchableOpacity style={styles.sleepPlayButton}>
            <Text style={styles.sleepPlayIcon}>▶</Text>
          </TouchableOpacity>
        </TouchableOpacity>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={[styles.navIcon, styles.activeNavIcon]}>
            <Text style={styles.navIconText}>🏠</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>�</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {
            Alert.alert(
              'Session History',
              'View your past conversations and emotional progress tracking.',
              [
                {
                  text: 'View History',
                  onPress: () => {
                    // Navigate to history screen (placeholder for now)
                    Alert.alert('Coming Soon', 'Session history feature will be available soon!');
                  }
                },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }}
        >
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>📊</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {
            Alert.alert(
              'Settings',
              'Manage your app preferences and account settings.',
              [
                {
                  text: 'Open Settings',
                  onPress: () => {
                    Alert.alert(
                      'Settings Menu',
                      'Choose a setting category:',
                      [
                        { 
                          text: 'Notifications', 
                          onPress: () => Alert.alert('Notifications', 'Notification settings will be available soon!')
                        },
                        { 
                          text: 'Privacy', 
                          onPress: () => Alert.alert('Privacy', 'Privacy settings will be available soon!')
                        },
                        { 
                          text: 'Account', 
                          onPress: () => navigation.navigate('Profile')
                        },
                        { text: 'Cancel', style: 'cancel' }
                      ]
                    );
                  }
                },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }}
        >
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>⚙️</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: HOME_COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: HOME_COLORS.lightText,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: HOME_COLORS.background,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: HOME_COLORS.text,
  },
  username: {
    fontWeight: '700',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HOME_COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationIcon: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 16,
    color: HOME_COLORS.lightText,
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  featuredCard: {
    backgroundColor: HOME_COLORS.pink,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    minHeight: 140,
  },
  featuredContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredText: {
    flex: 1,
    paddingRight: 16,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: HOME_COLORS.white,
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: HOME_COLORS.white,
    opacity: 0.9,
    marginBottom: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  playIcon: {
    color: HOME_COLORS.white,
    fontSize: 12,
    marginRight: 8,
  },
  playText: {
    color: HOME_COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  featuredIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HOME_COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: HOME_COLORS.primary,
    fontWeight: '500',
  },
  popularGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  popularCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    minHeight: 160,
  },
  anxietyCard: {
    backgroundColor: HOME_COLORS.teal,
  },
  happinessCard: {
    backgroundColor: HOME_COLORS.blue,
  },
  cardIllustration: {
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HOME_COLORS.white,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: HOME_COLORS.white,
    opacity: 0.9,
    marginBottom: 16,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSteps: {
    fontSize: 12,
    color: HOME_COLORS.white,
    opacity: 0.8,
  },
  cardPlayButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPlayIcon: {
    color: HOME_COLORS.white,
    fontSize: 12,
  },
  videoCard: {
    backgroundColor: HOME_COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  videoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoIllustration: {
    marginRight: 16,
  },
  videoTextContent: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: HOME_COLORS.white,
    marginBottom: 4,
  },
  videoSubtitle: {
    fontSize: 14,
    color: HOME_COLORS.white,
    opacity: 0.9,
    marginBottom: 16,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  videoButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  videoButtonText: {
    color: HOME_COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  sleepCard: {
    backgroundColor: HOME_COLORS.lightPurple,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sleepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HOME_COLORS.text,
    flex: 1,
  },
  sleepSubtitle: {
    fontSize: 12,
    color: HOME_COLORS.lightText,
    marginTop: 2,
  },
  sleepPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: HOME_COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sleepPlayIcon: {
    color: HOME_COLORS.text,
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: HOME_COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeNavIcon: {
    backgroundColor: HOME_COLORS.text,
  },
  navIconText: {
    fontSize: 20,
  },
});

export default HomeScreen;
