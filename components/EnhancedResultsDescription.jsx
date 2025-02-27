import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const EnhancedResultsDescription = ({ currentDigitData, selectedDigit, params }) => {
  // If no currentDigitData is provided, read from params (for backward compatibility)
  const localParams = useLocalSearchParams();
  const allParams = params || localParams;
  
  // Use the selected digit data if provided, otherwise fall back to params
  let leftSideDigits, rightSideDigits, digitCount, columnCounts;
  
  if (currentDigitData) {
    leftSideDigits = currentDigitData.leftSide;
    rightSideDigits = currentDigitData.rightSide;
    digitCount = currentDigitData.digitCount;
    columnCounts = currentDigitData.columnCounts;
  } else {
    // Parse the JSON strings from params (backward compatibility for digit 3)
    leftSideDigits = JSON.parse(allParams.leftSide3s || '[]');
    rightSideDigits = JSON.parse(allParams.rightSide3s || '[]');
    digitCount = parseInt(allParams.digit3Count || '0');
    columnCounts = JSON.parse(allParams.digit3ColumnCount || '[]');
  }
  
  const elapsedTime = allParams.elapsedTime ? parseInt(allParams.elapsedTime) : 0;
  
  // Format elapsed time
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Calculate statistics
  // Page-centered calculations (Columns 1-5 vs 6-10)
  const leftPageCount = (columnCounts || []).slice(0, 5).reduce((a, b) => a + b, 0);
  const rightPageCount = (columnCounts || []).slice(5, 10).reduce((a, b) => a + b, 0);
  
  // We know there are 120 total digits (or fewer) in the 3s test spreadsheet 
  // But for other digits, we need to calculate totals differently
  const TOTAL_PER_DIGIT = {
    0: 98,   // Example: counted from the test data
    1: 108,  // Example: counted from the test data
    2: 82,   // Example: counted from the test data
    3: 120,  // Known from the original test
    4: 103,  // Example: counted from the test data
    5: 95,   // Example: counted from the test data
    6: 86,   // Example: counted from the test data
    7: 93,   // Example: counted from the test data
    8: 88,   // Example: counted from the test data
    9: 91    // Example: counted from the test data
  };
  
  // Get total count for the selected digit (with fallback)
  const totalDigitCount = TOTAL_PER_DIGIT[selectedDigit] || 120;
  const perSide = Math.floor(totalDigitCount / 2);
  
  const leftPageOmissions = perSide - leftPageCount;
  const rightPageOmissions = perSide - rightPageCount;
  const pageCenteredOmission = leftPageOmissions - rightPageOmissions; // Positive means more omissions on left
  
  // String-centered calculations (Within each number, left vs right side of digits)
  const leftStringCount = (leftSideDigits || []).length;
  const rightStringCount = (rightSideDigits || []).length;
  const leftStringOmissions = perSide - leftStringCount;
  const rightStringOmissions = perSide - rightStringCount;
  const stringCenteredOmission = leftStringOmissions - rightStringOmissions; // Positive means more omissions on left
  
  // Format the egocentric scores
  const formatEgocentricScore = (value) => {
    if (value > 0) return `L > R by ${Math.abs(value)}`;
    if (value < 0) return `R > L by ${Math.abs(value)}`;
    return 'Equal (0)';
  };
  
  // Format current date if not provided
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });

  return (
    <Card style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.column}>
          <View style={styles.row}>
            <Text style={styles.label}>Participant ID:</Text>
            <Text style={styles.value}>{allParams.participantId || "XXXXX"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Participant Initials:</Text>
            <Text style={styles.value}>{allParams.participantInitials || "XXXX"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{currentDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Examiner Initials:</Text>
            <Text style={styles.value}>{allParams.examinerInitials || "XXXX"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>{timeDisplay}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.column}>
          <View style={styles.row}>
            <Text style={styles.totalsLabel}>Selected Digit:</Text>
            <Text style={styles.selectedDigit}>{selectedDigit}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.totalsLabel}>Total crossed {selectedDigit}s:</Text>
            <Text style={styles.totalsValue}>{digitCount}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.totalsLabel}>Total omissions:</Text>
            <Text style={styles.totalsValue}>{totalDigitCount - digitCount}</Text>
          </View>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Page-centered</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.subLabel}>(a) Marked {selectedDigit}s on Left:</Text>
            <Text style={styles.subValue}>{leftPageCount}</Text>
            <Text style={styles.subLabel}>(b) Marked {selectedDigit}s on Right:</Text>
            <Text style={styles.subValue}>{rightPageCount}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.egocentricLabel}>Egocentric score: {formatEgocentricScore(pageCenteredOmission)}</Text>
          </View>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>String-centered</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.subLabel}>(c) Marked {selectedDigit}s on Left:</Text>
            <Text style={styles.subValue}>{leftStringCount}</Text>
            <Text style={styles.subLabel}>(d) Marked {selectedDigit}s on Right:</Text>
            <Text style={styles.subValue}>{rightStringCount}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.egocentricLabel}>Egocentric score: {formatEgocentricScore(stringCenteredOmission)}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginVertical: 16,
    borderRadius: 16,
    elevation: 2,
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#888',
    overflow: 'hidden',
  },
  innerContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  column: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginRight: 4,
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  totalsLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4,
  },
  totalsValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedDigit: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B9EF8',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 4,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textDecorationLine: 'underline',
  },
  subLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
    flex: 2,
  },
  subValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
    flex: 1,
  },
  egocentricLabel: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#333',
    marginTop: 2,
    marginBottom: 8,
  },
});

export default EnhancedResultsDescription;