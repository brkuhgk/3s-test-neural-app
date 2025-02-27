// const ResultsDescriptionUI = () => {
//     const params = useLocalSearchParams();
    
//     // Parse the JSON strings from params
//     const leftSide3s = JSON.parse(params.leftSide3s as string);
//     const rightSide3s = JSON.parse(params.rightSide3s as string);
//     const quadrant3s = JSON.parse(params.quadrant3s as string);
//     const digit3Count = parseInt(params.digit3Count as string);
//     const columnCounts = JSON.parse(params.digit3ColumnCount as string);
  
//     // Calculate statistics
//     const leftPageCount = columnCounts.slice(0, 5).reduce((a, b) => a + b, 0);
//     const rightPageCount = columnCounts.slice(5, 10).reduce((a, b) => a + b, 0);
//     const leftStringCount = leftSide3s.length;
//     const rightStringCount = rightSide3s.length;
  
//     // Calculate omissions
//     const totalOmissions = 120 - digit3Count;
//     const leftPageOmissions = 60 - leftPageCount;
//     const rightPageOmissions = 60 - rightPageCount;
//     const pageCenteredOmission = leftPageOmissions - rightPageOmissions;
    
//     const leftStringOmissions = 60 - leftStringCount;
//     const rightStringOmissions = 60 - rightStringCount;
//     const stringCenteredOmission = leftStringOmissions - rightStringOmissions;
  
//     // Format date
//     const currentDate = new Date().toLocaleDateString();
  
//     return (
//       <View style={styles.descriptionContainer}>
//         <View style={styles.cardRow}>
//           {/* Test Information Card */}
//           <Card style={[styles.darkCard, styles.halfWidthCard]}>
//             <Card.Title 
//               title="Test Information" 
//               titleStyle={styles.compactCardTitle} 
//             />
//             <Card.Content style={styles.compactCardContent}>
//               <View style={styles.compactInfoRow}>
//                 <Text style={styles.compactLabel}>Participant ID:</Text>
//                 <Text style={styles.compactValue}>{params.participantId}</Text>
//               </View>
//               <View style={styles.compactInfoRow}>
//                 <Text style={styles.compactLabel}>Participant Initials:</Text>
//                 <Text style={styles.compactValue}>{params.participantInitials}</Text>
//               </View>
//               <View style={styles.compactInfoRow}>
//                 <Text style={styles.compactLabel}>Date:</Text>
//                 <Text style={styles.compactValue}>{currentDate}</Text>
//               </View>
//               <View style={styles.compactInfoRow}>
//                 <Text style={styles.compactLabel}>Examiner Initials:</Text>
//                 <Text style={styles.compactValue}>{params.examinerInitials}</Text>
//               </View>
//                {/* Time Elapsed */}
//                <View style={styles.infoRow}>
//               <Text style={styles.compactLabel}>Time:</Text>
//               <Text style={styles.compactValue}>
//               {formatTime(parseInt(params.elapsedTime as string))} (min:sec) = {params.elapsedTime} sec
//               </Text>
//               </View>
  
//             </Card.Content>
//           </Card>
  
//           {/* Overall Statistics Card */}
//           <Card style={[styles.darkCard, styles.halfWidthCard]}>
//             <Card.Title title="Overall Statistics" titleStyle={styles.compactCardTitle} />
//             <Card.Content style={styles.compactCardContent}>
//               <View style={styles.compactStatRow}>
//                 <Text style={styles.compactStatLabel}>e. Total crossed 3s:</Text>
//                 <Text style={styles.compactStatValue}>{digit3Count}</Text>
//               </View>
//               <View style={styles.compactStatRow}>
//                 <Text style={styles.compactStatLabel}>f. Total omissions:</Text>
//                 <Text style={styles.compactStatValue}>{totalOmissions}</Text>
//               </View>
            
              
//             </Card.Content>
//           </Card>
          
//         </View>
  
