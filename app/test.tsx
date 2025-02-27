import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import MovementTrackingOverlay from '../components/MovementTrackingOverlay';

// Get device dimensions
const { width, height } = Dimensions.get('window'); 

// Define constant for 6 minutes in seconds
const SIX_MINUTES_IN_SECONDS = 60;

// Function to split number into digits
interface Digit {
  value: string;
  marked: boolean;
}

const splitNumberIntoDigits = (number: number): Digit[] => {
  return number.toString().split('').map(digit => ({
    value: digit,
    marked: false
  }));
};

// Prepare data
const initialData = [
  [8103, 83727895, 769158, 31678925, 3294059, 73914, 3512407, 8089170, 1992939, 2120],
  [4567, 8092573, 45013, 29758, 530345, 618475, 12445683, 30127987, 366305, 297539],
  [139723, 45298716, 3295870, 3980, 253970, 579340, 6138, 432063, 81924982, 6583],
  [9813, 32145678, 84673, 139475, 58145469, 13820, 37428981, 63017980, 45607, 13925647],
  [34602458, 3643, 83921, 4512693, 4698723, 836438, 5801, 89063, 23972165, 3263],
  [42915, 5853, 72631, 34670654, 36135, 4626071, 83959, 4959398, 68130, 6301],
  [987302, 9672, 4286158, 7807347, 675246, 946053, 2002193 ,6004745, 35671, 1061],
  [5732186, 45013, 84203, 56239, 671302, 3004, 38672168, 80873, 4108, 371903],
  [6837, 183820, 43612063, 90542145, 784352, 3956, 23781, 198378, 187123, 6004216],
  [3407, 1792635, 4067903, 98103, 5624, 780523, 56792604, 37801, 6356791, 93956467],
  [431025, 4297589, 83961, 56465421, 6138940, 4295901, 6476023, 97654985, 13283, 21243],
  [613947, 43169857, 4302, 3251673, 70765583, 760536, 37821245, 4623, 1308418, 9212494],
  [8077, 3824510, 53906, 4389, 80610972, 3120, 760530, 3940, 8405737, 89203],
  [579103, 970943, 42057, 87652143, 3048, 497538, 1230, 93745125, 19081257, 23456],
];

// Interface for the 6-minute data snapshot
interface SixMinuteSnapshot {
  timestamp: number;
  digitCounts: number[];
  digitColumnCounts: number[][];
  leftSideDigits: any[][];
  rightSideDigits: any[][];
  quadrantDigits: any[];
  pressedCoordinates: any[];
}

