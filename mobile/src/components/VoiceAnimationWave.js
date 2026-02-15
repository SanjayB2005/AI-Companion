import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS } from '../constants/theme';

const VoiceAnimationWave = ({ isActive, color = COLORS.primary }) => {
  const animations = useRef([...Array(5)].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    if (isActive) {
      const animationLoops = animations.map((anim, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 400 + index * 100,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 400 + index * 100,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
          ])
        );
      });

      animationLoops.forEach((loop, index) => {
        setTimeout(() => loop.start(), index * 80);
      });

      return () => {
        animationLoops.forEach(loop => loop.stop());
      };
    } else {
      animations.forEach(anim => {
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              transform: [
                {
                  scaleY: anim,
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    gap: 3,
  },
  bar: {
    width: 3,
    height: 40,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});

export default VoiceAnimationWave;
