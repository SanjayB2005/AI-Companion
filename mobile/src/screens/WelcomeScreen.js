import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Colors inspired by your design
const WELCOME_COLORS = {
  background: '#F8FFFE',
  cardBackground: '#FFFFFF',
  primary: '#4A90E2',
  accent: '#7ED321',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardAnim1 = useRef(new Animated.Value(0)).current;
  const cardAnim2 = useRef(new Animated.Value(0)).current;
  const cardAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check if user has seen welcome screen before
    checkWelcomeStatus();
    startAnimations();
  }, []);

  const checkWelcomeStatus = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      // If user has seen welcome before and is not authenticated, go directly to login
      if (hasSeenWelcome) {
        // You can add additional logic here if needed
      }
    } catch (error) {
      console.error('Error checking welcome status:', error);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Stagger card animations
    setTimeout(() => {
      Animated.timing(cardAnim1, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 300);
    
    setTimeout(() => {
      Animated.timing(cardAnim2, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 600);
    
    setTimeout(() => {
      Animated.timing(cardAnim3, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 900);
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    navigation.replace('Login');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={WELCOME_COLORS.background} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={[WELCOME_COLORS.background, '#F0F8FF']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Cards */}
      <View style={styles.cardsContainer}>
        <Animated.View
          style={[
            styles.floatingCard,
            styles.card1,
            {
              opacity: cardAnim1,
              transform: [
                {
                  translateY: cardAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🤔</Text>
            <View style={styles.cardStats}>
              <Text style={styles.cardCount}>16 answers</Text>
              <Text style={styles.cardViews}>• 400 views</Text>
            </View>
          </View>
          <Text style={styles.cardText}>
            How do you stop overthinking small social interactions?
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingCard,
            styles.card2,
            {
              opacity: cardAnim2,
              transform: [
                {
                  translateY: cardAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💭</Text>
            <View style={styles.cardStats}>
              <Text style={styles.cardCount}>23 answers</Text>
              <Text style={styles.cardViews}>• 650 views</Text>
            </View>
          </View>
          <Text style={styles.cardText}>
            What helps you manage anxiety in daily situations?
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingCard,
            styles.card3,
            {
              opacity: cardAnim3,
              transform: [
                {
                  translateY: cardAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🌱</Text>
            <View style={styles.cardStats}>
              <Text style={styles.cardCount}>31 answers</Text>
              <Text style={styles.cardViews}>• 890 views</Text>
            </View>
          </View>
          <Text style={styles.cardText}>
            How to build healthy emotional boundaries?
          </Text>
        </Animated.View>
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        
        {/* Green Circle with Plus */}
        <View style={styles.addButton}>
          <Text style={styles.plusIcon}>+</Text>
        </View>

        <Text style={styles.mainTitle}>Take a breath.</Text>
        <Text style={styles.mainTitle}>You're in a safe space</Text>
        
        <Text style={styles.subtitle}>
          This app helps you understand your emotions,
          track patterns, and feel supported along the way.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WELCOME_COLORS.background,
  },
  cardsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  floatingCard: {
    position: 'absolute',
    backgroundColor: WELCOME_COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: WELCOME_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  card1: {
    width: width * 0.7,
    top: height * 0.15,
    right: width * 0.05,
  },
  card2: {
    width: width * 0.65,
    top: height * 0.32,
    left: width * 0.1,
  },
  card3: {
    width: width * 0.6,
    top: height * 0.25,
    right: width * 0.15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardCount: {
    fontSize: 12,
    color: WELCOME_COLORS.textSecondary,
    fontWeight: '500',
  },
  cardViews: {
    fontSize: 12,
    color: WELCOME_COLORS.textSecondary,
    marginLeft: 4,
  },
  cardText: {
    fontSize: 14,
    color: WELCOME_COLORS.text,
    fontWeight: '600',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 2,
    marginTop: height * 0.1,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: WELCOME_COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: WELCOME_COLORS.accent,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  plusIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: '300',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: WELCOME_COLORS.text,
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: WELCOME_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: WELCOME_COLORS.text,
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 25,
    marginBottom: 16,
    width: '100%',
    shadowColor: WELCOME_COLORS.text,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipText: {
    color: WELCOME_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default WelcomeScreen;