import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { COLORS, SIZES } from '../constants/theme';
import Svg, { Path, Circle } from 'react-native-svg';
import VoiceAnimationWave from '../components/VoiceAnimationWave';
import DraggableVideoScreen from '../components/DraggableVideoScreen';
import SettingsModal from '../components/SettingsModal';
import { emotionAPI, speechAPI } from '../services/api';

const CompanionScreen = ({ navigation, route }) => {
  const { companionName = 'MindBuilder' } = route?.params || {};
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState({ emotion: 'Neutral', confidence: 0 });
  const [loading, setLoading] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [emotionSessionId, setEmotionSessionId] = useState(null);
  const [speechSessionId, setSpeechSessionId] = useState(null);
  const [lastDetectionAt, setLastDetectionAt] = useState(null);
  const [settings, setSettings] = useState({
    audioEnabled: true,
    videoEnabled: true,
    autoStartVideo: false,
    voiceAnimation: true,
    emotionDetection: true,
    responseSpeed: 'normal',
  });
  const scrollViewRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sessionIdRef = useRef(null);
  const speechSessionIdRef = useRef(null);
  const detectionInFlightRef = useRef(false);
  const recordingRef = useRef(null);
  const playbackRef = useRef(null);

  useEffect(() => {
    loadSettings();
    // Scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  useEffect(() => {
    // Pulse animation for emotion indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const startSession = async () => {
      try {
        const [emotionResponse, speechResponse] = await Promise.all([
          emotionAPI.startSession(),
          speechAPI.startSession(settings.audioEnabled),
        ]);

        const emotionId = emotionResponse?.session?.id || null;
        const speechId = speechResponse?.session?.id || null;

        sessionIdRef.current = emotionId;
        speechSessionIdRef.current = speechId;
        setEmotionSessionId(emotionId);
        setSpeechSessionId(speechId);

        await loadWelcomeMessage();
      } catch (error) {
        console.error('Error starting sessions:', error);
      }
    };

    startSession();

    return () => {
      const currentSessionId = sessionIdRef.current;
      const currentSpeechSessionId = speechSessionIdRef.current;

      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }

      if (playbackRef.current) {
        playbackRef.current.unloadAsync().catch(() => {});
      }

      if (currentSessionId) {
        emotionAPI.endSession(currentSessionId).catch((error) => {
          console.error('Error ending emotion session:', error);
        });
      }

      if (currentSpeechSessionId) {
        speechAPI.endSession(currentSpeechSessionId).catch((error) => {
          console.error('Error ending speech session:', error);
        });
      }
    };
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('companionSettings');
      if (saved) {
        const loadedSettings = JSON.parse(saved);
        setSettings(loadedSettings);
        if (loadedSettings.autoStartVideo) {
          setIsVideoMinimized(true);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const addAIMessage = (text, aiEmotion = 'neutral') => {
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + Math.random()).toString(),
        text,
        sender: 'ai',
        timestamp: new Date(),
        aiEmotion,
      },
    ]);
  };

  const loadWelcomeMessage = async () => {
    try {
      const response = await speechAPI.generateResponse(
        `Greet the user as ${companionName}, a supportive emotional companion. Keep it short, friendly, and ask how they are feeling today.`,
        'Neutral',
        false
      );

      console.log('Welcome response:', response);

      const welcomeText = response?.response_text || response?.ai_text;
      if (welcomeText) {
        addAIMessage(welcomeText, response?.response_tone || response?.detected_emotion || 'welcoming');
        return;
      }

      throw new Error('Welcome response did not include ai text');
    } catch (error) {
      console.error('Failed to load tts-service welcome message:', error);
      addAIMessage('Welcome message unavailable. Please check TTS service / LLM connection.', 'Concerned');
    }
  };

  const playAIAudio = async (audioUrl) => {
    if (!audioUrl) {
      return;
    }

    try {
      if (playbackRef.current) {
        await playbackRef.current.unloadAsync();
        playbackRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      playbackRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          if (playbackRef.current === sound) {
            playbackRef.current = null;
          }
        }
      });
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const getAudioFormatFromUri = (uri) => {
    if (Platform.OS === 'web') {
      return 'webm';
    }

    if (!uri || typeof uri !== 'string') {
      return 'm4a';
    }

    const cleanPath = uri.split('?')[0].toLowerCase();
    const extension = cleanPath.includes('.') ? cleanPath.split('.').pop() : '';
    const supported = ['m4a', 'wav', 'webm', 'mp3', 'aac', 'caf'];
    return supported.includes(extension) ? extension : 'm4a';
  };

  const readAudioAsBase64 = async (uri) => {
    if (Platform.OS !== 'web') {
      return FileSystemLegacy.readAsStringAsync(uri, {
        encoding: 'base64',
      });
    }

    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to load recorded audio: ${response.status}`);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        if (!base64) {
          reject(new Error('Failed to convert recorded audio to base64'));
          return;
        }
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Unable to read recorded audio file'));
      reader.readAsDataURL(blob);
    });
  };

  const requestAIResponse = async (userText, options = {}) => {
    setLoading(true);
    try {
      const facialEmotion = options.facialEmotion || detectedEmotion.emotion || 'Neutral';
      const audioEmotion = options.audioEmotion || 'neutral';

      const response = await speechAPI.generateResponse(
        userText,
        facialEmotion,
        settings.audioEnabled,
        audioEmotion
      );

      console.log('AI response payload:', response);

      const aiText = (response?.response_text || response?.ai_text || '').trim();
      if (!aiText) {
        throw new Error('TTS service returned empty ai text');
      }

      const aiEmotion = response?.response_tone || response?.detected_emotion || 'neutral';

      addAIMessage(aiText, aiEmotion);

      if (settings.audioEnabled && response?.audio_url) {
        await playAIAudio(response.audio_url);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      addAIMessage('I had trouble reaching the speech service. Please try again in a moment.', 'Concerned');
    } finally {
      setLoading(false);
    }
  };

  const detectEmotionFromFrame = async (frameBase64) => {
    if (!settings.emotionDetection || detectionInFlightRef.current) {
      return;
    }

    detectionInFlightRef.current = true;
    try {
      const response = await emotionAPI.detectFacialEmotion(frameBase64, emotionSessionId);
      const detection = response?.detection;

      if (detection?.emotion) {
        setDetectedEmotion({
          emotion: detection.emotion,
          confidence: Number(detection.confidence || 0),
        });
        setLastDetectionAt(new Date());
      }
    } catch (error) {
      console.error('Facial emotion detection failed:', error);
    } finally {
      detectionInFlightRef.current = false;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userText = message.trim();
    const userMessage = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
      detectedEmotion: detectedEmotion.emotion,
      sessionId: emotionSessionId,
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    await requestAIResponse(userText, {
      facialEmotion: detectedEmotion.emotion || 'Neutral',
    });
  };

  const toggleVoiceRecording = async () => {
    if (!settings.audioEnabled) {
      return;
    }

    if (!isRecording) {
      try {
        const permission = await Audio.requestPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Microphone Permission', 'Microphone access is required for voice chat.');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await recording.startAsync();
        recordingRef.current = recording;
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start recording:', error);
        Alert.alert('Recording Error', 'Unable to start recording. Please try again.');
      }

      return;
    }

    try {
      setIsRecording(false);

      const recording = recordingRef.current;
      if (!recording) {
        return;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;

      if (!uri) {
        throw new Error('Recording URI not available');
      }

      setLoading(true);
      const audioBase64 = await readAudioAsBase64(uri);

      const audioFormat = getAudioFormatFromUri(uri);
      const transcriptResponse = await speechAPI.transcribeAudio(audioBase64, audioFormat);
      const transcript = (transcriptResponse?.text || '').trim();
      const voiceEmotion = transcriptResponse?.detected_emotion || detectedEmotion.emotion || 'Neutral';

      setDetectedEmotion((prev) => ({
        emotion: voiceEmotion,
        confidence: prev.confidence || 0,
      }));

      if (!transcript) {
        addAIMessage('I could not hear any speech clearly. Please try again.', 'Concerned');
        setLoading(false);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: transcript,
          sender: 'user',
          timestamp: new Date(),
          isVoice: true,
          detectedEmotion: voiceEmotion,
          sessionId: speechSessionId,
        },
      ]);

      await requestAIResponse(transcript, {
        facialEmotion: detectedEmotion.emotion || 'Neutral',
        audioEmotion: voiceEmotion,
      });
    } catch (error) {
      console.error('Voice processing failed:', error);
      setLoading(false);
      addAIMessage('Voice processing failed. Please try recording again.', 'Concerned');
    } finally {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      }).catch(() => {});
    }
  };

  const toggleVideoMode = () => {
    if (!settings.videoEnabled) {
      return;
    }
    setIsVideoMinimized(!isVideoMinimized);
  };

  const closeVideo = () => {
    setIsVideoMinimized(false);
  };

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
    if (!newSettings.videoEnabled && isVideoMinimized) {
      setIsVideoMinimized(false);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      friendly: COLORS.success,
      welcoming: COLORS.secondary,
      empathetic: COLORS.info,
      supportive: COLORS.primary,
      calming: COLORS.secondary,
      calm: COLORS.secondary,
      reassuring: COLORS.info,
      curious: COLORS.accent,
      celebratory: COLORS.success,
      attentive: COLORS.textSecondary,
      happy: COLORS.success,
      understanding: COLORS.secondary,
      caring: COLORS.accent,
      Happy: COLORS.success,
      Calm: COLORS.secondary,
      Thoughtful: COLORS.info,
      Neutral: COLORS.textMuted,
      Concerned: COLORS.warning,
    };
    return colors[emotion] || COLORS.textMuted;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke={COLORS.textPrimary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.companionAvatar}>
            <Text style={styles.companionAvatarText}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{companionName}</Text>
            <View style={styles.statusContainer}>
              <Animated.View style={[styles.statusDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={toggleVideoMode}
            style={[styles.iconButton, isVideoMinimized && styles.iconButtonActive]}
          >
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <Path
                d="M23 7L16 12L23 17V7Z"
                stroke={isVideoMinimized ? COLORS.primary : COLORS.textSecondary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={isVideoMinimized ? COLORS.primary + '20' : 'none'}
              />
              <Path
                d="M15 5H3C1.89543 5 1 5.89543 1 7V17C1 18.1046 1.89543 19 3 19H15C16.1046 19 17 18.1046 17 17V7C17 5.89543 16.1046 5 15 5Z"
                stroke={isVideoMinimized ? COLORS.primary : COLORS.textSecondary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.iconButton}>
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <Circle
                cx="12"
                cy="12"
                r="3"
                stroke={COLORS.textSecondary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
                stroke={COLORS.textSecondary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* Emotion Status Bar */}
      {settings.emotionDetection && detectedEmotion.confidence > 0 && (
        <View style={styles.emotionBar}>
          <View style={[styles.emotionDot, { backgroundColor: getEmotionColor(detectedEmotion.emotion) }]} />
          <Text style={styles.emotionBarText}>
            Detected: <Text style={styles.emotionBarEmoji}>{detectedEmotion.emotion}</Text>
          </Text>
          {lastDetectionAt && (
            <Text style={styles.detectedAtText}>
              {lastDetectionAt.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{Math.round(detectedEmotion.confidence * 100)}%</Text>
          </View>
        </View>
      )}

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageWrapper,
                msg.sender === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper,
              ]}
            >
              {msg.sender === 'ai' && (
                <View style={styles.aiAvatarSmall}>
                  <Text style={styles.aiAvatarSmallText}>🤖</Text>
                </View>
              )}

              <View
                style={[
                  styles.messageBubble,
                  msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                {msg.aiEmotion && (
                  <View style={[styles.emotionTag, { backgroundColor: getEmotionColor(msg.aiEmotion) + '20' }]}>
                    <View style={[styles.emotionTagDot, { backgroundColor: getEmotionColor(msg.aiEmotion) }]} />
                    <Text style={[styles.emotionTagText, { color: getEmotionColor(msg.aiEmotion) }]}>
                      {msg.aiEmotion}
                    </Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.messageText,
                    msg.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
                  ]}
                >
                  {msg.text}
                </Text>

                {msg.isVoice && (
                  <View style={styles.voiceTag}>
                    <Text style={styles.voiceTagText}>Voice Message</Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.messageTime,
                    msg.sender === 'user' ? styles.userMessageTime : styles.aiMessageTime,
                  ]}
                >
                  {msg.timestamp.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              {msg.detectedEmotion && msg.sender === 'user' && (
                <View style={styles.userEmotionTag}>
                  <Text style={styles.userEmotionTagText}>{msg.detectedEmotion}</Text>
                </View>
              )}
            </View>
          ))}

          {loading && (
            <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
              <View style={styles.aiAvatarSmall}>
                <Text style={styles.aiAvatarSmallText}>🤖</Text>
              </View>
              <View style={[styles.messageBubble, styles.aiBubble, styles.loadingBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, { animationDelay: '0s' }]} />
                  <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
                  <View style={[styles.typingDot, { animationDelay: '0.4s' }]} />
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Voice Recording Overlay */}
        {isRecording && settings.voiceAnimation && (
          <View style={styles.recordingOverlay}>
            <View style={styles.recordingCard}>
              <VoiceAnimationWave isActive={isRecording} color={COLORS.error} />
              <Text style={styles.recordingText}>Listening & analyzing emotion...</Text>
              <TouchableOpacity style={styles.stopButton} onPress={toggleVoiceRecording}>
                <Text style={styles.stopButtonText}>Stop</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[
              styles.voiceButton,
              isRecording && styles.voiceButtonActive,
              !settings.audioEnabled && styles.buttonDisabled,
            ]}
            onPress={toggleVoiceRecording}
            disabled={!settings.audioEnabled}
            activeOpacity={0.7}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z"
                stroke={isRecording ? COLORS.white : COLORS.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={isRecording ? COLORS.white + '40' : 'none'}
              />
              <Path
                d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V23M8 23H16"
                stroke={isRecording ? COLORS.white : COLORS.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor={COLORS.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
            activeOpacity={0.7}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 8L11 13"
                stroke={message.trim() ? COLORS.white : COLORS.textMuted}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Draggable Video Screen */}
      <DraggableVideoScreen
        isMinimized={isVideoMinimized}
        onToggleMinimize={toggleVideoMode}
        onClose={closeVideo}
        emotionData={detectedEmotion}
        onFrameCaptured={detectEmotionFromFrame}
        captureEnabled={settings.videoEnabled && settings.emotionDetection}
        captureIntervalMs={600}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onSave={handleSettingsSave}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  companionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  companionAvatarText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: SIZES.tiny,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    backgroundColor: COLORS.primary + '15',
  },
  emotionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SIZES.sm,
  },
  emotionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emotionBarText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detectedAtText: {
    fontSize: SIZES.tiny,
    color: COLORS.textMuted,
  },
  emotionBarEmoji: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  confidenceBadge: {
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: SIZES.tiny,
    fontWeight: '600',
    color: COLORS.primary,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SIZES.lg,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: SIZES.md,
    gap: SIZES.sm,
    maxWidth: '85%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiMessageWrapper: {
    alignSelf: 'flex-start',
  },
  aiAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  aiAvatarSmallText: {
    fontSize: 16,
  },
  messageBubble: {
    padding: SIZES.md,
    borderRadius: SIZES.radiusLg,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingBubble: {
    paddingVertical: SIZES.sm,
  },
  emotionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: SIZES.xs,
    gap: 4,
  },
  emotionTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emotionTagText: {
    fontSize: SIZES.tiny,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  messageText: {
    fontSize: SIZES.body,
    lineHeight: 22,
  },
  userMessageText: {
    color: COLORS.white,
  },
  aiMessageText: {
    color: COLORS.textPrimary,
  },
  voiceTag: {
    marginTop: SIZES.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.primaryLight + '20',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  voiceTagText: {
    fontSize: SIZES.tiny,
    color: COLORS.primary,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: SIZES.tiny,
    marginTop: SIZES.xs,
  },
  userMessageTime: {
    color: COLORS.white,
    opacity: 0.7,
    textAlign: 'right',
  },
  aiMessageTime: {
    color: COLORS.textMuted,
  },
  userEmotionTag: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  userEmotionTagText: {
    fontSize: SIZES.tiny,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    padding: SIZES.xs,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
  },
  recordingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  recordingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.xl,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  recordingText: {
    fontSize: SIZES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  stopButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusLg,
  },
  stopButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SIZES.sm,
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
  },
  voiceButtonActive: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInput: {
    fontSize: SIZES.body,
    color: COLORS.textPrimary,
    maxHeight: 80,
    paddingVertical: SIZES.sm,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default CompanionScreen;
