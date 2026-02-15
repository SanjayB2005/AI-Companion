import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import Svg, { Path, Circle, G } from 'react-native-svg';

const BottomNavigation = ({ navigation, currentRoute }) => {
  const NavIcon = ({ name, active, onPress }) => {
    const iconColor = active ? COLORS.primary : COLORS.textMuted;
    
    const icons = {
      home: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
            stroke={iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={active ? iconColor : 'none'}
            fillOpacity={active ? 0.1 : 0}
          />
          <Path
            d="M9 22V12H15V22"
            stroke={iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ),
      chat: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
            stroke={iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={active ? iconColor : 'none'}
            fillOpacity={active ? 0.1 : 0}
          />
        </Svg>
      ),
      activity: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M22 12H18L15 21L9 3L6 12H2"
            stroke={iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ),
      profile: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Circle
            cx="12"
            cy="7"
            r="4"
            stroke={iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={active ? iconColor : 'none'}
            fillOpacity={active ? 0.1 : 0}
          />
          <Path
            d="M5.5 20C5.5 17.5 8.13 15.5 12 15.5C15.87 15.5 18.5 17.5 18.5 20"
            stroke={iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ),
    };

    return (
      <TouchableOpacity
        style={[styles.navButton, active && styles.navButtonActive]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconWrapper}>
          {icons[name]}
        </View>
        {active && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navContent}>
        <NavIcon
          name="home"
          active={currentRoute === 'Home'}
          onPress={() => navigation.navigate('Home')}
        />
        <NavIcon
          name="chat"
          active={currentRoute === 'Companion'}
          onPress={() => navigation.navigate('Companion', { companionName: 'MindBuilder' })}
        />
        <NavIcon
          name="activity"
          active={currentRoute === 'Activity'}
          onPress={() => navigation.navigate('Activity')}
        />
        <NavIcon
          name="profile"
          active={currentRoute === 'Profile'}
          onPress={() => navigation.navigate('Profile')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SIZES.md,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: SIZES.radiusLg,
    position: 'relative',
  },
  navButtonActive: {
    backgroundColor: COLORS.primaryLight + '15',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    bottom: 0,
  },
});

export default BottomNavigation;
