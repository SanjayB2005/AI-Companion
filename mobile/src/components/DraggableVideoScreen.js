import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIDEO_WIDTH = 120;
const VIDEO_HEIGHT = 160;

const DraggableVideoScreen = ({ isMinimized, onToggleMinimize, onClose, emotionData }) => {
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - VIDEO_WIDTH - 20, y: 100 })).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        setIsDragging(false);
        pan.flattenOffset();

        // Snap to edges
        let finalX = pan.x._value;
        let finalY = pan.y._value;

        // Keep within screen bounds
        finalX = Math.max(0, Math.min(finalX, SCREEN_WIDTH - VIDEO_WIDTH));
        finalY = Math.max(0, Math.min(finalY, SCREEN_HEIGHT - VIDEO_HEIGHT - 100));

        Animated.spring(pan, {
          toValue: { x: finalX, y: finalY },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  if (!isMinimized) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.videoContainer, isDragging && styles.videoContainerDragging]}>
        {/* Mock Video Display */}
        <View style={styles.videoDisplay}>
          <View style={styles.faceOutline}>
            <Text style={styles.faceEmoji}>😊</Text>
          </View>
          
          {/* Emotion Indicator */}
          <View style={styles.emotionBadge}>
            <Text style={styles.emotionText}>
              {emotionData?.emotion || 'Happy'}
            </Text>
            <View style={[styles.emotionIndicator, { backgroundColor: COLORS.success }]} />
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onToggleMinimize}
            activeOpacity={0.7}
          >
            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke={COLORS.white}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.closeButton]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6L18 18"
                stroke={COLORS.white}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  videoContainer: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  videoContainerDragging: {
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  videoDisplay: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceOutline: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: COLORS.white + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceEmoji: {
    fontSize: 40,
  },
  emotionBadge: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface + 'CC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  emotionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emotionIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
  },
  controlButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: COLORS.error,
  },
});

export default DraggableVideoScreen;
