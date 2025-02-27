import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ClickPathVisualization from './ClickPathVisualization';
import OptimizedHeatmap from './OptimizedHeatmap';
import EnhancedResultsDescription from './EnhancedResultsDescription';

const FinalResultsIntegration = ({ currentDigitData, selectedDigit, params }) => {
  // If no currentDigitData is provided, read from params (for backward compatibility)
  const localParams = useLocalSearchParams();
  const allParams = params || localParams;
  
  // Parse the JSON strings from params
  const pressedCoordinates = JSON.parse(allParams.pressedCoordinates || '[]');
  
  // Use either passed currentDigitData or parse from params
  const leftSideDigits = currentDigitData ? currentDigitData.leftSide : JSON.parse(allParams.leftSide3s || '[]');
  const rightSideDigits = currentDigitData ? currentDigitData.rightSide : JSON.parse(allParams.rightSide3s || '[]');
  
  // Combine all positions with selected digit
  const digitPositions = [...leftSideDigits, ...rightSideDigits];
  
  // Performance optimization - avoid expensive processing for large datasets
  const shouldShowDetailedVisualization = pressedCoordinates.length <= 300;
  
  return (
    <ScrollView style={styles.scrollContainer}>
      {/* Enhanced Results Summary */}
      <EnhancedResultsDescription 
        currentDigitData={currentDigitData}
        selectedDigit={selectedDigit}
        params={allParams}
      />
      
      {/* Visualizations Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Movement Analysis</Text>
        <Text style={styles.sectionDescription}>
          Visualizations showing click patterns and user movement across the grid
        </Text>
      </View>
      
      {/* Only show detailed path for smaller datasets to maintain performance */}
      {shouldShowDetailedVisualization ? (
        <ClickPathVisualization 
          pressedCoordinates={pressedCoordinates}
          highlightedDigit={selectedDigit.toString()}
        />
      ) : (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Detailed path visualization is disabled for large datasets ({pressedCoordinates.length} clicks) 
            to maintain app performance. The heatmap below provides an optimized summary.
          </Text>
        </View>
      )}

      {/* Heatmap View - Optimized for all datasets */}
      <OptimizedHeatmap 
        pressedCoordinates={pressedCoordinates}
        digit3Positions={digitPositions}
        selectedDigit={selectedDigit.toString()}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  sectionHeader: {
    backgroundColor: '#4B9EF8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#FFF8E1',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB300',
  },
  infoText: {
    color: '#5D4037',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default FinalResultsIntegration;