const Index = () => {
  const [data, setData] = useState(initialData.map(row => row.map(splitNumberIntoDigits)));
  const params = useLocalSearchParams();
  const participantId = params.participantId as string;
  const participantInitials = params.participantInitials as string;
  const examinerInitials = params.examinerInitials as string;
  
  const cellWidth = width / 10; // 10 columns across the device width
  const cellHeight = height / 20; // Adjust cell height based on the device height

  // Refs for measuring cell dimensions
  const cellRef = useRef(null);
  const [cellDimensions, setCellDimensions] = useState({ width: cellWidth, height: cellHeight });
  
  // Add these near your other state declarations in index.tsx
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [lastMovementTimestamp, setLastMovementTimestamp] = useState(Date.now());

  // Track all digits, not just 3s
  const [digitCounts, setDigitCounts] = useState(Array(10).fill(0)); // For counts of each digit (0-9)
  const [digitColumnCounts, setDigitColumnCounts] = useState(Array(10).fill().map(() => Array(10).fill(0))); // [digitValue][columnIndex]
  const [leftSideDigits, setLeftSideDigits] = useState(Array(10).fill().map(() => []));
  const [rightSideDigits, setRightSideDigits] = useState(Array(10).fill().map(() => []));
  const [quadrantDigits, setQuadrantDigits] = useState(Array(10).fill().map(() => ({
    upperLeft: [],
    lowerLeft: [],
    upperRight: [],
    lowerRight: []
  })));

  // NEW: Add state to capture 6-minute snapshot
  const [sixMinuteSnapshot, setSixMinuteSnapshot] = useState<SixMinuteSnapshot | null>(null);
  const [sixMinutePassed, setSixMinutePassed] = useState(false);

  interface Coordinate {
    row: number;
    col: number;
    digit: number;
    value: string;
    timestamp: number;
    x?: number;
    y?: number;
  }
  
  const [pressedCoordinates, setPressedCoordinates] = useState<Coordinate[]>([]);

  // Add this useEffect for time tracking with 6-minute snapshot
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(elapsed);

      // NEW: Check if we just passed the 6-minute mark and haven't taken a snapshot yet
      if (elapsed >= SIX_MINUTES_IN_SECONDS && !sixMinutePassed) {
        setSixMinutePassed(true);
        // Take snapshot of current data
        setSixMinuteSnapshot({
          timestamp: now.getTime(),
          digitCounts: [...digitCounts],
          digitColumnCounts: digitColumnCounts.map(arr => [...arr]),
          leftSideDigits: leftSideDigits.map(arr => [...arr]),
          rightSideDigits: rightSideDigits.map(arr => [...arr]),
          quadrantDigits: [...quadrantDigits],
          pressedCoordinates: [...pressedCoordinates]
        });

        // Optionally show a notification that 6 minutes have passed
        if (Platform.OS !== 'web') {
          Alert.alert(
            "6 Minutes Elapsed",
            "Six minutes have passed. You can continue the test or finish now.",
            [{ text: "Continue" }],
            { cancelable: true }
          );
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, digitCounts, digitColumnCounts, leftSideDigits, rightSideDigits, quadrantDigits, pressedCoordinates, sixMinutePassed]);
  
  // Add auto-show/hide overlay based on user inactivity
  useEffect(() => {
    const idleThreshold = 5000; // 5 seconds of inactivity
    
    const checkActivity = setInterval(() => {
      const now = Date.now();
      if (now - lastMovementTimestamp > idleThreshold) {
        setShowOverlay(false);
      }
    }, 1000);
    
    return () => clearInterval(checkActivity);
  }, [lastMovementTimestamp]);

  const maxDigits = useMemo(() => {
    return initialData.reduce((max, row) => {
      return Math.max(max, ...row.map(num => num.toString().length));
    }, 0);
  }, []);

  const handlePress = (rowIndex: number, colIndex: number, digitIndex: number) => {
    // Update movement timestamp on any interaction
    setLastMovementTimestamp(Date.now());
    setShowOverlay(false);

    const newData = data.map((row, rIdx) => row.map((number, cIdx) => {
      if (rIdx === rowIndex && cIdx === colIndex) {
        const newDigits = number.map((digit, dIdx) => {
          if (dIdx === digitIndex) {
            const newMarkedState = !digit.marked;
            const digitValue = parseInt(digit.value);
            
            // Only proceed if it's a valid digit (0-9)
            if (!isNaN(digitValue) && digitValue >= 0 && digitValue <= 9) {
              const digitArrayIndex = digitValue; // Convert digit to array index
              
              if (newMarkedState) {
                // Update the count for this specific digit
                setDigitCounts(prev => {
                  const newCounts = [...prev];
                  newCounts[digitArrayIndex]++;
                  return newCounts;
                });
                
                // Update column count for this digit
                setDigitColumnCounts(prev => {
                  const newCounts = [...prev];
                  newCounts[digitArrayIndex][colIndex]++;
                  return newCounts;
                });
                
                // Handle left/right side tracking
                const coordinate = { 
                  row: rowIndex, 
                  col: colIndex, 
                  digit: digitIndex, 
                  value: digit.value,
                  timestamp: Date.now() 
                };
                
                if (digitIndex < number.length / 2) {
                  setLeftSideDigits(prev => {
                    const newSides = [...prev];
                    newSides[digitArrayIndex] = [...newSides[digitArrayIndex], coordinate];
                    return newSides;
                  });
                } else {
                  setRightSideDigits(prev => {
                    const newSides = [...prev];
                    newSides[digitArrayIndex] = [...newSides[digitArrayIndex], coordinate];
                    return newSides;
                  });
                }
                
                // Update quadrant data
                setQuadrantDigits(prev => {
                  const newQuadrants = [...prev];
                  const quadrantKey = 
                    rowIndex < data.length / 2 
                      ? (colIndex < 5 ? 'upperLeft' : 'upperRight')
                      : (colIndex < 5 ? 'lowerLeft' : 'lowerRight');
                  
                  newQuadrants[digitArrayIndex] = {
                    ...newQuadrants[digitArrayIndex],
                    [quadrantKey]: [...newQuadrants[digitArrayIndex][quadrantKey], coordinate]
                  };
                  
                  return newQuadrants;
                });
              } else {
                // Handle unmarking a digit
                setDigitCounts(prev => {
                  const newCounts = [...prev];
                  newCounts[digitArrayIndex]--;
                  return newCounts;
                });
                
                setDigitColumnCounts(prev => {
                  const newCounts = [...prev];
                  newCounts[digitArrayIndex][colIndex]--;
                  return newCounts;
                });
                
                // Remove from appropriate lists
                const coordFilter = (coord: any) => 
                  !(coord.row === rowIndex && coord.col === colIndex && coord.digit === digitIndex);
                
                setLeftSideDigits(prev => {
                  const newSides = [...prev];
                  newSides[digitArrayIndex] = newSides[digitArrayIndex].filter(coordFilter);
                  return newSides;
                });
                
                setRightSideDigits(prev => {
                  const newSides = [...prev];
                  newSides[digitArrayIndex] = newSides[digitArrayIndex].filter(coordFilter);
                  return newSides;
                });
                
                setQuadrantDigits(prev => {
                  const newQuadrants = [...prev];
                  newQuadrants[digitArrayIndex] = {
                    upperLeft: newQuadrants[digitArrayIndex].upperLeft.filter(coordFilter),
                    lowerLeft: newQuadrants[digitArrayIndex].lowerLeft.filter(coordFilter),
                    upperRight: newQuadrants[digitArrayIndex].upperRight.filter(coordFilter),
                    lowerRight: newQuadrants[digitArrayIndex].lowerRight.filter(coordFilter)
                  };
                  return newQuadrants;
                });
              }
            }
            
            return { ...digit, marked: newMarkedState };
          }
          return digit;
        });
        return newDigits;
      }
      return number;
    }));

    setData(newData);
    
    // Add to pressed coordinates with timestamp
    setPressedCoordinates(prev => [
      ...prev, 
      { 
        row: rowIndex, 
        col: colIndex, 
        digit: digitIndex, 
        value: data[rowIndex][colIndex][digitIndex].value,
        timestamp: Date.now()
      }
    ]);
  };

  // Function to toggle overlay visibility
  const toggleOverlay = () => {
    setShowOverlay(prev => !prev);
  };

  return (
    <>
      <View style={styles.container}>
        <FlatList
          data={data}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item: row, index: rowIndex }) => (
            <FlatList
              data={row}
              horizontal
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item: number, index: colIndex }) => (
                <View style={[styles.cell, { width: cellWidth, height: cellHeight }]}>
                  {number.map((digit, digitIndex) => (
                    <Pressable
                      key={digitIndex}
                      style={[styles.digit, digit.marked && styles.markedDigit]}
                      onPress={() => handlePress(rowIndex, colIndex, digitIndex)}
                    >
                      <Text style={[styles.digitText, { fontSize: cellWidth / maxDigits }]}>{digit.value}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
          )}
          contentContainerStyle={styles.flatListContainer}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button      
          mode="contained"
          onPress={() => {
            router.push({
              pathname: "../resultsUI",
              params: {
                participantId,
                participantInitials,
                examinerInitials,
                digitCounts: JSON.stringify(digitCounts),
                digitColumnCounts: JSON.stringify(digitColumnCounts),
                leftSideDigits: JSON.stringify(leftSideDigits),
                rightSideDigits: JSON.stringify(rightSideDigits),
                quadrantDigits: JSON.stringify(quadrantDigits),
                pressedCoordinates: JSON.stringify(pressedCoordinates),
                elapsedTime: elapsedTime.toString(),
                startTime: startTime.toISOString(),
                // NEW: Add 6-minute snapshot data if available
                sixMinuteSnapshot: sixMinuteSnapshot ? JSON.stringify(sixMinuteSnapshot) : null,
                // Keep these for backward compatibility
                digit3Count: digitCounts[3].toString(),
                digit3ColumnCount: JSON.stringify(digitColumnCounts[3]),
                leftSide3s: JSON.stringify(leftSideDigits[3]),
                rightSide3s: JSON.stringify(rightSideDigits[3]),
                quadrant3s: JSON.stringify(quadrantDigits[3]),
              }
            });
          }}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Done
        </Button>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', 
    alignItems: 'center',
    backgroundColor: '#fafafa',
    paddingTop: Platform.OS === 'ios' ? '8%' : '4%',
  },
  flatListContainer: {
    justifyContent: 'center',
    paddingBottom: 20,
  },
  cell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1,
    marginVertical: 2,
    backgroundColor: '#ffffff',
    borderWidth: .5,
    borderRadius: 4,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  digit: {
    paddingHorizontal: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 1,
    borderRadius: 3,
    minWidth: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  markedDigit: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  digitText: {
    textAlign: 'center',
    color: '#212121',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 30,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  button: {
    width: 150,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#FFFFFF',
    paddingVertical: 4,
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cellWrapper: {
    margin: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  overlayToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    right: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  overlayToggleText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default Index;