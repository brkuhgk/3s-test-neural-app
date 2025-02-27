// import React, { useState, useEffect } from 'react';
// import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { Card, Button } from 'react-native-paper';
// import { BarChart } from 'react-native-gifted-charts';
// import { Ionicons } from '@expo/vector-icons';
// import ExportButton from './ExportButton';
// import UserMovementAnalysis from '../components/UserMovementAnalysis';
// import MovementPatternSection from '../components/MovementPatternSection';
// import FinalResultsIntegration from '../components/FinalResultsIntegration';
// import DigitSelector from '../components/DigitSelector';

// const { width, height } = Dimensions.get('window');

// const ResultsUI = () => {
//   const params = useLocalSearchParams();
//   const router = useRouter();
//   const [selectedDigit, setSelectedDigit] = useState(3); // Default to digit '3'

//   // Initialize state with empty arrays/objects instead of undefined
// const [digitCounts, setDigitCounts] = useState(Array(10).fill(0));
// const [digitColumnCounts, setDigitColumnCounts] = useState(Array(10).fill().map(() => Array(10).fill(0)));
// const [leftSideDigits, setLeftSideDigits] = useState(Array(10).fill().map(() => []));
// const [rightSideDigits, setRightSideDigits] = useState(Array(10).fill().map(() => []));
// const [quadrantDigits, setQuadrantDigits] = useState(Array(10).fill().map(() => ({
//   upperLeft: [],
//   lowerLeft: [],
//   upperRight: [],
//   lowerRight: []
// })));

  

//   useEffect(() => {
//     // Initialize data from params only once when the component mounts or when params change
//     if (params.digitCounts) {
//       try {
//         const parsedDigitCounts = JSON.parse(params.digitCounts as string);
//         setDigitCounts(parsedDigitCounts);
//       } catch (error) {
//         console.error("Error parsing digitCounts:", error);
//       }
//     }
//     if (params.digitColumnCounts) {
//       try {
//         const parsedColumnCounts = JSON.parse(params.digitColumnCounts as string);
//         setDigitColumnCounts(parsedColumnCounts);
//       } catch (error) {
//         console.error("Error parsing digitColumnCounts:", error);
//       }
//     }
//     if (params.leftSideDigits) {
//       try {
//         const parsedLeftSideDigits = JSON.parse(params.leftSideDigits as string);
//         setLeftSideDigits(parsedLeftSideDigits);
//       } catch (error) {
//         console.error("Error parsing leftSideDigits:", error);
//       }
//     }
//     if (params.rightSideDigits) {
//       try {
//         const parsedRightSideDigits = JSON.parse(params.rightSideDigits as string);
//         setRightSideDigits(parsedRightSideDigits);
//       } catch (error) {
//         console.error("Error parsing rightSideDigits:", error);
//       }
//     }
//     if (params.quadrantDigits) {
//       try {
//         const parsedQuadrantDigits = JSON.parse(params.quadrantDigits as string);
//         setQuadrantDigits(parsedQuadrantDigits);
//       } catch (error) {
//         console.error("Error parsing quadrantDigits:", error);
//       }
//     }
//   }, [params.digitCounts, params.digitColumnCounts, params.leftSideDigits, params.rightSideDigits, params.quadrantDigits]);

//   // Handle digit selection change
//   const handleDigitChange = (digit) => {
//     setSelectedDigit(digit);
//   };

//   // Get the current digit data based on selection
//   const currentDigitData = {
//     digitCount: digitCounts[selectedDigit] || 0,
//     columnCounts: digitColumnCounts[selectedDigit] || Array(10).fill(0),
//     leftSide: leftSideDigits[selectedDigit] || [],
//     rightSide: rightSideDigits[selectedDigit] || [],
//     quadrants: quadrantDigits[selectedDigit] || {
//       upperLeft: [],
//       lowerLeft: [],
//       upperRight: [],
//       lowerRight: []
//     }
//   };

//   // Prepare grouped bar data for columns
//   const columnBarData = [];
//   for (let i = 0; i < 10; i++) {
//     columnBarData.push({
//       value: (currentDigitData.leftSide || []).filter(coord => coord.col === i).length,
//       frontColor: '#4B9EF8',
//       label: `${i + 1}`,
//       spacing: 2,
//     });
//     columnBarData.push({
//       value: (currentDigitData.rightSide || []).filter(coord => coord.col === i).length,
//       frontColor: '#22B5F5',
//       spacing: 18,
//     });
//   }

