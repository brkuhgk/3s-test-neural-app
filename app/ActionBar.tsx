import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ActionsBarProps {
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

const ActionsBar: React.FC<ActionsBarProps> = ({ data }) => {
  const router = useRouter();

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString();
  };

  const generateCSV = () => {
    // Parse JSON strings
    const columnCounts = JSON.parse(data.digit3ColumnCount);
    const leftSide3s = JSON.parse(data.leftSide3s);
    const rightSide3s = JSON.parse(data.rightSide3s);
    const quadrant3s = JSON.parse(data.quadrant3s);

    // Calculate statistics
    const digit3Count = parseInt(data.digit3Count);
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

    // Create CSV content
    const csvContent = [
      'Participant ID,Participant Initials,Date,Examiner Initials',
      `${data.participantId},${data.participantInitials},${formatDate()},${data.examinerInitials}`,
      '',
      'a. Time (seconds)',
      data.elapsedTime,
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
        
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Test Results'
        });
      }
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  const handleNewTest = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <View style={styles.buttonsRow}>
          <Button
            mode="contained"
            onPress={handleExport}
            style={[styles.button, styles.exportButton]}
            icon={({ size, color }) => (
              <Ionicons name="download-outline" size={size} color={color} />
            )}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Export Results
          </Button>

          <Button
            mode="contained"
            onPress={handleNewTest}
            style={[styles.button, styles.newTestButton]}
            icon={({ size, color }) => (
              <Ionicons name="add-circle-outline" size={size} color={color} />
            )}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            New Test
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  cardContainer: {
    backgroundColor: '#242444',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 44,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  exportButton: {
    backgroundColor: '#4B9EF8',
  },
  newTestButton: {
    backgroundColor: '#4CAF50',
  },
});

export default ActionsBar;


// usage 
// {/* Add the simplified ActionsBar */}
// <ActionsBar
// data={{
//   participantId: params.participantId as string,
//   participantInitials: params.participantInitials as string,
//   examinerInitials: params.examinerInitials as string,
//   elapsedTime: params.elapsedTime as string,
//   digit3Count: params.digit3Count as string,
//   digit3ColumnCount: params.digit3ColumnCount as string,
//   leftSide3s: params.leftSide3s as string,
//   rightSide3s: params.rightSide3s as string,
//   quadrant3s: params.quadrant3s as string,
// }}
// />