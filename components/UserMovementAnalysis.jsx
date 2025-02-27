import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Card } from 'react-native-paper';
import ClickPathVisualization from './ClickPathVisualization';
import OptimizedHeatmap from './OptimizedHeatmap';


const UserMovementAnalysis = () => {
  const params = useLocalSearchParams();
  
  // Parse the JSON strings from params
  const pressedCoordinates = JSON.parse(params.pressedCoordinates || '[]');
  const leftSide3s = JSON.parse(params.leftSide3s || '[]');
  const rightSide3s = JSON.parse(params.rightSide3s || '[]');
  // Combine all positions with digit 3
  const digit3Positions = [...leftSide3s, ...rightSide3s];

   // Performance optimization - avoid expensive processing for large datasets
   const shouldShowDetailedVisualization = pressedCoordinates.length <= 300;

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.headerTitle}>Spreadsheet Movement Analysis</Text>
          <Text style={styles.headerSubtitle}>
            This visualization shows the exact path of user clicks across the grid.
            Numbers indicate the sequence of clicks, and red circles highlight when a digit "3" was clicked.
          </Text>
        </Card.Content>
      </Card>
      
      {/* Heatmap View - Optimized for all datasets */}
      <OptimizedHeatmap 
        pressedCoordinates={pressedCoordinates}
        digit3Positions={digit3Positions}
      />

      {/* <ClickPathVisualization 
        pressedCoordinates={pressedCoordinates}
      /> */}

      {/* Only show detailed path for smaller datasets to maintain performance */}
      {shouldShowDetailedVisualization ? (
        <ClickPathVisualization 
          pressedCoordinates={pressedCoordinates}
        />
      ) : (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoText}>
              Detailed path visualization is disabled for large datasets ({pressedCoordinates.length} clicks) 
              to maintain app performance. The heatmap above provides an optimized summary.
            </Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  headerCard: {
    backgroundColor: '#4B9EF8',
    marginHorizontal: 8,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default UserMovementAnalysis;