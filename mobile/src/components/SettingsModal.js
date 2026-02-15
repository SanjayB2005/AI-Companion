import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../constants/theme';
import Svg, { Path } from 'react-native-svg';

const SettingsModal = ({ visible, onClose, onSave }) => {
  const [settings, setSettings] = useState({
    audioEnabled: true,
    videoEnabled: true,
    autoStartVideo: false,
    voiceAnimation: true,
    emotionDetection: true,
    responseSpeed: 'normal', // 'fast', 'normal', 'thoughtful'
  });

  useEffect(() => {
    loadSettings();
  }, [visible]);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('companionSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('companionSettings', JSON.stringify(settings));
      onSave(settings);
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const SettingRow = ({ title, subtitle, value, onValueChange, type = 'switch' }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
        thumbColor={value ? COLORS.primary : COLORS.textMuted}
      />
    </View>
  );

  const ResponseSpeedOption = ({ label, value, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.speedOption, selected && styles.speedOptionSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.speedOptionText, selected && styles.speedOptionTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />
        
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Companion Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6L18 18"
                  stroke={COLORS.textSecondary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Media Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Media Preferences</Text>
              
              <SettingRow
                title="Audio Input"
                subtitle="Required for voice emotion detection"
                value={settings.audioEnabled}
                onValueChange={(val) => setSettings({ ...settings, audioEnabled: val })}
              />
              
              <SettingRow
                title="Video Feed"
                subtitle="Enable facial emotion detection"
                value={settings.videoEnabled}
                onValueChange={(val) => setSettings({ ...settings, videoEnabled: val })}
              />
              
              <SettingRow
                title="Auto-start Video"
                subtitle="Begin sessions with video enabled"
                value={settings.autoStartVideo}
                onValueChange={(val) => setSettings({ ...settings, autoStartVideo: val })}
              />
            </View>

            {/* Visual Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Visual Feedback</Text>
              
              <SettingRow
                title="Voice Animation"
                subtitle="Show animated wave during speech"
                value={settings.voiceAnimation}
                onValueChange={(val) => setSettings({ ...settings, voiceAnimation: val })}
              />
              
              <SettingRow
                title="Emotion Detection Overlay"
                subtitle="Display detected emotions in real-time"
                value={settings.emotionDetection}
                onValueChange={(val) => setSettings({ ...settings, emotionDetection: val })}
              />
            </View>

            {/* Response Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Response Style</Text>
              <Text style={styles.sectionSubtitle}>How should the AI respond?</Text>
              
              <View style={styles.speedOptions}>
                <ResponseSpeedOption
                  label="Fast"
                  value="fast"
                  selected={settings.responseSpeed === 'fast'}
                  onPress={() => setSettings({ ...settings, responseSpeed: 'fast' })}
                />
                <ResponseSpeedOption
                  label="Normal"
                  value="normal"
                  selected={settings.responseSpeed === 'normal'}
                  onPress={() => setSettings({ ...settings, responseSpeed: 'normal' })}
                />
                <ResponseSpeedOption
                  label="Thoughtful"
                  value="thoughtful"
                  selected={settings.responseSpeed === 'thoughtful'}
                  onPress={() => setSettings({ ...settings, responseSpeed: 'thoughtful' })}
                />
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveSettings}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    maxHeight: '85%',
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.lg,
    paddingBottom: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
  },
  section: {
    paddingVertical: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
  },
  sectionSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: SIZES.md,
  },
  settingTitle: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  speedOptions: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginTop: SIZES.sm,
  },
  speedOption: {
    flex: 1,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  speedOptionSelected: {
    backgroundColor: COLORS.primaryLight + '20',
    borderColor: COLORS.primary,
  },
  speedOptionText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  speedOptionTextSelected: {
    color: COLORS.primary,
  },
  footer: {
    padding: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default SettingsModal;
