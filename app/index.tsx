import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Dimensions, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';


// Get device dimensions
const { width, height } = Dimensions.get('window'); 

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

const Index = () => {
  const [data, setData] = useState(initialData.map(row => row.map(splitNumberIntoDigits)));
  interface Coordinate {
    row: number;
    col: number;
    digit: number;
  }
  
  const [pressedCoordinates, setPressedCoordinates] = useState<Coordinate[]>([]);
  const [digit3Count, setDigit3Count] = useState(0);
  const [digit3ColumnCount, setDigit3ColumnCount] = useState(Array(10).fill(0));
  const [leftSide3s, setLeftSide3s] = useState<Coordinate[]>([]);
  const [rightSide3s, setRightSide3s] = useState<Coordinate[]>([]);
  const [quadrant3s, setQuadrant3s] = useState({
    upperLeft: [] as Coordinate[],
    lowerLeft: [] as Coordinate[],
    upperRight: [] as Coordinate[],
    lowerRight: [] as Coordinate[]
  });


  const maxDigits = useMemo(() => {
    return initialData.reduce((max, row) => {
      return Math.max(max, ...row.map(num => num.toString().length));
    }, 0);
  }, []);

  const cellWidth = width / 10; // 10 columns across the device width
  const cellHeight = height / 20; // Adjust cell height based on the device height

  const handlePress = (rowIndex: number, colIndex: number, digitIndex: number) => {
    const newData = data.map((row, rIdx) => row.map((number, cIdx) => {
      if (rIdx === rowIndex && cIdx === colIndex) {
        const newDigits = number.map((digit, dIdx) => {
          if (dIdx === digitIndex) {
            const newMarkedState = !digit.marked;
            if (digit.value === '3') {
              if (newMarkedState) {
                setDigit3Count(prev => prev + 1);
                setDigit3ColumnCount(prev => {
                  const newCount = [...prev];
                  newCount[colIndex]++;
                  return newCount;
                });
                if (digitIndex < number.length / 2) {
                  setLeftSide3s(prev => [...prev, { row: rowIndex, col: colIndex, digit: digitIndex }]);
                } else {
                  setRightSide3s(prev => [...prev, { row: rowIndex, col: colIndex, digit: digitIndex }]);
                }
                if (rowIndex < data.length / 2 && colIndex < 5) {
                  setQuadrant3s(prev => ({
                    ...prev,
                    upperLeft: [...prev.upperLeft, { row: rowIndex, col: colIndex, digit: digitIndex }]
                  }));
                } else if (rowIndex >= data.length / 2 && colIndex < 5) {
                  setQuadrant3s(prev => ({
                    ...prev,
                    lowerLeft: [...prev.lowerLeft, { row: rowIndex, col: colIndex, digit: digitIndex }]
                  }));
                } else if (rowIndex < data.length / 2 && colIndex >= 5) {
                  setQuadrant3s(prev => ({
                    ...prev,
                    upperRight: [...prev.upperRight, { row: rowIndex, col: colIndex, digit: digitIndex }]
                  }));
                } else {
                  setQuadrant3s(prev => ({
                    ...prev,
                    lowerRight: [...prev.lowerRight, { row: rowIndex, col: colIndex, digit: digitIndex }]
                  }));
                }
              } else {
                setDigit3Count(prev => prev - 1);
                setDigit3ColumnCount(prev => {
                  const newCount = [...prev];
                  newCount[colIndex]--;
                  return newCount;
                });
                setLeftSide3s(prev => prev.filter(coord => !(coord.row === rowIndex && coord.col === colIndex && coord.digit === digitIndex)));
                setRightSide3s(prev => prev.filter(coord => !(coord.row === rowIndex && coord.col === colIndex && coord.digit === digitIndex)));
                setQuadrant3s(prev => ({
                  upperLeft: prev.upperLeft.filter(coord => !(coord.row === rowIndex && coord.col === colIndex && coord.digit === digitIndex)),
                  lowerLeft: prev.lowerLeft.filter(coord => !(coord.row === rowIndex && coord.col === colIndex && coord.digit === digitIndex)),
                  upperRight: prev.upperRight.filter(coord => !(coord.row === rowIndex && coord.col === colIndex && coord.digit === digitIndex)),
                  lowerRight: prev.lowerRight.filter(coord => !(coord.row === rowIndex && coord.col === colIndex && coord.digit === digitIndex))
                }));
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
    setPressedCoordinates(prev => [...prev, { row: rowIndex, col: colIndex, digit: digitIndex }]);
  };

  console.log('Pressed Coordinates:', pressedCoordinates);
  console.log('Number of digit "3" pressed:', digit3Count);
  console.log('Number of digit "3" pressed in each column:', digit3ColumnCount);
  console.log('List of "3" digits pressed on the left side of strings:', leftSide3s);
  console.log('List of "3" digits pressed on the right side of strings:', rightSide3s);
  console.log('List of "3" digits pressed in quadrants:', quadrant3s);

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
              digit3Count,
              digit3ColumnCount: JSON.stringify(digit3ColumnCount),
              leftSide3s: JSON.stringify(leftSide3s),
              rightSide3s: JSON.stringify(rightSide3s),
              quadrant3s: JSON.stringify(quadrant3s),
              pressedCoordinates: JSON.stringify(pressedCoordinates),
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
    justifyContent: 'flex-start', // Change from center to flex-start
    alignItems: 'center',
    backgroundColor: '#fafafa',
    // paddingTop: '4%', // Add responsive padding
    // paddingHorizontal: '5%',
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
    paddingHorizontal: 1, // More space between digits
    backgroundColor: '#ffffff',
    marginHorizontal: 1, // Space between digits
    borderRadius: 3,
    minWidth: 12, // Ensure minimum touch target size
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
    color: '#212121', // Darker text for better readability
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
      backgroundColor: '#2196F3', // Primary blue color
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
});

export default Index;
