import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
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
  };
}

const ExportButton: React.FC<ExportButtonProps> = ({ data }) => {
  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString();
  };

  const generateCSV = () => {
    // Parse JSON strings
    const columnCounts = JSON.parse(data.digit3ColumnCount || '[]');
    const leftSide3s = JSON.parse(data.leftSide3s || '[]');
    const rightSide3s = JSON.parse(data.rightSide3s || '[]');
    const quadrant3s = JSON.parse(data.quadrant3s || '{}');

    // Calculate statistics
    const digit3Count = parseInt(data.digit3Count || '0');
    const totalOmissions = 120 - digit3Count;
    
    // Page side calculations
    const leftPageCount = columnCounts.slice(0, 5).reduce((a: number, b: number) => a + b, 0);
    const rightPageCount = columnCounts.slice(5, 10).reduce((a: number, b: number) => a + b, 0);
    const leftPageOmissions = 60 - leftPageCount;
    const rightPageOmissions = 60 - rightPageCount;
    const pageCenteredOmission = leftPageOmissions - rightPageOmissions;

    // String side calculations
    const leftStringCount = leftSide3s.length;
    const rightStringCount = rightSide3s.length;
    const leftStringOmissions = 60 - leftStringCount;
    const rightStringOmissions = 60 - rightStringCount;
    const stringCenteredOmission = leftStringOmissions - rightStringOmissions;

    // Format column counts as "left/right"
    const columnData = Array(10).fill(0).map((_, i) => {
      const leftCount = leftSide3s.filter((coord: any) => coord.col === i).length;
      const rightCount = rightSide3s.filter((coord: any) => coord.col === i).length;
      return `${leftCount}/${rightCount}`;
    });

    // Format quadrant counts
    const upperLeft = `${(quadrant3s.upperLeft || []).length}/${15 - (quadrant3s.upperLeft || []).length}`;
    const lowerLeft = `${(quadrant3s.lowerLeft || []).length}/${15 - (quadrant3s.lowerLeft || []).length}`;
    const upperRight = `${(quadrant3s.upperRight || []).length}/${15 - (quadrant3s.upperRight || []).length}`;
    const lowerRight = `${(quadrant3s.lowerRight || []).length}/${15 - (quadrant3s.lowerRight || []).length}`;

    // Create CSV content
    const csvContent = [
      'Participant ID,Participant Initials,Date,Examiner Initials',
      `${data.participantId},${data.participantInitials},${formatDate()},${data.examinerInitials}`,
      '',
      'a. Time (seconds)',
      data.elapsedTime,
      '',
      'c. Number of crossed 3s in each column (left/right)',
      ...columnData.map((count, i) => `Column ${i + 1},${count}`),
      '',
      'd. Number of crossed 3s in each quadrant (actual/total)',
      `Upper Left,${upperLeft}`,
      `Lower Left,${lowerLeft}`,
      `Upper Right,${upperRight}`,
      `Lower Right,${lowerRight}`,
      '',
      'Overall Statistics',
      `e. Total crossed 3s,${digit3Count}`,
      `f. Total omissions,${totalOmissions}`,
      '',
      'Page Side Analysis',
      `g. Left side crossed 3s,${leftPageCount}`,
      `h. Left side omissions,${leftPageOmissions}`,
      `i. Right side crossed 3s,${rightPageCount}`,
      `j. Right side omissions,${rightPageOmissions}`,
      `k. Page-centered omission,${pageCenteredOmission}`,
      '',
      'String Analysis',
      `l. Left string crossed 3s,${leftStringCount}`,
      `m. Left string omissions,${leftStringOmissions}`,
      `n. Right string crossed 3s,${rightStringCount}`,
      `o. Right string omissions,${rightStringOmissions}`,
      `p. String-centered omission,${stringCenteredOmission}`
    ].join('\n');

    return csvContent;
  };

  const handleExport = async () => {
    try {
      const csvContent = generateCSV();
      const fileName = `3s_test_${data.participantId}_${formatDate().replace(/\//g, '-')}.csv`;
      
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