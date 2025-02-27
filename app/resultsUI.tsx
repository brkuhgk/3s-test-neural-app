import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import ExportButton from './ExportButton';
import UserMovementAnalysis from '../components/UserMovementAnalysis';
import MovementPatternSection from '../components/MovementPatternSection';
import FinalResultsIntegration from '../components/FinalResultsIntegration';
import DigitSelector from '../components/DigitSelector';

const { width, height } = Dimensions.get('window');
const SIX_MINUTES_IN_SECONDS = 60; // 6 minutes in seconds

// Interface for the 6-minute snapshot
interface SixMinuteSnapshot {
  timestamp: number;
  digitCounts: number[];
  digitColumnCounts: number[][];
  leftSideDigits: any[][];
  rightSideDigits: any[][];
  quadrantDigits: any[];
  pressedCoordinates: any[];
}

interface SixMinutesDataType {
  coordinates: any[];
  timeSpent: number;
  digitCount: number;
  columnCounts: number[];
  leftSide: any[];
  rightSide: any[];
  quadrants: {
    upperLeft: any[];
    upperRight: any[];
    lowerLeft: any[];
    lowerRight: any[];
  };
}

const ResultsUI = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [selectedDigit, setSelectedDigit] = useState(3); // Default to digit '3'
  const [selectedTimeRange, setSelectedTimeRange] = useState('6min'); // '6min' or 'full'
  const [showSelector, setShowSelector] = useState(false);

  // Parse all the digit data
  const [digitCounts, setDigitCounts] = useState(Array(10).fill(0));
  const [digitColumnCounts, setDigitColumnCounts] = useState(Array(10).fill().map(() => Array(10).fill(0)));
  const [leftSideDigits, setLeftSideDigits] = useState(Array(10).fill().map(() => []));
  const [rightSideDigits, setRightSideDigits] = useState(Array(10).fill().map(() => []));
  const [quadrantDigits, setQuadrantDigits] = useState(Array(10).fill().map(() => ({
    upperLeft: [],
    lowerLeft: [],
    upperRight: [],
    lowerRight: []
  })));
  
  // State for six minutes data
  const [sixMinutesData, setSixMinutesData] = useState<SixMinutesDataType | null>(null);
  // NEW: State for the raw snapshot from test.tsx
  const [sixMinuteSnapshot, setSixMinuteSnapshot] = useState<SixMinuteSnapshot | null>(null);

  // Initialize data from params
  useEffect(() => {
    let isParamProcessed = false;
    
    if (!isParamProcessed && params.digitCounts) {
      try {
        const parsed = JSON.parse(params.digitCounts as string);
        setDigitCounts(parsed);
      } catch (error) {
        console.error("Error parsing digitCounts", error);
      }
    }
    
    if (!isParamProcessed && params.digitColumnCounts) {
      try {
        const parsed = JSON.parse(params.digitColumnCounts as string);
        setDigitColumnCounts(parsed);
      } catch (error) {
        console.error("Error parsing digitColumnCounts", error);
      }
    }
    
    if (!isParamProcessed && params.leftSideDigits) {
      try {
        const parsed = JSON.parse(params.leftSideDigits as string);
        setLeftSideDigits(parsed);
      } catch (error) {
        console.error("Error parsing leftSideDigits", error);
      }
    }
    
    if (!isParamProcessed && params.rightSideDigits) {
      try {
        const parsed = JSON.parse(params.rightSideDigits as string);
        setRightSideDigits(parsed);
      } catch (error) {
        console.error("Error parsing rightSideDigits", error);
      }
    }
    
    if (!isParamProcessed && params.quadrantDigits) {
      try {
        const parsed = JSON.parse(params.quadrantDigits as string);
        setQuadrantDigits(parsed);
      } catch (error) {
        console.error("Error parsing quadrantDigits", error);
      }
    }
    
    // NEW: Parse the six minute snapshot if it exists
    if (!isParamProcessed && params.sixMinuteSnapshot) {
      try {
        const parsed = JSON.parse(params.sixMinuteSnapshot as string);
        setSixMinuteSnapshot(parsed);
      } catch (error) {
        console.error("Error parsing sixMinuteSnapshot", error);
      }
    }
    
    isParamProcessed = true;
  }, []); // Run only once on mount

  // NEW: Process 6-minute snapshot if available
  useEffect(() => {
    if (sixMinuteSnapshot) {
      setShowSelector(true);
      
      // Process the six minute data for the currently selected digit
      const currentDigitData = processDigitData(sixMinuteSnapshot, selectedDigit);
      setSixMinutesData(currentDigitData);
    } else {
      // If no snapshot available but test ran longer than 6 minutes, 
      // use the old approach to reconstruct 6-minute data
      const elapsedTimeInSeconds = Number(params.elapsedTime || 0);
      if (elapsedTimeInSeconds > SIX_MINUTES_IN_SECONDS) {
        setShowSelector(true);
        
        try {
          // Parse all the necessary data
          const pressedCoords = JSON.parse(params.pressedCoordinates as string || '[]');
          const startTimeMs = new Date(params.startTime as string).getTime();
          
          // Filter coordinates for the first 6 minutes
          const before6MinCoords = pressedCoords.filter(
            (coord: any) => (coord.timestamp - startTimeMs) / 1000 <= SIX_MINUTES_IN_SECONDS
          );
          
          // Create a structure to hold data for all digits
          const digitData: any = {};
          
          // Process data for each digit (0-9)
          for (let i = 0; i <= 9; i++) {
            const digitStr = i.toString();
            
            // Filter coordinates for this digit within the 6-minute window
            const digitCoords = before6MinCoords.filter((coord: any) => coord.value === digitStr);
            
            // Calculate column counts
            const colCounts = Array(10).fill(0);
            digitCoords.forEach((coord: any) => {
              if (coord.col >= 0 && coord.col < 10) {
                colCounts[coord.col]++;
              }
            });
            
            // Split into left/right side based on digit position within number
            const leftSide = digitCoords.filter((coord: any) => coord.digit < coord.value.length / 2);
            const rightSide = digitCoords.filter((coord: any) => coord.digit >= coord.value.length / 2);
            
            // Calculate quadrant data
            const upperLeft = digitCoords.filter((coord: any) => coord.row < 7 && coord.col < 5);
            const upperRight = digitCoords.filter((coord: any) => coord.row < 7 && coord.col >= 5);
            const lowerLeft = digitCoords.filter((coord: any) => coord.row >= 7 && coord.col < 5);
            const lowerRight = digitCoords.filter((coord: any) => coord.row >= 7 && coord.col >= 5);
            
            // Store data for this digit
            digitData[i] = {
              count: digitCoords.length,
              columnCounts: colCounts,
              leftSide: leftSide,
              rightSide: rightSide,
              quadrants: {
                upperLeft,
                upperRight,
                lowerLeft,
                lowerRight
              }
            };
          }
          
          // Set the data for the currently selected digit
          const currentDigitData = {
            coordinates: before6MinCoords,
            timeSpent: SIX_MINUTES_IN_SECONDS,
            digitCount: digitData[selectedDigit]?.count || 0,
            columnCounts: digitData[selectedDigit]?.columnCounts || Array(10).fill(0),
            leftSide: digitData[selectedDigit]?.leftSide || [],
            rightSide: digitData[selectedDigit]?.rightSide || [],
            quadrants: digitData[selectedDigit]?.quadrants || {
              upperLeft: [],
              upperRight: [],
              lowerLeft: [],
              lowerRight: []
            }
          };
          
          setSixMinutesData(currentDigitData);
        } catch (error) {
          console.error("Error processing time-based data:", error);
        }
      }
    }
  }, [params.elapsedTime, params.pressedCoordinates, params.startTime, sixMinuteSnapshot, selectedDigit]);

  // Helper function to process digit data from the snapshot
  const processDigitData = (snapshot: SixMinuteSnapshot, digitValue: number): SixMinutesDataType => {
    if (!snapshot) {
      return {
        coordinates: [],
        timeSpent: SIX_MINUTES_IN_SECONDS,
        digitCount: 0,
        columnCounts: Array(10).fill(0),
        leftSide: [],
        rightSide: [],
        quadrants: {
          upperLeft: [],
          upperRight: [],
          lowerLeft: [],
          lowerRight: []
        }
      };
    }

    return {
      coordinates: snapshot.pressedCoordinates,
      timeSpent: SIX_MINUTES_IN_SECONDS,
      digitCount: snapshot.digitCounts[digitValue] || 0,
      columnCounts: snapshot.digitColumnCounts[digitValue] || Array(10).fill(0),
      leftSide: snapshot.leftSideDigits[digitValue] || [],
      rightSide: snapshot.rightSideDigits[digitValue] || [],
      quadrants: snapshot.quadrantDigits[digitValue] || {
        upperLeft: [],
        upperRight: [],
        lowerLeft: [],
        lowerRight: []
      }
    };
  };

  // Handler for digit changes - updated to work with snapshot
  const handleDigitChange = (digit: number) => {
    setSelectedDigit(digit);
    
    // If we have 6-minute snapshot, update the view with data for the new digit
    if (sixMinuteSnapshot) {
      const newDigitData = processDigitData(sixMinuteSnapshot, digit);
      setSixMinutesData(newDigitData);
    }
  };

  // Get the current digit data based on selection
  const currentDigitData = useMemo(() => {
    return {
      digitCount: digitCounts[selectedDigit] || 0,
      columnCounts: digitColumnCounts[selectedDigit] || Array(10).fill(0),
      leftSide: leftSideDigits[selectedDigit] || [],
      rightSide: rightSideDigits[selectedDigit] || [],
      quadrants: quadrantDigits[selectedDigit] || {
        upperLeft: [],
        lowerLeft: [],
        upperRight: [],
        lowerRight: []
      }
    };
  }, [digitCounts, digitColumnCounts, leftSideDigits, rightSideDigits, quadrantDigits, selectedDigit]);

  // Process chart data for the current digit data
  const { columnBarData, quadrantBarData } = useMemo(() => {
    // Prepare grouped bar data for columns
    const colData = [];
    for (let i = 0; i < 10; i++) {
      colData.push({
        value: (currentDigitData.leftSide || []).filter(coord => coord.col === i).length,
        frontColor: '#4B9EF8',
        label: `${i + 1}`,
        spacing: 2,
      });
      colData.push({
        value: (currentDigitData.rightSide || []).filter(coord => coord.col === i).length,
        frontColor: '#22B5F5',
        spacing: 18,
      });
    }

    // Prepare data for quadrants with left/right split
    const quadData = [
      // Upper Left Quadrant
      {
        value: (currentDigitData.leftSide || []).filter(coord => 
          coord.row < 5 && coord.col < 5
        ).length,
        frontColor: '#4B9EF8',
        label: 'UL',
        spacing: 2,
      },
      {
        value: (currentDigitData.rightSide || []).filter(coord => 
          coord.row < 5 && coord.col < 5
        ).length,
        frontColor: '#22B5F5',
        spacing: 40,
      },
      // Upper Right Quadrant
      {
        value: (currentDigitData.leftSide || []).filter(coord => 
          coord.row < 5 && coord.col >= 5
        ).length,
        frontColor: '#4B9EF8',
        label: 'UR',
        spacing: 2,
      },
      {
        value: (currentDigitData.rightSide || []).filter(coord => 
          coord.row < 5 && coord.col >= 5
        ).length,
        frontColor: '#22B5F5',
        spacing: 40,
      },
      // Lower Left Quadrant
      {
        value: (currentDigitData.leftSide || []).filter(coord => 
          coord.row >= 5 && coord.col < 5
        ).length,
        frontColor: '#4B9EF8',
        label: 'LL',
        spacing: 2,
      },
      {
        value: (currentDigitData.rightSide || []).filter(coord => 
          coord.row >= 5 && coord.col < 5
        ).length,
        frontColor: '#22B5F5',
        spacing: 40,
      },
      // Lower Right Quadrant
      {
        value: (currentDigitData.leftSide || []).filter(coord => 
          coord.row >= 5 && coord.col >= 5
        ).length,
        frontColor: '#4B9EF8',
        label: 'LR',
        spacing: 2,
      },
      {
        value: (currentDigitData.rightSide || []).filter(coord => 
          coord.row >= 5 && coord.col >= 5
        ).length,
        frontColor: '#22B5F5',
        spacing: 40,
      },
    ];

    return { columnBarData: colData, quadrantBarData: quadData };
  }, [currentDigitData]);

  // Process sixMinutesData for charts
  const { sixMinColumnBarData, sixMinQuadrantBarData } = useMemo(() => {
    if (!sixMinutesData) {
      return { sixMinColumnBarData: [], sixMinQuadrantBarData: [] };
    }
    
    // Similar calculations as above, but for sixMinutesData
    const colData = [];
    for (let i = 0; i < 10; i++) {
      colData.push({
        value: (sixMinutesData.leftSide || []).filter(coord => coord.col === i).length,
        frontColor: '#4B9EF8',
        label: `${i + 1}`,
        spacing: 2,
      });
      colData.push({
        value: (sixMinutesData.rightSide || []).filter(coord => coord.col === i).length,
        frontColor: '#22B5F5',
        spacing: 18,
      });
    }

    // Quadrant data for first 6 minutes
    const quadData = [
      // Upper Left Quadrant
      {
        value: (sixMinutesData.leftSide || []).filter(coord => 
          coord.row < 5 && coord.col < 5
        ).length,
        frontColor: '#4B9EF8',
        label: 'UL',
        spacing: 2,
      },
      {
        value: (sixMinutesData.rightSide || []).filter(coord => 
          coord.row < 5 && coord.col < 5
        ).length,
        frontColor: '#22B5F5',
        spacing: 40,
      },
      // Upper Right Quadrant
      {
        value: (sixMinutesData.leftSide || []).filter(coord => 
          coord.row < 5 && coord.col >= 5
        ).length,
        frontColor: '#4B9EF8',
        label: 'UR',
        spacing: 2,
      },
      {
        value: (sixMinutesData.rightSide || []).filter(coord => 
          coord.row < 5 && coord.col >= 5
        ).length,
        frontColor: '#22B5F5',
        spacing: 40,
      },
      // Lower Left Quadrant
      {
        value: (sixMinutesData.leftSide || []).filter(coord => 
          coord.row >= 5 && coord.col < 5
        ).length,
        frontColor: '#4B9EF8',
        label: 'LL',
        spacing: 2,
      },
      {
        value: (sixMinutesData.rightSide || []).filter(coord => 
          coord.row >= 5 && coord.col < 5
        ).length,
        frontColor: '#22B5F5',
        spacing: 40,
      },
      // Lower Right Quadrant
      {
        value: (sixMinutesData.leftSide || []).filter(coord => 
          coord.row >= 5 && coord.col >= 5
        ).length,
        frontColor: '#4B9EF8',
        label: 'LR',
        spacing: 2,
      },
      {
        value: (sixMinutesData.rightSide || []).filter(coord => 
          coord.row >= 5 && coord.col >= 5
        ).length,
        frontColor: '#22B5F5',
        spacing: 40,
      },
    ];

    return { sixMinColumnBarData: colData, sixMinQuadrantBarData: quadData };
  }, [sixMinutesData]);

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
          {/* Add the DigitSelector component */}
          <DigitSelector 
            selectedDigit={selectedDigit} 
            onDigitChange={handleDigitChange} 
          />

          {/* Time Selector - only show if test > 6 minutes */}
          {showSelector && (
            <View style={styles.timeSelectorContainer}>
              <Text style={styles.timeSelectorLabel}>Select Time Range:</Text>
              <View style={styles.timeButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.timeButton,
                    selectedTimeRange === '6min' && styles.selectedTimeButton
                  ]}
                  onPress={() => setSelectedTimeRange('6min')}
                >
                  <Text 
                    style={[
                      styles.timeButtonText,
                      selectedTimeRange === '6min' && styles.selectedTimeButtonText
                    ]}
                  >
                    First 6 Minutes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.timeButton,
                    selectedTimeRange === 'full' && styles.selectedTimeButton
                  ]}
                  onPress={() => setSelectedTimeRange('full')}
                >
                  <Text 
                    style={[
                      styles.timeButtonText,
                      selectedTimeRange === 'full' && styles.selectedTimeButtonText
                    ]}
                  >
                    Full Test ({formatTime(Number(params.elapsedTime || 0))})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Show different views based on time selector state */}
          {showSelector ? (
            selectedTimeRange === '6min' && sixMinutesData ? (
              <>
                <View style={styles.timeHeaderContainer}>
                  <Text style={styles.timeHeaderText}>First 6 Minutes Results</Text>
                </View>
                
                <View style={styles.chartsRow}>
                  {/* Column Distribution Chart for 6 min data */}
                  <Card style={[styles.darkCard, styles.chartCard]}>
                    <Card.Title 
                      title={`Column Distribution - Digit ${selectedDigit}`}
                      titleStyle={styles.cardTitle}
                    />
                    <Card.Content>
                      <View style={styles.chartContainer}>
                        <BarChart
                          data={sixMinColumnBarData}
                          barWidth={15}
                          spacing={2}
                          roundedTop
                          roundedBottom
                          hideRules
                          xAxisColor={'rgba(0,0,0,0.2)'}
                          yAxisColor={'rgba(0,0,0,0.2)'}
                          yAxisTextStyle={{ color: '#000', fontSize: 12 }}
                          xAxisLabelTextStyle={{ color: '#000', fontSize: 12 }}
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

                  {/* Quadrant Distribution Chart for 6 min data */}
                  <Card style={[styles.darkCard, styles.chartCard]}>
                    <Card.Title 
                      title={`Quadrant Distribution - Digit ${selectedDigit}`}
                      titleStyle={styles.cardTitle}
                    />
                    <Card.Content>
                      <View style={styles.chartContainer}>
                        <BarChart
                          data={sixMinQuadrantBarData}
                          barWidth={20}
                          spacing={2}
                          roundedTop
                          roundedBottom
                          hideRules
                          xAxisColor={'rgba(0,0,0,0.2)'}
                          yAxisColor={'rgba(0,0,0,0.2)'}
                          yAxisTextStyle={{ color: '#000', fontSize: 12 }}
                          xAxisLabelTextStyle={{ color: '#000', fontSize: 12 }}
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
                
                {/* 6-minute detailed results */}
                <FinalResultsIntegration 
                  currentDigitData={{
                    digitCount: sixMinutesData?.digitCount || 0,
                    columnCounts: sixMinutesData.columnCounts,
                    leftSide: sixMinutesData.leftSide,
                    rightSide: sixMinutesData.rightSide,
                    quadrants: sixMinutesData.quadrants
                  }}
                  selectedDigit={selectedDigit}
                  params={{
                    ...params,
                    elapsedTime: SIX_MINUTES_IN_SECONDS.toString(),
                    pressedCoordinates: JSON.stringify(sixMinutesData.coordinates)
                  }}
                />
              </>
            ) : (
              <>
                <View style={styles.timeHeaderContainer}>
                  <Text style={styles.timeHeaderText}>Complete Assessment Results</Text>
                </View>
                
                <View style={styles.chartsRow}>
                  {/* Column Distribution Chart for full results */}
                  <Card style={[styles.darkCard, styles.chartCard]}>
                    <Card.Title 
                      title={`Column Distribution - Digit ${selectedDigit}`}
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
                          xAxisColor={'rgba(0,0,0,0.2)'}
                          yAxisColor={'rgba(0,0,0,0.2)'}
                          yAxisTextStyle={{ color: '#000', fontSize: 12 }}
                          xAxisLabelTextStyle={{ color: '#000', fontSize: 12 }}
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

                  {/* Quadrant Distribution Chart for full results */}
                  <Card style={[styles.darkCard, styles.chartCard]}>
                    <Card.Title 
                      title={`Quadrant Distribution - Digit ${selectedDigit}`}
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
                          xAxisColor={'rgba(0,0,0,0.2)'}
                          yAxisColor={'rgba(0,0,0,0.2)'}
                          yAxisTextStyle={{ color: '#000', fontSize: 12 }}
                          xAxisLabelTextStyle={{ color: '#000', fontSize: 12 }}
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
                
                {/* Complete results analysis */}
                <FinalResultsIntegration 
                  currentDigitData={currentDigitData}
                  selectedDigit={selectedDigit}
                  params={{
                    ...params,
                    digitCount: currentDigitData.digitCount.toString(),
                    digitColumnCount: JSON.stringify(currentDigitData.columnCounts),
                    leftSideDigits: JSON.stringify(currentDigitData.leftSide),
                    rightSideDigits: JSON.stringify(currentDigitData.rightSide),
                    quadrantDigits: JSON.stringify(currentDigitData.quadrants),
                  }}
                />
              </>
            )
          ) : (
            <>
              {/* Default view for tests under 6 minutes */}
              <View style={styles.chartsRow}>
                {/* Column Distribution Chart */}
                <Card style={[styles.darkCard, styles.chartCard]}>
                  <Card.Title 
                    title={`Column Distribution - Digit ${selectedDigit}`}
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
                        xAxisColor={'rgba(0,0,0,0.2)'}
                        yAxisColor={'rgba(0,0,0,0.2)'}
                        yAxisTextStyle={{ color: '#000', fontSize: 12 }}
                        xAxisLabelTextStyle={{ color: '#000', fontSize: 12 }}
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
                    title={`Quadrant Distribution - Digit ${selectedDigit}`}
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
                        xAxisColor={'rgba(0,0,0,0.2)'}
                        yAxisColor={'rgba(0,0,0,0.2)'}
                        yAxisTextStyle={{ color: '#000', fontSize: 12 }}
                        xAxisLabelTextStyle={{ color: '#000', fontSize: 12 }}
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
              
              {/* Regular results */}
              <FinalResultsIntegration 
                currentDigitData={currentDigitData}
                selectedDigit={selectedDigit}
                params={{
                  ...params,
                  digitCount: currentDigitData.digitCount.toString(),
                  digitColumnCount: JSON.stringify(currentDigitData.columnCounts),
                  leftSideDigits: JSON.stringify(currentDigitData.leftSide),
                  rightSideDigits: JSON.stringify(currentDigitData.rightSide),
                  quadrantDigits: JSON.stringify(currentDigitData.quadrants),
                }}
              />
            </>
          )}

          <View style={styles.buttonsContainer}>
            {/* Export Button with updated props to include all digit data */}
            <ExportButton
              data={{
                participantId: params.participantId as string,
                participantInitials: params.participantInitials as string,
                examinerInitials: params.examinerInitials as string,
                elapsedTime: params.elapsedTime as string,
                // Data for selected digit (for backward compatibility)
                digit3Count: selectedTimeRange === '6min' && sixMinutesData 
                  ? sixMinutesData.digitCount.toString()
                  : currentDigitData.digitCount.toString(),
                digit3ColumnCount: selectedTimeRange === '6min' && sixMinutesData
                  ? JSON.stringify(sixMinutesData.columnCounts)
                  : JSON.stringify(currentDigitData.columnCounts),
                leftSide3s: selectedTimeRange === '6min' && sixMinutesData
                  ? JSON.stringify(sixMinutesData.leftSide)
                  : JSON.stringify(currentDigitData.leftSide),
                rightSide3s: selectedTimeRange === '6min' && sixMinutesData
                  ? JSON.stringify(sixMinutesData.rightSide)
                  : JSON.stringify(currentDigitData.rightSide),
                quadrant3s: selectedTimeRange === '6min' && sixMinutesData
                  ? JSON.stringify(sixMinutesData.quadrants)
                  : JSON.stringify(currentDigitData.quadrants),
                // Add data for all digits
                selectedDigit: selectedDigit.toString(),
                digitCounts: JSON.stringify(digitCounts),
                digitColumnCounts: JSON.stringify(digitColumnCounts),
                leftSideDigits: JSON.stringify(leftSideDigits),
                rightSideDigits: JSON.stringify(rightSideDigits),
                quadrantDigits: JSON.stringify(quadrantDigits),
                // First 6 minutes data
                has6MinResults: showSelector,
                sixMinData: showSelector && sixMinutesData ? JSON.stringify(sixMinutesData) : null,
                sixMinSnapshot: sixMinuteSnapshot ? JSON.stringify(sixMinuteSnapshot) : null
              }}
            />

            <Button
              mode="contained"
              onPress={() => router.push('/')}
              style={styles.newTestButton}
              labelStyle={styles.buttonLabel}
            >
              New Test
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Light background color
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#4B9EF8', // Enhanced color for header
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF', // White text color
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
    width: (width / 2) - 24,
    marginBottom: 16,
  },
  darkCard: {
    backgroundColor: '#FFFFFF', // Light card background
    elevation: 4,
    borderRadius: 1,
  },
  cardTitle: {
    color: '#333333', // Dark text color for titles
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: '#666666',
    fontSize: 12,
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
    color: '#333333', // Dark text color for legend
  },
  timeValue: {
    color: '#4B9EF8',
    fontSize: 16,
    fontWeight: '600',
  },
  timeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  newTestButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: '#FFFFFF',
    paddingVertical: 4,
  },
  // Time selector styles
  timeSelectorContainer: {
    marginVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  timeSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  timeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedTimeButton: {
    backgroundColor: '#4B9EF8',
    borderColor: '#4B9EF8',
  },
  timeButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedTimeButtonText: {
    color: '#fff',
  },
  timeHeaderContainer: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    marginHorizontal: 0,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  timeHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D47A1',
  },
  resultsSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  separatorText: {
    marginHorizontal: 12,
    color: '#555',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default ResultsUI;