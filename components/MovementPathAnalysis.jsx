import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card } from 'react-native-paper';
import { LineChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

const MovementPathAnalysis = ({ pressedCoordinates }) => {
  // Generate a timeline of user's movement patterns
  const timelineData = useMemo(() => {
    if (!pressedCoordinates || pressedCoordinates.length < 2) {
      return {
        rowDirectionData: [],
        colDirectionData: [],
        timeIntervalData: [],
        averageTimeInterval: 0,
      };
    }

    // Calculate time intervals between clicks
    const timeIntervals = [];
    for (let i = 1; i < pressedCoordinates.length; i++) {
      const timeInterval = (pressedCoordinates[i].timestamp - pressedCoordinates[i-1].timestamp) / 1000; // in seconds
      timeIntervals.push(timeInterval);
    }

    // Calculate row and column movement directions
    const rowDirections = [];
    const colDirections = [];
    for (let i = 1; i < pressedCoordinates.length; i++) {
      const rowDiff = pressedCoordinates[i].row - pressedCoordinates[i-1].row;
      const colDiff = pressedCoordinates[i].col - pressedCoordinates[i-1].col;
      
      rowDirections.push({
        value: rowDiff,
        label: i % 5 === 0 ? `${i}` : '',
        frontColor: rowDiff > 0 ? '#4CAF50' : rowDiff < 0 ? '#F44336' : '#9E9E9E',
      });
      
      colDirections.push({
        value: colDiff,
        label: i % 5 === 0 ? `${i}` : '',
        frontColor: colDiff > 0 ? '#2196F3' : colDiff < 0 ? '#FF9800' : '#9E9E9E',
      });
    }

    // Data for time interval chart
    const timeIntervalData = timeIntervals.map((interval, index) => ({
      value: Math.min(interval, 5), // Cap at 5 seconds for better visualization
      label: (index + 1) % 5 === 0 ? `${index + 1}` : '',
      frontColor: interval > 2 ? '#F44336' : interval > 1 ? '#FF9800' : '#4CAF50',
    }));

    const averageTimeInterval = timeIntervals.length > 0
      ? (timeIntervals.reduce((sum, val) => sum + val, 0) / timeIntervals.length).toFixed(2)
      : 0;

    return {
      rowDirectionData: rowDirections,
      colDirectionData: colDirections,
      timeIntervalData,
      averageTimeInterval,
    };
  }, [pressedCoordinates]);

  // Calculate efficiency metrics
  const metrics = useMemo(() => {
    if (!pressedCoordinates || pressedCoordinates.length < 2) {
      return {
        directionalChanges: 0,
        consistencyScore: 0,
        patternType: 'Not enough data',
      };
    }

    // Count directional changes
    let rowDirectionChanges = 0;
    let colDirectionChanges = 0;
    let prevRowDiff = null;
    let prevColDiff = null;

    for (let i = 1; i < pressedCoordinates.length; i++) {
      const rowDiff = pressedCoordinates[i].row - pressedCoordinates[i-1].row;
      const colDiff = pressedCoordinates[i].col - pressedCoordinates[i-1].col;
      
      if (prevRowDiff !== null && (
        (prevRowDiff > 0 && rowDiff < 0) || 
        (prevRowDiff < 0 && rowDiff > 0)
      )) {
        rowDirectionChanges++;
      }
      
      if (prevColDiff !== null && (
        (prevColDiff > 0 && colDiff < 0) || 
        (prevColDiff < 0 && colDiff > 0)
      )) {
        colDirectionChanges++;
      }
      
      prevRowDiff = rowDiff;
      prevColDiff = colDiff;
    }

    const totalDirectionalChanges = rowDirectionChanges + colDirectionChanges;
    
    // Calculate consistency score (lower is better, fewer direction changes)
    const possibleChanges = (pressedCoordinates.length - 2) * 2; // Maximum possible direction changes
    const consistencyScore = possibleChanges > 0
      ? (100 - (totalDirectionalChanges / possibleChanges * 100)).toFixed(1)
      : 100;
    
    // Determine pattern type
    let patternType = 'Mixed';
    if (rowDirectionChanges < colDirectionChanges * 0.5) {
      patternType = 'Horizontal Scanning';
    } else if (colDirectionChanges < rowDirectionChanges * 0.5) {
      patternType = 'Vertical Scanning';
    } else if (colDirectionChanges < 5 && rowDirectionChanges < 5) {
      patternType = 'Diagonal Scanning';
    }

    return {
      directionalChanges: totalDirectionalChanges,
      consistencyScore,
      patternType,
    };
  }, [pressedCoordinates]);

  return (
    <Card style={styles.card}>
      <Card.Title title="Movement Path Analysis" titleStyle={styles.cardTitle} />
      <Card.Content style={styles.cardContent}>
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Pattern Type:</Text>
            <Text style={styles.metricValue}>{metrics.patternType}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Consistency Score:</Text>
            <Text style={styles.metricValue}>{metrics.consistencyScore}%</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Avg. Time Between Clicks:</Text>
            <Text style={styles.metricValue}>{timelineData.averageTimeInterval}s</Text>
          </View>
        </View>

        {pressedCoordinates && pressedCoordinates.length >= 2 && (
          <>
            <Text style={styles.chartTitle}>Row Movement (+ = Down, - = Up)</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={timelineData.rowDirectionData.slice(0, 30)} // Limit to 30 for better display
                hideDataPoints
                spacing={10}
                color="#4CAF50"
                thickness={2}
                startFillColor="rgba(76, 175, 80, 0.3)"
                endFillColor="rgba(76, 175, 80, 0.01)"
                initialSpacing={10}
                noOfSections={4}
                maxValue={4}
                minValue={-4}
                yAxisColor="rgba(0,0,0,0.1)"
                yAxisTextStyle={{ color: '#333' }}
                xAxisColor="rgba(0,0,0,0.1)"
                xAxisTextStyle={{ color: '#333' }}
                width={width - 60}
              />
            </View>

            <Text style={styles.chartTitle}>Column Movement (+ = Right, - = Left)</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={timelineData.colDirectionData.slice(0, 30)} // Limit to 30 for better display
                hideDataPoints
                spacing={10}
                color="#2196F3"
                thickness={2}
                startFillColor="rgba(33, 150, 243, 0.3)"
                endFillColor="rgba(33, 150, 243, 0.01)"
                initialSpacing={10}
                noOfSections={4}
                maxValue={4}
                minValue={-4}
                yAxisColor="rgba(0,0,0,0.1)"
                yAxisTextStyle={{ color: '#333' }}
                xAxisColor="rgba(0,0,0,0.1)"
                xAxisTextStyle={{ color: '#333' }}
                width={width - 60}
              />
            </View>

            <Text style={styles.chartTitle}>Time Between Clicks (seconds)</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={timelineData.timeIntervalData.slice(0, 30)} // Limit to 30 for better display
                hideDataPoints
                spacing={10}
                color="#FF9800"
                thickness={2}
                startFillColor="rgba(255, 152, 0, 0.3)"
                endFillColor="rgba(255, 152, 0, 0.01)"
                initialSpacing={10}
                noOfSections={5}
                maxValue={5}
                yAxisColor="rgba(0,0,0,0.1)"
                yAxisTextStyle={{ color: '#333' }}
                xAxisColor="rgba(0,0,0,0.1)"
                xAxisTextStyle={{ color: '#333' }}
                width={width - 60}
              />
            </View>
          </>
        )}
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
  metricsContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  metricLabel: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  metricValue: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  chartTitle: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
});

export default MovementPathAnalysis;