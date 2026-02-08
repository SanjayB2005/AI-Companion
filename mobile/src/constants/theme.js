// Retro-ish pastel color palette for Emotion Companion
export const COLORS = {
  // Primary colors - Soft purple theme
  primary: '#8B7FFF',      // Soft purple
  primaryLight: '#ADA4FF', // Light purple
  primaryDark: '#6B5FDF',  // Dark purple
  
  // Accent colors
  accent: '#FF9ECD',       // Soft pink
  accentLight: '#FFB8DC',  // Light pink
  secondary: '#A0E7E5',    // Soft cyan/mint
  
  // Background colors - Light pastel theme
  background: '#F5F7FB',   // Light blue-gray
  surface: '#FFFFFF',      // Pure white
  surfaceLight: '#FAFBFD', // Off white
  
  // Gradients
  gradientStart: '#E8EDF5',
  gradientMiddle: '#F0F4F9',
  gradientEnd: '#F5F7FB',
  
  // Card gradients
  cardGradientStart: '#FFFFFF',
  cardGradientEnd: '#F8F9FC',
  
  // Text colors - Dark on light
  textPrimary: '#2D3748',  // Soft black
  textSecondary: '#718096', // Medium gray
  textMuted: '#A0AEC0',     // Light gray
  
  // Status colors
  success: '#7FD8BE',       // Soft green
  error: '#FF6B8A',         // Soft red
  warning: '#FFB74D',       // Soft orange
  info: '#7EB8FF',          // Soft blue
  
  // Activity status
  active: '#7FD8BE',        // Green for active
  idle: '#CBD5E0',          // Gray for idle
  offline: '#A0AEC0',       // Light gray for offline
  
  // Utility
  white: '#FFFFFF',
  black: '#2D3748',
  transparent: 'transparent',
  
  // Borders
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  
  // Shadows
  shadow: 'rgba(139, 127, 255, 0.1)',
  shadowDark: 'rgba(45, 55, 72, 0.15)',
  
  // Chat bubble colors
  userBubble: '#8B7FFF',
  userBubbleText: '#FFFFFF',
  aiBubble: '#F0F4F8',
  aiBubbleText: '#2D3748',
  
  // Overlay
  overlay: 'rgba(45, 55, 72, 0.4)',
};

export const SIZES = {
  // Font sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  body: 16,
  small: 14,
  tiny: 12,
  
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Border radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,
  
  // Button
  buttonHeight: 56,
  buttonRadius: 16,
  
  // Input
  inputHeight: 56,
  inputRadius: 12,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

export default { COLORS, SIZES, FONTS, SHADOWS };