//   // Prepare data for quadrants with left/right split
//   const quadrantBarData = [
//     // Upper Left Quadrant
//     {
//       value: (currentDigitData.leftSide || []).filter(coord => 
//         coord.row < 5 && coord.col < 5
//       ).length,
//       frontColor: '#4B9EF8',
//       label: 'UL',
//       spacing: 2,
//     },
//     {
//       value: (currentDigitData.rightSide || []).filter(coord => 
//         coord.row < 5 && coord.col < 5
//       ).length,
//       frontColor: '#22B5F5',
//       spacing: 40,
//     },
//     // Upper Right Quadrant
//     {
//       value: (currentDigitData.leftSide || []).filter(coord => 
//         coord.row < 5 && coord.col >= 5
//       ).length,
//       frontColor: '#4B9EF8',
//       label: 'UR',
//       spacing: 2,
//     },
//     {
//       value: (currentDigitData.rightSide || []).filter(coord => 
//         coord.row < 5 && coord.col >= 5
//       ).length,
//       frontColor: '#22B5F5',
//       spacing: 40,
//     },
//     // Lower Left Quadrant
//     {
//       value: (currentDigitData.leftSide || []).filter(coord => 
//         coord.row >= 5 && coord.col < 5
//       ).length,
//       frontColor: '#4B9EF8',
//       label: 'LL',
//       spacing: 2,
//     },
//     {
//       value: (currentDigitData.rightSide || []).filter(coord => 
//         coord.row >= 5 && coord.col < 5
//       ).length,
//       frontColor: '#22B5F5',
//       spacing: 40,
//     },
//     // Lower Right Quadrant
//     {
//       value: (currentDigitData.leftSide || []).filter(coord => 
//         coord.row >= 5 && coord.col >= 5
//       ).length,
//       frontColor: '#4B9EF8',
//       label: 'LR',
//       spacing: 2,
//     },
//     {
//       value: (currentDigitData.rightSide || []).filter(coord => 
//         coord.row >= 5 && coord.col >= 5
//       ).length,
//       frontColor: '#22B5F5',
//       spacing: 40,
//     },
//   ];

//   return (
//     <View style={styles.container}>
//       {/* Header with Back Button */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => router.back()}
//         >
//           <Ionicons name="arrow-back" size={24} color="white" />
//           <Text style={styles.backText}>Back</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.scrollContainer}>
//         <View style={styles.content}>
//           {/* Add the DigitSelector component */}
//           <DigitSelector 
//             selectedDigit={selectedDigit} 
//             onDigitChange={handleDigitChange} 
//           />

//           <View style={styles.chartsRow}>
//             {/* Column Distribution Chart */}
//             <Card style={[styles.darkCard, styles.chartCard]}>
//               <Card.Title 
//                 title={`Column Distribution - Digit ${selectedDigit}`}
//                 titleStyle={styles.cardTitle}
//               />
//               <Card.Content>
//                 <View style={styles.chartContainer}>
//                   <BarChart
//                     data={columnBarData}
//                     barWidth={15}
//                     spacing={2}
//                     roundedTop
//                     roundedBottom
//                     hideRules
//                     xAxisColor={'rgba(0,0,0,0.2)'}
//                     yAxisColor={'rgba(0,0,0,0.2)'}
//                     yAxisTextStyle={{ color: '#000', fontSize: 12 }}
//                     xAxisLabelTextStyle={{ color: '#000', fontSize: 12 }}
//                     noOfSections={10}
//                     maxValue={12}
//                     width={(width/2) - 40}
//                     height={250}
//                     isAnimated
//                   />
//                   <View style={styles.legendContainer}>
//                     <View style={styles.legendItem}>
//                       <View style={[styles.legendColor, { backgroundColor: '#4B9EF8' }]} />
//                       <Text style={styles.legendText}>Left Side</Text>
//                     </View>
//                     <View style={styles.legendItem}>
//                       <View style={[styles.legendColor, { backgroundColor: '#22B5F5' }]} />
//                       <Text style={styles.legendText}>Right Side</Text>
//                     </View>
//                   </View>
//                 </View>
//               </Card.Content>
//             </Card>

