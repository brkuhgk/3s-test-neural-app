import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card , Button} from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import ExportButton from './ExportButton';


const { width, height } = Dimensions.get('window');

const ResultsUI = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  const handlePrint = () => {
    // Implement print functionality
    console.log('Print functionality to be implemented');
  };

  const handleShare = async () => {
    // Implement share functionality
    console.log('Share functionality to be implemented');
  };

  
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
        </View>
        <ResultsDescriptionUI />
      <View style={styles.buttonsContainer}>
         {/* Add the ExportButton component here */}
         <ExportButton
         
          data={{
            participantId: params.participantId as string,
            participantInitials: params.participantInitials as string,
            examinerInitials: params.examinerInitials as string,
            elapsedTime: params.elapsedTime as string,
            digit3Count: params.digit3Count as string,
            digit3ColumnCount: params.digit3ColumnCount as string,
            leftSide3s: params.leftSide3s as string,
            rightSide3s: params.rightSide3s as string,
            quadrant3s: params.quadrant3s as string,
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

      
      </ScrollView>
    </View>
  );
};
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const ResultsDescriptionUI = () => {
  const params = useLocalSearchParams();
  
  // Parse the JSON strings from params
  const leftSide3s = JSON.parse(params.leftSide3s as string);
  const rightSide3s = JSON.parse(params.rightSide3s as string);
  const quadrant3s = JSON.parse(params.quadrant3s as string);
  const digit3Count = parseInt(params.digit3Count as string);
  const columnCounts = JSON.parse(params.digit3ColumnCount as string);

  // Calculate statistics
  const leftPageCount = columnCounts.slice(0, 5).reduce((a, b) => a + b, 0);
  const rightPageCount = columnCounts.slice(5, 10).reduce((a, b) => a + b, 0);
  const leftStringCount = leftSide3s.length;
  const rightStringCount = rightSide3s.length;

  // Calculate omissions
  const totalOmissions = 120 - digit3Count;
  const leftPageOmissions = 60 - leftPageCount;
  const rightPageOmissions = 60 - rightPageCount;
  const pageCenteredOmission = leftPageOmissions - rightPageOmissions;
  
  const leftStringOmissions = 60 - leftStringCount;
  const rightStringOmissions = 60 - rightStringCount;
  const stringCenteredOmission = leftStringOmissions - rightStringOmissions;

  // Format date
  const currentDate = new Date().toLocaleDateString();

  return (
    <View style={styles.descriptionContainer}>
      <View style={styles.cardRow}>
        {/* Test Information Card */}
        <Card style={[styles.darkCard, styles.halfWidthCard]}>
          <Card.Title 
            title="Test Information" 
            titleStyle={styles.compactCardTitle} 
          />
          <Card.Content style={styles.compactCardContent}>
            <View style={styles.compactInfoRow}>
              <Text style={styles.compactLabel}>Participant ID:</Text>
              <Text style={styles.compactValue}>{params.participantId}</Text>
            </View>
            <View style={styles.compactInfoRow}>
              <Text style={styles.compactLabel}>Participant Initials:</Text>
              <Text style={styles.compactValue}>{params.participantInitials}</Text>
            </View>
            <View style={styles.compactInfoRow}>
              <Text style={styles.compactLabel}>Date:</Text>
              <Text style={styles.compactValue}>{currentDate}</Text>
            </View>
            <View style={styles.compactInfoRow}>
              <Text style={styles.compactLabel}>Examiner Initials:</Text>
              <Text style={styles.compactValue}>{params.examinerInitials}</Text>
            </View>
             {/* Time Elapsed */}
             <View style={styles.infoRow}>
            <Text style={styles.compactLabel}>Time:</Text>
            <Text style={styles.compactValue}>
            {formatTime(parseInt(params.elapsedTime as string))} (min:sec) = {params.elapsedTime} sec
            </Text>
            </View>

          </Card.Content>
        </Card>

        {/* Overall Statistics Card */}
        <Card style={[styles.darkCard, styles.halfWidthCard]}>
          <Card.Title title="Overall Statistics" titleStyle={styles.compactCardTitle} />
          <Card.Content style={styles.compactCardContent}>
            <View style={styles.compactStatRow}>
              <Text style={styles.compactStatLabel}>e. Total crossed 3s:</Text>
              <Text style={styles.compactStatValue}>{digit3Count}</Text>
            </View>
            <View style={styles.compactStatRow}>
              <Text style={styles.compactStatLabel}>f. Total omissions:</Text>
              <Text style={styles.compactStatValue}>{totalOmissions}</Text>
            </View>
          
            
          </Card.Content>
        </Card>
        
      </View>

      {/* Detailed Analysis Card - Full Width */}
      <Card style={[styles.darkCard, styles.fullWidthCard]}>
        <Card.Title title="Detailed Analysis" titleStyle={styles.compactCardTitle} />
        <Card.Content style={styles.compactCardContent}>
          <View style={styles.analysisContainer}>
            {/* Left Column */}
            <View style={styles.analysisColumn}>
              <View style={styles.compactStatsSection}>
                <Text style={styles.compactSectionTitle}>Page Side Analysis</Text>
                <View style={styles.compactStatRow}>
                  <Text style={styles.compactStatLabel}>g. Left side crossed 3s:</Text>
                  <Text style={styles.compactStatValue}>{leftPageCount}</Text>
                </View>
                <View style={styles.compactStatRow}>
                  <Text style={styles.compactStatLabel}>h. Left side omissions:</Text>
                  <Text style={styles.compactStatValue}>{leftPageOmissions}</Text>
                </View>
                <View style={styles.compactStatRow}>
                  <Text style={styles.compactStatLabel}>i. Right side crossed 3s:</Text>
                  <Text style={styles.compactStatValue}>{rightPageCount}</Text>
                </View>
                <View style={styles.compactStatRow}>
                  <Text style={styles.compactStatLabel}>j. Right side omissions:</Text>
                  <Text style={styles.compactStatValue}>{rightPageOmissions}</Text>
                </View>
                <View style={styles.compactStatRow}>
                  <Text style={styles.compactStatLabel}>k. Page-centered omission:</Text>
                  <Text style={styles.compactStatValue}>{pageCenteredOmission}</Text>
                </View>
              </View>
            </View>

            {/* Right Column */}
            <View style={styles.analysisColumn}>
              <View style={styles.compactStatsSection}>
                <Text style={styles.compactSectionTitle}>String Analysis</Text>
                <View style={styles.compactStatRow}>
                  <Text style={styles.compactStatLabel}>l. Left string crossed 3s:</Text>
                  <Text style={styles.compactStatValue}>{leftStringCount}</Text>
                </View>
                <View style={styles.compactStatRow}>
                  <Text style={styles.compactStatLabel}>m. Left string omissions:</Text>
                  <Text style={styles.compactStatValue}>{leftStringOmissions}</Text>
                </View>
                <View style={styles.compactStatRow}>
                  <Text style={styles.compactStatLabel}>n. Right string crossed 3s:</Text>
                  <Text style={styles.compactStatValue}>{rightStringCount}</Text>
                </View>
                <View style={styles.compactStatRow}>
                  <Text style={styles.compactStatLabel}>o. Right string omissions:</Text>
                  <Text style={styles.compactStatValue}>{rightStringOmissions}</Text>
                </View>
                <View style={styles.compactStatRow}>
                  <Text style={styles.compactStatLabel}>p. String-centered omission:</Text>
                  <Text style={styles.compactStatValue}>{stringCenteredOmission}</Text>
                </View>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
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
  descriptionContainer: {
    padding: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  halfWidthCard: {
    width: (width / 2) - 12,
    marginBottom: 0,
  },
  fullWidthCard: {
    width: '100%',
    marginBottom: 8,
  },
  analysisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analysisColumn: {
    width: '48%', // Slightly less than half to account for spacing
  },
  compactCardTitle: {
    color: '#333333', // Dark text color for compact card titles
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 0,
  },
  compactCardContent: {
    padding: 8,
  },
  compactInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  compactLabel: {
    color: '#4B9EF8', // Enhanced color for labels
    fontSize: 12,
    flex: 1,
  },
  compactValue: {
    color: '#333333', // Dark text color for values
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  compactStatsSection: {
    marginBottom: 12,
  },
  compactSectionTitle: {
    color: '#4B9EF8', // Enhanced color for section titles
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  compactStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  compactStatLabel: {
    color: '#4B9EF8', // Enhanced color for stat labels
    fontSize: 12,
    flex: 2,
  },
  compactStatValue: {
    color: '#333333', // Dark text color for stat values
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
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
});

export default ResultsUI;