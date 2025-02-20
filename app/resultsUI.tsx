import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Card } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const ResultsUI = () => {
  const params = useLocalSearchParams();
  
  // Parse the JSON strings from params
  const digit3Count = Number(params.digit3Count);
  const digit3ColumnCount = JSON.parse(params.digit3ColumnCount as string);
  const leftSide3s = JSON.parse(params.leftSide3s as string);
  const rightSide3s = JSON.parse(params.rightSide3s as string);
  const quadrant3s = JSON.parse(params.quadrant3s as string);
  const pressedCoordinates = JSON.parse(params.pressedCoordinates as string);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Overall Statistics */}
        <Card style={styles.card}>
          <Card.Title title="Overall Statistics" />
          <Card.Content>
            <Text style={styles.statText}>Total 3's Found: {digit3Count}</Text>
            <Text style={styles.statText}>Total Selections Made: {pressedCoordinates.length}</Text>
          </Card.Content>
        </Card>

        {/* Column Distribution */}
        <Card style={styles.card}>
          <Card.Title title="Column Distribution" />
          <Card.Content>
            <View style={styles.columnGrid}>
              {digit3ColumnCount.map((count, index) => (
                <View key={index} style={styles.columnItem}>
                  <Text style={styles.columnHeader}>Col {index + 1}</Text>
                  <Text style={styles.columnCount}>{count}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Position Analysis */}
        <Card style={styles.card}>
          <Card.Title title="Position Analysis" />
          <Card.Content>
            <View style={styles.positionStats}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Left Side 3's</Text>
                <Text style={styles.statValue}>{leftSide3s.length}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Right Side 3's</Text>
                <Text style={styles.statValue}>{rightSide3s.length}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quadrant Analysis */}
        <Card style={styles.card}>
          <Card.Title title="Quadrant Analysis" />
          <Card.Content>
            <View style={styles.quadrantGrid}>
              <View style={styles.quadrantRow}>
                <View style={styles.quadrantBox}>
                  <Text style={styles.quadrantLabel}>Upper Left</Text>
                  <Text style={styles.quadrantValue}>{quadrant3s.upperLeft.length}</Text>
                </View>
                <View style={styles.quadrantBox}>
                  <Text style={styles.quadrantLabel}>Upper Right</Text>
                  <Text style={styles.quadrantValue}>{quadrant3s.upperRight.length}</Text>
                </View>
              </View>
              <View style={styles.quadrantRow}>
                <View style={styles.quadrantBox}>
                  <Text style={styles.quadrantLabel}>Lower Left</Text>
                  <Text style={styles.quadrantValue}>{quadrant3s.lowerLeft.length}</Text>
                </View>
                <View style={styles.quadrantBox}>
                  <Text style={styles.quadrantLabel}>Lower Right</Text>
                  <Text style={styles.quadrantValue}>{quadrant3s.lowerRight.length}</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Selection Path */}
        <Card style={styles.card}>
          <Card.Title title="Selection Path" />
          <Card.Content>
            <ScrollView style={styles.pathScroll}>
              {pressedCoordinates.map((coord, index) => (
                <Text key={index} style={styles.pathText}>
                  {`${index + 1}. Row ${coord.row + 1}, Col ${coord.col + 1}, Digit ${coord.digit + 1}`}
                </Text>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 8,
  },
  statText: {
    fontSize: 16,
    marginBottom: 8,
  },
  columnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  columnItem: {
    width: '18%',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: '500',
  },
  columnCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  positionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  statBox: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    minWidth: 120,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quadrantGrid: {
    marginVertical: 8,
  },
  quadrantRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  quadrantBox: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    minWidth: width * 0.35,
  },
  quadrantLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  quadrantValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pathScroll: {
    maxHeight: 200,
  },
  pathText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
});

export default ResultsUI;