//             {/* Quadrant Distribution Chart */}
//             <Card style={[styles.darkCard, styles.chartCard]}>
//               <Card.Title 
//                 title={`Quadrant Distribution - Digit ${selectedDigit}`}
//                 titleStyle={styles.cardTitle}
//               />
//               <Card.Content>
//                 <View style={styles.chartContainer}>
//                   <BarChart
//                     data={quadrantBarData}
//                     barWidth={20}
//                     spacing={2}
//                     roundedTop
//                     roundedBottom
//                     hideRules
//                     xAxisColor={'rgba(0,0,0,0.2)'}
//                     yAxisColor={'rgba(0,0,0,0.2)'}
//                     yAxisTextStyle={{ color: '#000', fontSize: 12 }}
//                     xAxisLabelTextStyle={{ color: '#000', fontSize: 12 }}
//                     noOfSections={10}
//                     maxValue={20}
//                     width={(width/2) - 40}
//                     height={250}
//                     isAnimated
//                   />
//                   <View style={styles.legendContainer}>
//                     <View style={styles.legendItem}>
//                       <View style={[styles.legendColor, { backgroundColor: '#4B9EF8' }]} />
//                       <Text style={styles.legendText}>Left Side</Text>
//                     </View>
//                     <View style={styles.legendItem}>
//                       <View style={[styles.legendColor, { backgroundColor: '#22B5F5' }]} />
//                       <Text style={styles.legendText}>Right Side</Text>
//                     </View>
//                   </View>
//                 </View>
//               </Card.Content>
//             </Card>
//           </View>
//         </View>
        
//         {/* Pass the selected digit data to the results integration component */}
//         <FinalResultsIntegration 
//           currentDigitData={currentDigitData}
//           selectedDigit={selectedDigit}
//           params={{
//             ...params,
//             digitCount: currentDigitData.digitCount.toString(),
//             digitColumnCount: JSON.stringify(currentDigitData.columnCounts),
//             leftSideDigits: JSON.stringify(currentDigitData.leftSide),
//             rightSideDigits: JSON.stringify(currentDigitData.rightSide),
//             quadrantDigits: JSON.stringify(currentDigitData.quadrants),
//           }}
//         />

//         <View style={styles.buttonsContainer}>
//           {/* Update the ExportButton to use the selected digit data */}
//           <ExportButton
//             data={{
//               participantId: params.participantId as string,
//               participantInitials: params.participantInitials as string,
//               examinerInitials: params.examinerInitials as string,
//               elapsedTime: params.elapsedTime as string,
//               digit3Count: currentDigitData.digitCount.toString(),
//               digit3ColumnCount: JSON.stringify(currentDigitData.columnCounts),
//               leftSide3s: JSON.stringify(currentDigitData.leftSide),
//               rightSide3s: JSON.stringify(currentDigitData.rightSide),
//               quadrant3s: JSON.stringify(currentDigitData.quadrants),
//               selectedDigit: selectedDigit.toString(),
//             }}
//           />

//           <Button
//             mode="contained"
//             onPress={() => router.push('/')}
//             style={styles.newTestButton}
//             labelStyle={styles.buttonLabel}
//           >
//             New Test
//           </Button>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const formatTime = (seconds: number) => {
//   const minutes = Math.floor(seconds / 60);
//   const remainingSeconds = seconds % 60;
//   return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F0F4F8', // Light background color
//   },
//   header: {
//     paddingTop: 60,
//     paddingHorizontal: 16,
//     paddingBottom: 16,
//     backgroundColor: '#4B9EF8', // Enhanced color for header
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(0,0,0,0.1)',
//   },
//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   backText: {
//     color: '#FFFFFF', // White text color
//     fontSize: 16,
//     marginLeft: 8,
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   content: {
//     padding: 16,
//   },
//   chartsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     flexWrap: 'wrap',
//   },
//   chartCard: {
//     width: (width / 2) - 24,
//     marginBottom: 16,
//   },
//   darkCard: {
//     backgroundColor: '#FFFFFF', // Light card background
//     elevation: 4,
//     borderRadius: 1,
//   },
//   cardTitle: {
//     color: '#333333', // Dark text color for titles
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   chartContainer: {
//     alignItems: 'center',
//     marginVertical: 10,
//   },
//   legendContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 20,
//     flexWrap: 'wrap',
//   },
//   legendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 10,
//     marginVertical: 5,
//   },
//   legendColor: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     marginRight: 5,
//   },
//   legendText: {
//     fontSize: 12,
//     color: '#333333', // Dark text color for legend
//   },
//   timeValue: {
//     color: '#4B9EF8',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   timeLabel: {
//     color: 'rgba(255,255,255,0.7)',
//     fontSize: 14,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 4,
//     paddingBottom: 4,
//     borderBottomWidth: 0.5,
//     borderBottomColor: 'rgba(0,0,0,0.1)',
//   },
//   buttonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 12,
//   },
//   newTestButton: {
//     backgroundColor: '#4CAF50',
//     borderRadius: 8,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     marginTop: 16,
//     marginHorizontal: 16,
//     marginBottom: 24,
//   },
//   buttonLabel: {
//     fontSize: 18,
//     fontWeight: '500',
//     letterSpacing: 0.5,
//     color: '#FFFFFF',
//     paddingVertical: 4,
//   },
// });

// export default ResultsUI;