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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const CompanionScreen = ({ navigation, route }) => {
  const { companionName = 'MindBuilder' } = route?.params || {};
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: `Hello! I'm ${companionName}, your emotional support companion. How can I assist you today?`,
      sender: 'ai',
      timestamp: new Date(),
      emotion: 'neutral',
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState('neutral');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: "I understand how you're feeling. Let's explore that together.",
        sender: 'ai',
        timestamp: new Date(),
        emotion: 'empathetic',
      };
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1000);
  };

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording
      Alert.alert('Voice Recording', 'Voice input feature will be integrated with emotion detection ML model');
    } else {
      // Stop recording
      Alert.alert('Processing', 'Analyzing your voice for emotional context...');
    }
  };

  const toggleVideoMode = () => {
    setIsVideoActive(!isVideoActive);
    if (!isVideoActive) {
      Alert.alert('Video Mode', 'Video emotion detection will be integrated with ML model');
    }
  };

  const getEmotionColor = (emotion) => {
    const emotionColors = {
      happy: COLORS.success,
      sad: COLORS.info,
      angry: COLORS.error,
      neutral: COLORS.textSecondary,
      empathetic: COLORS.secondary,
    };
    return emotionColors[emotion] || COLORS.textSecondary;
  };

  const getEmotionIcon = (emotion) => {
    const emotionIcons = {
      happy: '😊',
      sad: '😔',
      angry: '😠',
      neutral: '😐',
      empathetic: '🤗',
    };
    return emotionIcons[emotion] || '💬';
  };

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.headerButton}>
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.companionAvatar}>
              <Text style={styles.companionAvatarText}>🤖</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>{companionName}</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            onPress={toggleVideoMode}
            style={styles.headerButton}>
            <Text style={styles.headerIcon}>{isVideoActive ? '📹' : '📷'}</Text>
          </TouchableOpacity>
        </View>

        {/* Video/Emotion Display Area */}
        {isVideoActive && (
          <View style={styles.videoContainer}>
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoIcon}>📹</Text>
              <Text style={styles.videoText}>Video Mode Active</Text>
              <Text style={styles.videoSubtext}>
                Camera feed will appear here for facial emotion detection
              </Text>
            </View>
            <View style={styles.emotionIndicator}>
              <Text style={styles.emotionIcon}>{getEmotionIcon(detectedEmotion)}</Text>
              <Text style={styles.emotionText}>Detected: {detectedEmotion}</Text>
            </View>
          </View>
        )}

        {/* Messages Container */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}>
          
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
              ]}>
              {msg.sender === 'ai' && msg.emotion && (
                <View style={styles.messageEmotionTag}>
                  <Text style={[
                    styles.emotionTagText,
                    { color: getEmotionColor(msg.emotion) }
                  ]}>
                    {getEmotionIcon(msg.emotion)} {msg.emotion}
                  </Text>
                </View>
              )}
              <Text style={[
                styles.messageText,
                msg.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
              ]}>
                {msg.text}
              </Text>
              <Text style={[
                styles.messageTime,
                msg.sender === 'user' ? styles.userMessageTime : styles.aiMessageTime,
              ]}>
                {msg.timestamp.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))}

          {loading && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.aiMessageText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
            onPress={toggleVoiceRecording}
            activeOpacity={0.7}>
            <Text style={styles.voiceIcon}>{isRecording ? '⏹️' : '🎤'}</Text>
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
            activeOpacity={0.7}>
            <LinearGradient
              colors={message.trim() ? [COLORS.primary, COLORS.primaryDark] : [COLORS.border, COLORS.border]}
              style={styles.sendButtonGradient}>
              <Text style={styles.sendIcon}>➤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingTop: SIZES.xxl,
    paddingBottom: SIZES.md,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 20,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  companionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companionAvatarText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs / 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.active,
  },
  statusText: {
    fontSize: SIZES.tiny,
    color: COLORS.textSecondary,
  },
  videoContainer: {
    backgroundColor: COLORS.surface,
    margin: SIZES.md,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  videoPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: SIZES.lg,
  },
  videoIcon: {
    fontSize: 48,
    marginBottom: SIZES.sm,
  },
  videoText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  videoSubtext: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emotionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    gap: SIZES.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  emotionIcon: {
    fontSize: 24,
  },
  emotionText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SIZES.md,
    paddingBottom: SIZES.lg,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: SIZES.md,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    ...SHADOWS.small,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.userBubble,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.aiBubble,
  },
  messageEmotionTag: {
    marginBottom: SIZES.xs,
  },
  emotionTagText: {
    fontSize: SIZES.tiny,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: SIZES.body,
    lineHeight: SIZES.body * 1.4,
  },
  userMessageText: {
    color: COLORS.userBubbleText,
  },
  aiMessageText: {
    color: COLORS.aiBubbleText,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SIZES.md,
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
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  voiceButtonActive: {
    backgroundColor: COLORS.error,
  },
  voiceIcon: {
    fontSize: 24,
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInput: {
    fontSize: SIZES.body,
    color: COLORS.textPrimary,
    maxHeight: 80,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
});

export default CompanionScreen;
