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
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { 
  Path, 
  Circle, 
  Ellipse, 
  Rect, 
  Defs, 
  LinearGradient, 
  Stop 
} from 'react-native-svg';
import { authAPI } from '../services/api';
import { COLORS, SIZES } from '../constants/theme';
import BottomNavigation from '../components/BottomNavigation';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadUserData();
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

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
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Text style={styles.loadingText}>Loading...</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getCurrentGreeting()}</Text>
            <Text style={styles.userName}>{user?.first_name || user?.username || 'User'} ✨</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path
                d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"
                fill={COLORS.textSecondary}
              />
            </Svg>
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Main AI Companion Card */}
        <TouchableOpacity 
          style={styles.mainCard}
          onPress={() => navigation.navigate('Companion')}
          activeOpacity={0.9}
        >
          <View style={styles.mainCardContent}>
            <View style={styles.mainCardText}>
              <Text style={styles.mainCardTitle}>Your AI Companion</Text>
              <Text style={styles.mainCardSubtitle}>
                Ready to listen and support you anytime
              </Text>
              <View style={styles.startButton}>
                <Svg width="16" height="16" viewBox="0 0 16 16">
                  <Path d="M4 2L12 8L4 14V2Z" fill={COLORS.primary} />
                </Svg>
                <Text style={styles.startButtonText}>Start Chat</Text>
              </View>
            </View>
            <Animated.View style={[styles.mainCardIllustration, { transform: [{ scale: pulseAnim }] }]}>
              <Svg width="100" height="100" viewBox="0 0 100 100">
                <Defs>
                  <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.8" />
                    <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.6" />
                  </LinearGradient>
                </Defs>
                <Circle cx="50" cy="50" r="35" fill="url(#grad1)" />
                <Circle cx="42" cy="45" r="4" fill="white" />
                <Circle cx="58" cy="45" r="4" fill="white" />
                <Path d="M40 60 Q50 68 60 60" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
              </Svg>
            </Animated.View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: '#F0F4FF' }]}
              onPress={() => navigation.navigate('Companion')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E3EBFF' }]}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path
                    d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"
                    fill={COLORS.primary}
                  />
                </Svg>
              </View>
              <Text style={styles.quickActionTitle}>Text Chat</Text>
              <Text style={styles.quickActionDesc}>Quick conversation</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: '#FFF4F0' }]}
              onPress={() => navigation.navigate('Companion')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFE9E0' }]}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path
                    d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                    fill="#FF8A65"
                  />
                </Svg>
              </View>
              <Text style={styles.quickActionTitle}>Voice Chat</Text>
              <Text style={styles.quickActionDesc}>Speak freely</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: '#F0FFF4' }]}
              onPress={() => navigation.navigate('Companion', { videoMode: true })}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E0FFE9' }]}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path
                    d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM15 16H5V8h10v8z"
                    fill="#66BB6A"
                  />
                </Svg>
              </View>
              <Text style={styles.quickActionTitle}>Video Call</Text>
              <Text style={styles.quickActionDesc}>Face-to-face</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: '#FFF8F0' }]}
              onPress={() => navigation.navigate('Activity')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFEFD0' }]}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path
                    d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"
                    fill="#FFA726"
                  />
                </Svg>
              </View>
              <Text style={styles.quickActionTitle}>Activity</Text>
              <Text style={styles.quickActionDesc}>Your insights</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emotion Support */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emotion Support</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.emotionGrid}>
            <TouchableOpacity 
              style={styles.emotionCard}
              onPress={() => navigation.navigate('Companion')}
            >
              <View style={styles.emotionCardHeader}>
                <Svg width="40" height="40" viewBox="0 0 40 40">
                  <Circle cx="20" cy="20" r="18" fill="#E3F2FD" />
                  <Circle cx="16" cy="18" r="2" fill="#1976D2" />
                  <Circle cx="24" cy="18" r="2" fill="#1976D2" />
                  <Path d="M14 24 Q20 28 26 24" stroke="#1976D2" strokeWidth="2" fill="none" />
                </Svg>
                <View style={styles.emotionBadge}>
                  <Text style={styles.emotionBadgeText}>7 Steps</Text>
                </View>
              </View>
              <Text style={styles.emotionCardTitle}>Manage Anxiety</Text>
              <Text style={styles.emotionCardDesc}>Calm your mind with guided support</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.emotionCard}
              onPress={() => navigation.navigate('Companion')}
            >
              <View style={styles.emotionCardHeader}>
                <Svg width="40" height="40" viewBox="0 0 40 40">
                  <Circle cx="20" cy="20" r="18" fill="#FFF3E0" />
                  <Circle cx="16" cy="18" r="2" fill="#F57C00" />
                  <Circle cx="24" cy="18" r="2" fill="#F57C00" />
                  <Path d="M14 22 Q20 26 26 22" stroke="#F57C00" strokeWidth="2" fill="none" />
                </Svg>
                <View style={styles.emotionBadge}>
                  <Text style={styles.emotionBadgeText}>5 Steps</Text>
                </View>
              </View>
              <Text style={styles.emotionCardTitle}>Boost Happiness</Text>
              <Text style={styles.emotionCardDesc}>Elevate your mood naturally</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.emotionCardWide}
            onPress={() => navigation.navigate('Companion')}
          >
            <View style={styles.emotionCardWideContent}>
              <Svg width="50" height="50" viewBox="0 0 50 50">
                <Circle cx="25" cy="25" r="22" fill="#F3E5F5" />
                <Circle cx="20" cy="22" r="2" fill="#7B1FA2" />
                <Circle cx="30" cy="22" r="2" fill="#7B1FA2" />
                <Path d="M20 30 Q25 28 30 30" stroke="#7B1FA2" strokeWidth="2" fill="none" />
                <Path d="M15 35 Q25 32 35 35" stroke="#7B1FA2" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </Svg>
              <View style={styles.emotionCardWideText}>
                <Text style={styles.emotionCardTitle}>Sleep Better</Text>
                <Text style={styles.emotionCardDesc}>Relaxation for peaceful rest</Text>
              </View>
              <View style={styles.playButton}>
                <Svg width="20" height="20" viewBox="0 0 20 20">
                  <Path d="M5 3L17 10L5 17V3Z" fill={COLORS.primary} />
                </Svg>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Professional Bottom Navigation */}
      <BottomNavigation navigation={navigation} currentRoute="Home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FAFBFC',
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 5,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  mainCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  mainCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainCardText: {
    flex: 1,
    paddingRight: 15,
  },
  mainCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  mainCardSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    alignSelf: 'flex-start',
    gap: 8,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  mainCardIllustration: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 5,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  quickActionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emotionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  emotionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emotionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  emotionBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emotionBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emotionCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emotionCardDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  emotionCardWide: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emotionCardWideContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  emotionCardWideText: {
    flex: 1,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