//         {/* Detailed Analysis Card - Full Width */}
//         <Card style={[styles.darkCard, styles.fullWidthCard]}>
//           <Card.Title title="Detailed Analysis" titleStyle={styles.compactCardTitle} />
//           <Card.Content style={styles.compactCardContent}>
//             <View style={styles.analysisContainer}>
//               {/* Left Column */}
//               <View style={styles.analysisColumn}>
//                 <View style={styles.compactStatsSection}>
//                   <Text style={styles.compactSectionTitle}>Page Side Analysis</Text>
//                   <View style={styles.compactStatRow}>
//                     <Text style={styles.compactStatLabel}>g. Left side crossed 3s:</Text>
//                     <Text style={styles.compactStatValue}>{leftPageCount}</Text>
//                   </View>
//                   <View style={styles.compactStatRow}>
//                     <Text style={styles.compactStatLabel}>h. Left side omissions:</Text>
//                     <Text style={styles.compactStatValue}>{leftPageOmissions}</Text>
//                   </View>
//                   <View style={styles.compactStatRow}>
//                     <Text style={styles.compactStatLabel}>i. Right side crossed 3s:</Text>
//                     <Text style={styles.compactStatValue}>{rightPageCount}</Text>
//                   </View>
//                   <View style={styles.compactStatRow}>
//                     <Text style={styles.compactStatLabel}>j. Right side omissions:</Text>
//                     <Text style={styles.compactStatValue}>{rightPageOmissions}</Text>
//                   </View>
//                   <View style={styles.compactStatRow}>
//                     <Text style={styles.compactStatLabel}>k. Page-centered omission:</Text>
//                     <Text style={styles.compactStatValue}>{pageCenteredOmission}</Text>
//                   </View>
//                 </View>
//               </View>
  
//               {/* Right Column */}
//               <View style={styles.analysisColumn}>
//                 <View style={styles.compactStatsSection}>
//                   <Text style={styles.compactSectionTitle}>String Analysis</Text>
//                   <View style={styles.compactStatRow}>
//                     <Text style={styles.compactStatLabel}>l. Left string crossed 3s:</Text>
//                     <Text style={styles.compactStatValue}>{leftStringCount}</Text>
//                   </View>
//                   <View style={styles.compactStatRow}>
//                     <Text style={styles.compactStatLabel}>m. Left string omissions:</Text>
//                     <Text style={styles.compactStatValue}>{leftStringOmissions}</Text>
//                   </View>
//                   <View style={styles.compactStatRow}>
//                     <Text style={styles.compactStatLabel}>n. Right string crossed 3s:</Text>
//                     <Text style={styles.compactStatValue}>{rightStringCount}</Text>
//                   </View>
//                   <View style={styles.compactStatRow}>
//                     <Text style={styles.compactStatLabel}>o. Right string omissions:</Text>
//                     <Text style={styles.compactStatValue}>{rightStringOmissions}</Text>
//                   </View>
//                   <View style={styles.compactStatRow}>
//                     <Text style={styles.compactStatLabel}>p. String-centered omission:</Text>
//                     <Text style={styles.compactStatValue}>{stringCenteredOmission}</Text>
//                   </View>
//                 </View>
//               </View>
//             </View>
//           </Card.Content>
//         </Card>
//       </View>
//     );
//   };


// descriptionContainer: {
//   padding: 8,
// },
// cardRow: {
//   flexDirection: 'row',
//   justifyContent: 'space-between',
//   marginBottom: 8,
// },
// halfWidthCard: {
//   width: (width / 2) - 12,
//   marginBottom: 0,
// },
// fullWidthCard: {
//   width: '100%',
//   marginBottom: 8,
// },
// analysisContainer: {
//   flexDirection: 'row',
//   justifyContent: 'space-between',
// },
// analysisColumn: {
//   width: '48%', // Slightly less than half to account for spacing
// },
// compactCardTitle: {
//   color: '#333333', // Dark text color for compact card titles
//   fontSize: 14,
//   fontWeight: '600',
//   marginBottom: 0,
// },
// compactCardContent: {
//   padding: 8,
// },
// compactInfoRow: {
//   flexDirection: 'row',
//   justifyContent: 'space-between',
//   marginBottom: 4,
//   paddingBottom: 4,
//   borderBottomWidth: 0.5,
//   borderBottomColor: 'rgba(0,0,0,0.1)',
// },
// compactLabel: {
//   color: '#4B9EF8', // Enhanced color for labels
//   fontSize: 12,
//   flex: 1,
// },
// compactValue: {
//   color: '#333333', // Dark text color for values
//   fontSize: 12,
//   fontWeight: '500',
//   flex: 1,
//   textAlign: 'right',
// },
// compactStatsSection: {
//   marginBottom: 12,
// },
// compactSectionTitle: {
//   color: '#4B9EF8', // Enhanced color for section titles
//   fontSize: 13,
//   fontWeight: '600',
//   marginBottom: 6,
// },
// compactStatRow: {
//   flexDirection: 'row',
//   justifyContent: 'space-between',
//   marginBottom: 4,
// },
// compactStatLabel: {
//   color: '#4B9EF8', // Enhanced color for stat labels
//   fontSize: 12,
//   flex: 2,
// },
// compactStatValue: {
//   color: '#333333', // Dark text color for stat values
//   fontSize: 12,
//   fontWeight: '500',
//   flex: 1,
// },