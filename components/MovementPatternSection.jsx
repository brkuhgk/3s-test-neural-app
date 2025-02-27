import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Card } from 'react-native-paper';
import MovementHeatmap from './MovementHeatmap';
import MovementPathAnalysis from './MovementPathAnalysis';

const MovementPatternSection = () => {
  const params = useLocalSearchParams();
  
  // Parse the JSON strings from params
  const leftSide3s = JSON.parse(params.leftSide3s || '[]');
  const rightSide3s = JSON.parse(params.rightSide3s || '[]');
  const pressedCoordinates = JSON.parse(params.pressedCoordinates || '[]');
  const elapsedTime = params.elapsedTime ? parseInt(params.elapsedTime) : 0;
  
  // Combine all positions with digit 3
  const digit3Positions = [...leftSide3s, ...rightSide3s];
  
  return (
    <View style={styles.container}>
      <Card style={styles.sectionHeader}>
        <Card.Content>
          <Text style={styles.sectionTitle}>User Movement Analysis</Text>
          <Text style={styles.sectionDescription}>
            This section shows detailed analysis of user click patterns to help identify scanning 
            strategies and optimize test-taking performance.
          </Text>
        </Card.Content>
      </Card>
      
      <MovementHeatmap 
        pressedCoordinates={pressedCoordinates}
        digit3Positions={digit3Positions}
      />
      
      <MovementPathAnalysis 
        pressedCoordinates={pressedCoordinates}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionHeader: {
    backgroundColor: '#4B9EF8',
    marginHorizontal: 8,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default MovementPatternSection;