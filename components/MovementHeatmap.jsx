import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MovementHeatmap = ({ pressedCoordinates, digit3Positions }) => {
  // Create a 10x14 grid to match the test layout
  const gridRows = 14;
  const gridCols = 10;
  
  // Initialize grid with zeros
  const heatmapData = Array(gridRows).fill()
    .map(() => Array(gridCols).fill(0));
  
  // Fill the grid with click frequency
  pressedCoordinates.forEach(coord => {
    const { row, col } = coord;
    if (row < gridRows && col < gridCols) {
      heatmapData[row][col] += 1;
    }
  });
  
  // Find max value for normalization
  const maxValue = Math.max(
    ...heatmapData.map(row => Math.max(...row)),
    1 // Ensure we don't divide by zero
  );
  
  return (
    <Card style={styles.card}>
      <Card.Title title="Movement Heatmap" titleStyle={styles.cardTitle} />
      <Card.Content style={styles.cardContent}>
        <View style={styles.heatmapContainer}>
          {heatmapData.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.heatmapRow}>
              {row.map((value, colIndex) => {
                // Normalize value between 0 and 1
                const intensity = value / maxValue;
                
                // Check if this position contains a 3 that was clicked
                const isDigit3 = digit3Positions.some(
                  pos => pos.row === rowIndex && pos.col === colIndex
                );
                
                return (
                  <View 
                    key={`cell-${rowIndex}-${colIndex}`} 
                    style={styles.heatmapCell}
                  >
                    <LinearGradient
                      colors={
                        isDigit3 
                          ? ['rgba(255, 152, 0, 0.2)', `rgba(255, 87, 34, ${0.3 + (intensity * 0.7)})`]
                          : ['rgba(33, 150, 243, 0.1)', `rgba(33, 150, 243, ${0.2 + (intensity * 0.5)})`]
                      }
                      style={styles.cellGradient}
                    >
                      {value > 0 && (
                        <Text style={styles.cellText}>
                          {value}
                        </Text>
                      )}
                    </LinearGradient>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <LinearGradient
              colors={['rgba(33, 150, 243, 0.1)', 'rgba(33, 150, 243, 0.7)']}
              style={styles.legendColor}
            />
            <Text style={styles.legendText}>Regular Clicks</Text>
          </View>
          <View style={styles.legendItem}>
            <LinearGradient
              colors={['rgba(255, 152, 0, 0.2)', 'rgba(255, 87, 34, 1)']}
              style={styles.legendColor}
            />
            <Text style={styles.legendText}>Number 3 Clicks</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
    borderRadius: 12,
    marginVertical: 12,
    marginHorizontal: 8,
  },
  cardTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContent: {
    padding: 8,
  },
  heatmapContainer: {
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  heatmapRow: {
    flexDirection: 'row',
    height: Math.max(20, (width / 10) * 0.6), // Adjust height based on width
  },
  heatmapCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cellGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#333333',
  },
});

export default MovementHeatmap;