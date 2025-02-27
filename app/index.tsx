import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Alert, Keyboard, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const BrainIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M12 3C9.243 3 7 5.243 7 8v1.25a4.97 4.97 0 0 0-1.428.754A4.967 4.967 0 0 0 2 14c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5a4.967 4.967 0 0 0-3.572-4.996A5 5 0 0 0 17 9.25V8c0-2.757-2.243-5-5-5z" 
      fill="#4B9EF8" 
      opacity={0.3}
    />
    <Path 
      d="M12 22c5.292 0 7-2.108 7-3.5 0-1 0-2.5-2-2.5s-2 1.5-3 1.5c-1 0-2-1-2-2s1-2 2-2 2 1 2 2m-7-2.5c0 1.392 1.708 3.5 7 3.5s7-2.108 7-3.5c0-1-1-2-3-2a4.48 4.48 0 0 0-3 1c-.827.827-1.5 1-2 1s-1.173-.173-2-1a4.48 4.48 0 0 0-3-1c-2 0-3 1-3 2.5z" 
      fill="#2196F3"
    />
    <Circle cx="12" cy="6" r="2" fill="#1976D2" />
  </Svg>
);

const HomeUI = () => {
  const router = useRouter();
  const [participantId, setParticipantId] = useState('');
  const [participantInitials, setParticipantInitials] = useState('');
  const [examinerInitials, setExaminerInitials] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Keyboard listener for better UX
  useEffect(() => {
    const keyboardDidShowListener = Platform.OS === 'ios' 
      ? Keyboard.addListener('keyboardWillShow', () => setKeyboardVisible(true))
      : Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
      
    const keyboardDidHideListener = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', () => setKeyboardVisible(false))
      : Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const validateInputs = () => {
    if (!participantId.trim()) {
      Alert.alert('Missing Information', 'Please enter a Participant ID');
      return false;
    }
    if (!participantInitials.trim()) {
      Alert.alert('Missing Information', 'Please enter Participant Initials');
      return false;
    }
    if (!examinerInitials.trim()) {
      Alert.alert('Missing Information', 'Please enter Examiner Initials');
      return false;
    }
    return true;
  };

  const handleStart = () => {
    if (!validateInputs()) return;
    
    router.push({
      pathname: '../test',
      params: {
        participantId,
        participantInitials,
        examinerInitials,
        startTime: new Date().toISOString(),
      }
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213E', '#0F3460']}
        style={styles.background}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <BrainIcon />
            <Text style={styles.title}>3s Cognitive Assessment</Text>
            <Text style={styles.subtitle}>Neurological Scanning Test</Text>
          </View>

          {/* Main Card */}
          <Card style={styles.card}>
            <View style={styles.inputContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Participant ID</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#4B9EF8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={participantId}
                    onChangeText={setParticipantId}
                    placeholder="Enter Unique Identifier"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    returnKeyType="next"
                    maxLength={20}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Participant Initials</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="text-outline" size={20} color="#4B9EF8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={participantInitials}
                    onChangeText={text => setParticipantInitials(text.toUpperCase())}
                    placeholder="Participant Initials"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    maxLength={5}
                    autoCapitalize="characters"
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Examiner Initials</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="clipboard-outline" size={20} color="#4B9EF8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={examinerInitials}
                    onChangeText={text => setExaminerInitials(text.toUpperCase())}
                    placeholder="Examiner Initials"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    maxLength={5}
                    autoCapitalize="characters"
                    returnKeyType="done"
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.startButton}
                onPress={handleStart}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#4B9EF8', '#2196F3']}
                  style={styles.startButtonGradient}
                >
                  <Text style={styles.startButtonText}>Begin Assessment</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Instructions Button */}
          <TouchableOpacity 
            style={styles.instructionsButton}
            onPress={() => setShowInstructions(true)}
          >
            <Ionicons name="information-circle-outline" size={24} color="#4B9EF8" />
            <Text style={styles.instructionsButtonText}>Test Instructions</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      {/* Instructions Modal */}
      <Modal
        visible={showInstructions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInstructions(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>3s Cognitive Assessment Instructions</Text>
            <ScrollView style={styles.instructionsScrollView}>
              <Text style={styles.instructionText}>
                1. This test assesses your cognitive scanning abilities{'\n'}
                2. You will be presented with a grid of numbers{'\n'}
                3. Your task is to mark all instances of the number 3{'\n'}
                4. Focus on accuracy over speed{'\n'}
                5. Carefully scan the entire grid{'\n'}
                6. Mark each 3 by tapping on the digit{'\n'}
                7. Take your time and be methodical{'\n\n'}
                The goal is to understand your visual scanning and attention to detail.
              </Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeInstructionsButton}
              onPress={() => setShowInstructions(false)}
            >
              <Text style={styles.closeInstructionsText}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  card: {
    backgroundColor: 'rgba(36, 36, 68, 0.8)',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  inputContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
    paddingRight: 12,
  },
  startButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 10,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  instructionsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  instructionsButtonText: {
    color: '#4B9EF8',
    fontSize: 16,
    fontWeight: '500',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionsScrollView: {
    maxHeight: height * 0.5,
  },
  instructionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  closeInstructionsButton: {
    marginTop: 20,
    backgroundColor: '#4B9EF8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeInstructionsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeUI;