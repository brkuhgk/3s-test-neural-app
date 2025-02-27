import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Define the grid data (same as in test screen)
const gridData = [
  [8103, 83727895, 769158, 31678925, 3294059, 73914, 3512407, 8089170, 1992939, 2120],
  [4567, 8092573, 45013, 29758, 530345, 618475, 12445683, 30127987, 366305, 297539],
  [139723, 45298716, 3295870, 3980, 253970, 579340, 6138, 432063, 81924982, 6583],
  [9813, 32145678, 84673, 139475, 58145469, 13820, 37428981, 63017980, 45607, 13925647],
  [34602458, 3643, 83921, 4512693, 4698723, 836438, 5801, 89063, 23972165, 3263],
  [42915, 5853, 72631, 34670654, 36135, 4626071, 83959, 4959398, 68130, 6301],
  [987302, 9672, 4286158, 7807347, 675246, 946053, 2002193, 6004745, 35671, 1061],
  [5732186, 45013, 84203, 56239, 671302, 3004, 38672168, 80873, 4108, 371903],
  [6837, 183820, 43612063, 90542145, 784352, 3956, 23781, 198378, 187123, 6004216],
  [3407, 1792635, 4067903, 98103, 5624, 780523, 56792604, 37801, 6356791, 93956467],
  [431025, 4297589, 83961, 56465421, 6138940, 4295901, 6476023, 97654985, 13283, 21243],
  [613947, 43169857, 4302, 3251673, 70765583, 760536, 37821245, 4623, 1308418, 9212494],
  [8077, 3824510, 53906, 4389, 80610972, 3120, 760530, 3940, 8405737, 89203],
  [579103, 970943, 42057, 87652143, 3048, 497538, 1230, 93745125, 19081257, 23456],
];

// Function to check if a number contains a '3'
const hasDigitThree = (number) => {
  return number.toString().includes('3');
};

// Calculate color based on intensity (0-1 range) - UPDATED for better visibility
const getHeatMapColor = (intensity, isDigit3) => {
  if (isDigit3) {
    // Red-based gradient for cells containing 3s - reduced opacity
    if (intensity === 0) return 'rgba(255, 243, 224, 0.4)'; // Very light orange background
    if (intensity < 0.25) return `rgba(255, 138, 101, ${0.2 + intensity * 0.4})`;
    if (intensity < 0.5) return `rgba(255, 112, 67, ${0.25 + intensity * 0.35})`;
    if (intensity < 0.75) return `rgba(255, 87, 34, ${0.3 + intensity * 0.3})`;
    return `rgba(230, 74, 25, ${0.35 + intensity * 0.25})`;
  } else {
    // Blue-based gradient for regular cells - reduced opacity
    if (intensity === 0) return 'rgba(255, 255, 255, 0.3)'; // Almost white background
    if (intensity < 0.25) return `rgba(187, 222, 251, ${0.2 + intensity * 0.4})`;
    if (intensity < 0.5) return `rgba(100, 181, 246, ${0.25 + intensity * 0.35})`;
    if (intensity < 0.75) return `rgba(33, 150, 243, ${0.3 + intensity * 0.3})`;
    return `rgba(25, 118, 210, ${0.35 + intensity * 0.25})`;
  }
};

