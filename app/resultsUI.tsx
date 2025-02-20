import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ResultsUI = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Parse the JSON strings from params
  const leftSide3s = JSON.parse(params.leftSide3s as string);
  const rightSide3s = JSON.parse(params.rightSide3s as string);
  const quadrant3s = JSON.parse(params.quadrant3s as string);

  // Prepare grouped bar data for columns
  const columnBarData = [];
  for (let i = 0; i < 10; i++) {
    columnBarData.push({
      value: leftSide3s.filter(coord => coord.col === i).length,
      frontColor: '#4B9EF8',
      label: `${i + 1}`,
      spacing: 2,
    });
    columnBarData.push({
      value: rightSide3s.filter(coord => coord.col === i).length,
      frontColor: '#22B5F5',
      spacing: 18,
    });
  }

  // Prepare data for quadrants with left/right split
  const quadrantBarData = [
    // Upper Left Quadrant
    {
      value: leftSide3s.filter(coord => 
        coord.row < 5 && coord.col < 5
      ).length,
      frontColor: '#4B9EF8',
      label: 'UL',
      spacing: 2,
    },
    {
      value: rightSide3s.filter(coord => 
        coord.row < 5 && coord.col < 5
      ).length,
      frontColor: '#22B5F5',
      spacing: 40,
    },
    // Upper Right Quadrant
    {
      value: leftSide3s.filter(coord => 
        coord.row < 5 && coord.col >= 5
      ).length,
      frontColor: '#4B9EF8',
      label: 'UR',
      spacing: 2,
    },
    {
      value: rightSide3s.filter(coord => 
        coord.row < 5 && coord.col >= 5
      ).length,
      frontColor: '#22B5F5',
      spacing: 40,
    },
    // Lower Left Quadrant
    {
      value: leftSide3s.filter(coord => 
        coord.row >= 5 && coord.col < 5
      ).length,
      frontColor: '#4B9EF8',
      label: 'LL',
      spacing: 2,
    },
    {
      value: rightSide3s.filter(coord => 
        coord.row >= 5 && coord.col < 5
      ).length,
      frontColor: '#22B5F5',
      spacing: 40,
    },
    // Lower Right Quadrant
    {
      value: leftSide3s.filter(coord => 
        coord.row >= 5 && coord.col >= 5
      ).length,
      frontColor: '#4B9EF8',
      label: 'LR',
      spacing: 2,
    },
    {
      value: rightSide3s.filter(coord => 
        coord.row >= 5 && coord.col >= 5
      ).length,
      frontColor: '#22B5F5',
      spacing: 40,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.chartsRow}>
            {/* Column Distribution Chart */}
            <Card style={[styles.darkCard, styles.chartCard]}>
              <Card.Title 
                title="Column Distribution" 
                titleStyle={styles.cardTitle}
              />
              <Card.Content>
                <View style={styles.chartContainer}>
                  <BarChart
                    data={columnBarData}
                    barWidth={15}
                    spacing={2}
                    roundedTop
                    roundedBottom
                    hideRules
                    xAxisColor={'rgba(255,255,255,0.2)'}
                    yAxisColor={'rgba(255,255,255,0.2)'}
                    yAxisTextStyle={{ color: '#fff', fontSize: 12 }}
                    xAxisLabelTextStyle={{ color: '#fff', fontSize: 12 }}
                    noOfSections={10}
                    maxValue={12}
                    width={(width/2) - 40}
                    height={250}
                    isAnimated
                  />
                  <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: '#4B9EF8' }]} />
                      <Text style={styles.legendText}>Left Side</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: '#22B5F5' }]} />
                      <Text style={styles.legendText}>Right Side</Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Quadrant Distribution Chart */}
            <Card style={[styles.darkCard, styles.chartCard]}>
              <Card.Title 
                title="Quadrant Distribution" 
                titleStyle={styles.cardTitle}
              />
              <Card.Content>
                <View style={styles.chartContainer}>
                  <BarChart
                    data={quadrantBarData}
                    barWidth={20}
                    spacing={2}
                    roundedTop
                    roundedBottom
                    hideRules
                    xAxisColor={'rgba(255,255,255,0.2)'}
                    yAxisColor={'rgba(255,255,255,0.2)'}
                    yAxisTextStyle={{ color: '#fff', fontSize: 12 }}
                    xAxisLabelTextStyle={{ color: '#fff', fontSize: 12 }}
                    noOfSections={10}
                    maxValue={20}
                    width={(width/2) - 40}
                    height={250}
                    isAnimated
                  />
                  <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: '#4B9EF8' }]} />
                      <Text style={styles.legendText}>Left Side</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: '#22B5F5' }]} />
                      <Text style={styles.legendText}>Right Side</Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#242444',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  chartsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  chartCard: {
    width: (width/2) - 24,
    marginBottom: 16,
  },
  darkCard: {
    backgroundColor: '#242444',
    elevation: 4,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#fff',
  },
});

export default ResultsUI;