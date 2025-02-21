import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Alert, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const HomeUI = () => {
  const router = useRouter();
  const [participantId, setParticipantId] = useState('');
  const [participantInitials, setParticipantInitials] = useState('');
  const [examinerInitials, setExaminerInitials] = useState('');
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!timerStarted) {
      setTimerStarted(true);
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
  
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timerStarted]);
  console.log(elapsedTime);
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
    
    setShowCountdown(true);
    startCountdown();
  };

  const startCountdown = () => {
    let count = 3;
    setCountdownNumber(count);

    const interval = setInterval(() => {
      count--;
      setCountdownNumber(count);

      if (count === 0) {
        clearInterval(interval);
        setTimeout(() => {
          setShowCountdown(false);
          router.push({
            pathname: '../test',
            params: {
              participantId,
              participantInitials,
              examinerInitials,
              startTime: new Date().toISOString(),
            }
          });
        }, 1000);
      }
    }, 1000);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Card style={styles.card}>
        <View style={styles.headerContainer}>
          <Ionicons name="document-text-outline" size={32} color="#4B9EF8" />
          <Card.Title 
            title="3s Spreadsheet Test" 
            titleStyle={styles.title}
          />
        </View>
        
        <Card.Content>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Participant ID</Text>
              <TextInput
                style={styles.input}
                value={participantId}
                onChangeText={setParticipantId}
                placeholder="Enter Participant ID"
                placeholderTextColor="rgba(255,255,255,0.5)"
                returnKeyType="next"
                maxLength={20}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Participant Initials</Text>
              <TextInput
                style={styles.input}
                value={participantInitials}
                onChangeText={text => setParticipantInitials(text.toUpperCase())}
                placeholder="Enter Participant Initials"
                placeholderTextColor="rgba(255,255,255,0.5)"
                maxLength={5}
                autoCapitalize="characters"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Examiner Initials</Text>
              <TextInput
                style={styles.input}
                value={examinerInitials}
                onChangeText={text => setExaminerInitials(text.toUpperCase())}
                placeholder="Enter Examiner Initials"
                placeholderTextColor="rgba(255,255,255,0.5)"
                maxLength={5}
                autoCapitalize="characters"
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity 
              style={styles.startButton}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>Start Test</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Instructions Card */}
      <Card style={[styles.card, styles.instructionsCard]}>
        <Card.Content>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <Text style={styles.instructionsText}>
            1. Fill in all required fields above{'\n'}
            2. Click "Start Test" when ready{'\n'}
            3. A 3-second countdown will begin{'\n'}
            4. Mark all number 3's you find on the next screen{'\n'}
            5. Focus on accuracy over speed
          </Text>
        </Card.Content>
      </Card>

      {/* Countdown Modal */}
      <Modal
        visible={showCountdown}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>{countdownNumber}</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#242444',
    elevation: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 10,
  },
  formContainer: {
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  startButton: {
    backgroundColor: '#4B9EF8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownContainer: {
    width: 150,
    height: 150,
    backgroundColor: '#242444',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#4B9EF8',
  },
  countdownText: {
    color: '#fff',
    fontSize: 72,
    fontWeight: 'bold',
  },
  instructionsCard: {
    backgroundColor: '#242444',
    marginTop: 16,
  },
  instructionsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 24,
  },
});

export default HomeUI;