const OptimizedHeatmap = ({ pressedCoordinates, digit3Positions }) => {
  // Create heatmap data structure with memoization for performance
  const heatmapData = useMemo(() => {
    if (!pressedCoordinates || pressedCoordinates.length === 0) {
      return null;
    }

    // Initialize grid with zeros
    const heatmap = Array(14).fill().map(() => Array(10).fill(0));
    
    // Count clicks per cell
    pressedCoordinates.forEach(coord => {
      if (coord && Number.isFinite(coord.row) && Number.isFinite(coord.col) &&
          coord.row >= 0 && coord.row < 14 && coord.col >= 0 && coord.col < 10) {
        heatmap[coord.row][coord.col]++;
      }
    });
    
    // Find max value for normalization
    const maxValue = Math.max(
      ...heatmap.map(row => Math.max(...row)),
      1 // Ensure we don't divide by zero
    );
    
    return { heatmap, maxValue };
  }, [pressedCoordinates]);
  
  // Create set of digit3 coordinates for quick lookup
  const digit3Cells = useMemo(() => {
    const set = new Set();
    
    if (digit3Positions && digit3Positions.length > 0) {
      digit3Positions.forEach(pos => {
        if (pos && Number.isFinite(pos.row) && Number.isFinite(pos.col)) {
          set.add(`${pos.row}-${pos.col}`);
        }
      });
    }
    
    return set;
  }, [digit3Positions]);
  
  // Calculate metrics for the heatmap
  const metrics = useMemo(() => {
    if (!heatmapData) return null;
    
    const { heatmap, maxValue } = heatmapData;
    let totalClicks = 0;
    let maxCellClicks = 0;
    let maxCellCoord = { row: 0, col: 0 };
    let totalCellsClicked = 0;
    
    // Collect metrics
    heatmap.forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        if (cellValue > 0) {
          totalClicks += cellValue;
          totalCellsClicked++;
          
          if (cellValue > maxCellClicks) {
            maxCellClicks = cellValue;
            maxCellCoord = { row: rowIndex, col: colIndex };
          }
        }
      });
    });
    
    // Calculate coverage percentage
    const coveragePercentage = Math.round((totalCellsClicked / 140) * 100);
    
    return {
      totalClicks,
      maxCellClicks,
      maxCellCoord,
      coveragePercentage
    };
  }, [heatmapData]);
  
  // Fallback if there's no data
  if (!heatmapData) {
    return (
      <Card style={styles.card}>
        <Card.Title title="Movement Heatmap" titleStyle={styles.cardTitle} />
        <Card.Content style={styles.cardContent}>
          <Text style={styles.noDataText}>No movement data available to visualize.</Text>
        </Card.Content>
      </Card>
    );
  }
  
  // Calculate optimal cell dimensions
  const cellWidth = (width - 32) / 10; // 10 columns
  const cellHeight = cellWidth * 0.7; // Aspect ratio

  return (
    <Card style={styles.card}>
      <Card.Title title="Movement Heatmap" titleStyle={styles.cardTitle} />
      <Card.Content style={styles.cardContent}>
        {/* Heatmap grid with background numbers */}
        <View style={styles.heatmapContainer}>
          {gridData.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((cell, colIndex) => {
                const cellValue = heatmapData.heatmap[rowIndex][colIndex];
                const intensity = cellValue / heatmapData.maxValue;
                const hasThree = hasDigitThree(cell);
                const isClicked = cellValue > 0;
                
                // Determine cell background color
                const backgroundColor = getHeatMapColor(intensity, hasThree);
                
                // Determine text color based on background intensity
                const textColor = intensity > 0.5 ? '#FFFFFF' : '#333333';
                
                return (
                  <View 
                    key={`cell-${rowIndex}-${colIndex}`} 
                    style={[
                      styles.cell, 
                      { 
                        width: cellWidth, 
                        height: cellHeight,
                        backgroundColor: backgroundColor,
                        borderColor: hasThree ? '#FFB74D' : '#E0E0E0',
                        borderWidth: hasThree ? 1 : 0.5,
                      }
                    ]}
                  >
                    {/* Background number - IMPROVED VISIBILITY */}
                    <Text 
                      style={[
                        styles.cellText,
                        { 
                          fontSize: Math.min(cellWidth / (cell.toString().length + 1), 10),
                          color: hasThree ? 'rgba(180, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                          opacity: 0.85,
                          fontWeight: hasThree ? '600' : '400'
                        }
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="clip"
                    >
                      {cell}
                    </Text>
                    
                    {/* Click count overlay - IMPROVED VISIBILITY */}
                    {isClicked && (
                      <View style={[styles.clickCountContainer, { 
                        backgroundColor: 'rgba(0, 0, 0, 0.15)',
                        borderWidth: 1,
                        borderColor: 'rgba(0, 0, 0, 0.1)'
                      }]}>
                        <Text 
                          style={[
                            styles.clickCount, 
                            { 
                              color: intensity > 0.5 ? '#FFFFFF' : '#333333',
                              fontWeight: '700'
                            }
                          ]}
                        >
                          {cellValue}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        
        {/* Metrics section */}
        {metrics && (
          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Total Clicks</Text>
                <Text style={styles.metricValue}>{metrics.totalClicks}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Grid Coverage</Text>
                <Text style={styles.metricValue}>{metrics.coveragePercentage}%</Text>
              </View>
            </View>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Most Clicked Cell</Text>
                <Text style={styles.metricValue}>
                  {`(${metrics.maxCellCoord.row},${metrics.maxCellCoord.col}): ${metrics.maxCellClicks}`}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Legend with improved visibility */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <LinearGradient
              colors={['rgba(187, 222, 251, 0.4)', 'rgba(25, 118, 210, 0.6)']}
              style={styles.legendGradient}
              start={[0, 0]}
              end={[1, 0]}
            />
            <Text style={styles.legendText}>Regular Cell Clicks (Low → High)</Text>
          </View>
          <View style={styles.legendItem}>
            <LinearGradient
              colors={['rgba(255, 138, 101, 0.4)', 'rgba(230, 74, 25, 0.6)']}
              style={styles.legendGradient}
              start={[0, 0]}
              end={[1, 0]}
            />
            <Text style={styles.legendText}>Cells with "3" Clicks (Low → High)</Text>
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
    overflow: 'hidden',
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
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10,
    overflow: 'hidden',
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cellText: {
    textAlign: 'center',
    position: 'absolute',
  },
  clickCountContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 4,
    padding: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  clickCount: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
    padding: 20,
  },
  metricsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    padding: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  legendContainer: {
    marginTop: 16,
    padding: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendGradient: {
    width: 80,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
});

export default OptimizedHeatmap;