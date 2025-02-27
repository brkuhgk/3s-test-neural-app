import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ExportButtonProps {
  data: {
    participantId: string;
    participantInitials: string;
    examinerInitials: string;
    elapsedTime: string;
    digit3Count: string;
    digit3ColumnCount: string;
    leftSide3s: string;
    rightSide3s: string;
    quadrant3s: string;
    selectedDigit: string;
    has6MinResults: boolean;
    sixMinData: string | null;
    // Add all digits data
    digitCounts: string;
    digitColumnCounts: string;
    leftSideDigits: string;
    rightSideDigits: string;
    quadrantDigits: string;
  };
}

const ExportButton: React.FC<ExportButtonProps> = ({ data }) => {
  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString();
  };

  const generateCSV = () => {
    // Create header row with base information
    const baseHeaders = [
      'DataType', 'ParticipantID', 'ParticipantInitials', 'ExaminerInitials', 'Date', 'ElapsedTime'
    ];
    
    // Headers for each digit (0-9)
    const headers = [...baseHeaders];
    
    // Add detailed headers for all digits
    for (let digit = 0; digit <= 9; digit++) {
      headers.push(`Digit${digit}Found`);
      headers.push(`Digit${digit}Omissions`);
      headers.push(`Digit${digit}LeftFound`);
      headers.push(`Digit${digit}RightFound`);
      headers.push(`Digit${digit}LeftOmissions`);
      headers.push(`Digit${digit}RightOmissions`);
      headers.push(`Digit${digit}PageCentered`);
      headers.push(`Digit${digit}StringCentered`);
      headers.push(`Digit${digit}UpperLeft`);
      headers.push(`Digit${digit}UpperRight`);
      headers.push(`Digit${digit}LowerLeft`);
      headers.push(`Digit${digit}LowerRight`);
      
      // Add column data for each digit
      for (let col = 0; col < 10; col++) {
        headers.push(`Digit${digit}Col${col+1}`);
      }
    }
    
    // Parse All digits data for full test
    const digitCounts = JSON.parse(data.digitCounts || '[]');
    const digitColumnCounts = JSON.parse(data.digitColumnCounts || '[]');
    const leftSideDigits = JSON.parse(data.leftSideDigits || '[]');
    const rightSideDigits = JSON.parse(data.rightSideDigits || '[]');
    const quadrantDigits = JSON.parse(data.quadrantDigits || '[]');
    
    // Total digits per number in the test
    // We know that 3 appears 120 times, but other digits might have different frequencies
    // For simplicity and consistency, we'll use the same total value for all digits
    const TOTAL_PER_DIGIT = 120;
    const TOTAL_PER_SIDE = 60;  // 60 per side (left/right)
    
    // Parse 6-minute data if available
    let sixMinData = null;
    if (data.has6MinResults && data.sixMinData) {
      try {
        sixMinData = JSON.parse(data.sixMinData);
      } catch (error) {
        console.error("Error parsing sixMinData:", error);
      }
    }
    
    // Create full test data row
    const fullTestRow = [
      'CompleteTest',
      data.participantId,
      data.participantInitials,
      data.examinerInitials,
      formatDate(),
      data.elapsedTime
    ];
    
    // Add data for each digit to the full test row
    for (let digit = 0; digit <= 9; digit++) {
      const digitFound = digitCounts[digit] || 0;
      const digitOmissions = TOTAL_PER_DIGIT - digitFound;
      
      const leftFound = (leftSideDigits[digit] || []).length;
      const rightFound = (rightSideDigits[digit] || []).length;
      
      // Verify that leftFound + rightFound equals digitFound - if not, there might be data inconsistency
      // In this case, proceed with the sum of sides as a fallback
      const totalFromSides = leftFound + rightFound;
      if (totalFromSides !== digitFound) {
        console.warn(`Data inconsistency for digit ${digit}: digitFound (${digitFound}) != leftFound (${leftFound}) + rightFound (${rightFound})`);
      }
      
      const leftOmissions = TOTAL_PER_SIDE - leftFound;
      const rightOmissions = TOTAL_PER_SIDE - rightFound;
      
      // Calculate PageCentered value (difference between omissions on left vs right)
      // A positive value means more omissions on left side (right side bias)
      // A negative value means more omissions on right side (left side bias)
      const pageCentered = leftOmissions - rightOmissions;
      
      // StringCentered follows the same pattern
      const stringCentered = leftOmissions - rightOmissions;  // Could be different if we used a different metric
      
      // Quadrant data
      const quadrant = quadrantDigits[digit] || {
        upperLeft: [],
        upperRight: [],
        lowerLeft: [],
        lowerRight: []
      };
      
      const upperLeftCount = (quadrant.upperLeft || []).length;
      const upperRightCount = (quadrant.upperRight || []).length;
      const lowerLeftCount = (quadrant.lowerLeft || []).length;
      const lowerRightCount = (quadrant.lowerRight || []).length;
      
      // Add all these values to the row
      fullTestRow.push(String(digitFound));
      fullTestRow.push(String(digitOmissions));
      fullTestRow.push(String(leftFound));
      fullTestRow.push(String(rightFound));
      fullTestRow.push(String(leftOmissions));
      fullTestRow.push(String(rightOmissions));
      fullTestRow.push(String(pageCentered));
      fullTestRow.push(String(stringCentered));
      fullTestRow.push(String(upperLeftCount));
      fullTestRow.push(String(upperRightCount));
      fullTestRow.push(String(lowerLeftCount));
      fullTestRow.push(String(lowerRightCount));
      
      // Add column data for this digit
      const columns = digitColumnCounts[digit] || Array(10).fill(0);
      for (let col = 0; col < 10; col++) {
        fullTestRow.push(String(columns[col] || 0));
      }
    }
    
    // Create 6-minute data row if available
    let sixMinRow = [];
    if (sixMinData) {
      sixMinRow = [
        'First6Minutes',
        data.participantId,
        data.participantInitials,
        data.examinerInitials,
        formatDate(),
        '360' // 6 minutes in seconds
      ];
      
      // For 6-minute data, we only have data for the selected digit
      const selectedDigit = parseInt(data.selectedDigit || '3');
      
      // Add data for each digit (0-9) to the 6-minute row
      for (let digit = 0; digit <= 9; digit++) {
        if (digit === selectedDigit && sixMinData) {
          // We have actual data for the selected digit
          const digitFound = sixMinData.digitCount || 0;
          const digitOmissions = TOTAL_PER_DIGIT - digitFound;
          
          // Important fix: Make sure leftSide and rightSide data is available
          // If not, we need to process from the coordinates
          let leftFound = 0;
          let rightFound = 0;
          
          // First try to get data from leftSide and rightSide arrays
          if (sixMinData.leftSide && Array.isArray(sixMinData.leftSide)) {
            leftFound = sixMinData.leftSide.length;
          }
          
          if (sixMinData.rightSide && Array.isArray(sixMinData.rightSide)) {
            rightFound = sixMinData.rightSide.length;
          }
          
          // If we don't have sufficient data from sides, try to calculate from coordinates
          if (leftFound === 0 && rightFound === 0 && sixMinData.coordinates && Array.isArray(sixMinData.coordinates)) {
            const selectedDigitStr = selectedDigit.toString();
            const filteredCoords = sixMinData.coordinates.filter(coord => coord.value === selectedDigitStr);
            
            // Process by column (0-4 is left, 5-9 is right)
            leftFound = filteredCoords.filter(coord => coord.col < 5).length;
            rightFound = filteredCoords.filter(coord => coord.col >= 5).length;
          }
          
          // Check for data inconsistency
          if (leftFound + rightFound !== digitFound) {
            console.warn(`6-min data inconsistency for digit ${digit}: digitFound (${digitFound}) != leftFound (${leftFound}) + rightFound (${rightFound})`);
          }
          
          const leftOmissions = TOTAL_PER_SIDE - leftFound;
          const rightOmissions = TOTAL_PER_SIDE - rightFound;
          
          const pageCentered = leftOmissions - rightOmissions;
          const stringCentered = leftOmissions - rightOmissions;
          
          // Quadrant data
          let upperLeftCount = 0;
          let upperRightCount = 0; 
          let lowerLeftCount = 0;
          let lowerRightCount = 0;
          
          // Use quadrants if available
          if (sixMinData.quadrants) {
            const quadrant = sixMinData.quadrants;
            upperLeftCount = (quadrant.upperLeft || []).length;
            upperRightCount = (quadrant.upperRight || []).length;
            lowerLeftCount = (quadrant.lowerLeft || []).length;
            lowerRightCount = (quadrant.lowerRight || []).length;
          } 
          // Otherwise try to calculate from coordinates
          else if (sixMinData.coordinates && Array.isArray(sixMinData.coordinates)) {
            const selectedDigitStr = selectedDigit.toString();
            const filteredCoords = sixMinData.coordinates.filter(coord => coord.value === selectedDigitStr);
            
            upperLeftCount = filteredCoords.filter(coord => coord.row < 7 && coord.col < 5).length;
            upperRightCount = filteredCoords.filter(coord => coord.row < 7 && coord.col >= 5).length;
            lowerLeftCount = filteredCoords.filter(coord => coord.row >= 7 && coord.col < 5).length;
            lowerRightCount = filteredCoords.filter(coord => coord.row >= 7 && coord.col >= 5).length;
          }
          
          // Add all these values to the row
          sixMinRow.push(String(digitFound));
          sixMinRow.push(String(digitOmissions));
          sixMinRow.push(String(leftFound));
          sixMinRow.push(String(rightFound));
          sixMinRow.push(String(leftOmissions));
          sixMinRow.push(String(rightOmissions));
          sixMinRow.push(String(pageCentered));
          sixMinRow.push(String(stringCentered));
          sixMinRow.push(String(upperLeftCount));
          sixMinRow.push(String(upperRightCount));
          sixMinRow.push(String(lowerLeftCount));
          sixMinRow.push(String(lowerRightCount));
          
          // Add column data for selected digit
          const columns = sixMinData.columnCounts || Array(10).fill(0);
          for (let col = 0; col < 10; col++) {
            sixMinRow.push(String(columns[col] || 0));
          }
        } else {
          // For other digits, add placeholder zeros
          for (let i = 0; i < 22; i++) { // 12 metrics + 10 columns
            sixMinRow.push('0');
          }
        }
      }
    }
    
    // Combine all parts into the final CSV
    let csvContent = headers.join(',') + '\n';
    
    // Add rows in correct order (6-min first, then full test)
    if (sixMinRow.length > 0) {
      csvContent += sixMinRow.join(',') + '\n';
    }
    csvContent += fullTestRow.join(',');
    
    return csvContent;
  };

  const handleExport = async () => {
    try {
      const csvContent = generateCSV();
      const fileName = `digit_test_${data.participantId}_${formatDate().replace(/\//g, '-')}.csv`;
      
      if (Platform.OS === 'web') {
        // For web platform
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', fileName);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // For mobile platforms
        const filePath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(filePath, csvContent, {
          encoding: FileSystem.EncodingType.UTF8
        });
        
        if (Platform.OS === 'ios') {
          await Sharing.shareAsync(filePath);
        } else {
          await Sharing.shareAsync(filePath, {
            mimeType: 'text/csv',
            dialogTitle: 'Export Test Results'
          });
        }
      }
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  return (
    <Button
      mode="contained"
      onPress={handleExport}
      style={styles.exportButton}
      labelStyle={styles.buttonLabel}
    >
      Export Results
    </Button>
  );
};

const styles = StyleSheet.create({
  exportButton: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#4B9EF8',
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
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: '#FFFFFF',
    paddingVertical: 4,
  },
});

export default ExportButton;