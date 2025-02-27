import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const DigitSelector = ({ selectedDigit, onDigitChange }) => {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Digit:</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {digits.map((digit) => (
          <TouchableOpacity
            key={digit}
            style={[
              styles.digitButton,
              selectedDigit === digit && styles.selectedDigitButton
            ]}
            onPress={() => onDigitChange(digit)}
          >
            <Text 
              style={[
                styles.digitText,
                selectedDigit === digit && styles.selectedDigitText
              ]}
            >
              {digit}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  digitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedDigitButton: {
    backgroundColor: '#4B9EF8',
    borderColor: '#4B9EF8',
  },
  digitText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  selectedDigitText: {
    color: '#fff',
  },
});

export default DigitSelector;