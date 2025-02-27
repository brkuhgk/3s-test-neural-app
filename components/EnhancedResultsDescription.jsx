import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const EnhancedResultsDescription = () => {
  const params = useLocalSearchParams();
  
  // Parse the JSON strings from params
  const leftSide3s = JSON.parse(params.leftSide3s  || '[]');
  const rightSide3s = JSON.parse(params.rightSide3s  || '[]');
  const digit3Count = parseInt(params.digit3Count || '0');
  const columnCounts = JSON.parse(params.digit3ColumnCount  || '[]');
  const elapsedTime = params.elapsedTime ? parseInt(params.elapsedTime ) : 0;
  
  // Format elapsed time
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Calculate statistics
  // Page-centered calculations (Columns 1-5 vs 6-10)
  const leftPageCount = columnCounts.slice(0, 5).reduce((a, b) => a + b, 0);
  const rightPageCount = columnCounts.slice(5, 10).reduce((a, b) => a + b, 0);
  const leftPageOmissions = 60 - leftPageCount;
  const rightPageOmissions = 60 - rightPageCount;
  const pageCenteredOmission = leftPageOmissions - rightPageOmissions; // Positive means more omissions on left
  
  // String-centered calculations (Within each number, left vs right side of digits)
  const leftStringCount = leftSide3s.length;
  const rightStringCount = rightSide3s.length;
  const leftStringOmissions = 60 - leftStringCount;
  const rightStringOmissions = 60 - rightStringCount;
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
            <Text style={styles.value}>{params.participantId || "XXXXX"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Participant Initials:</Text>
            <Text style={styles.value}>{params.participantInitials || "XXXX"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{currentDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Examiner Initials:</Text>
            <Text style={styles.value}>{params.examinerInitials || "XXXX"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>{timeDisplay}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.column}>
          <View style={styles.row}>
            <Text style={styles.totalsLabel}>Total crossed 3s:</Text>
            <Text style={styles.totalsValue}>{digit3Count}</Text>
          </View>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Page-centered</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.subLabel}>(a) Marked 3s on Left:</Text>
            <Text style={styles.subValue}>{leftPageCount}</Text>
            <Text style={styles.subLabel}>(b) Marked 3s on Right:</Text>
            <Text style={styles.subValue}>{rightPageCount}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.egocentricLabel}>Egocentric score: {formatEgocentricScore(pageCenteredOmission)}</Text>
          </View>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>String-centered</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.subLabel}>(c) Marked 3s on Left:</Text>
            <Text style={styles.subValue}>{leftStringCount}</Text>
            <Text style={styles.subLabel}>(d) Marked 3s on Right:</Text>
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