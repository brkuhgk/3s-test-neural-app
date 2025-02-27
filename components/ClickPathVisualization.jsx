import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card } from 'react-native-paper';
import Svg, { Line, Circle, G, Path, Text as SvgText, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Define the grid data (same as in test screen)
const gridData = [
  [8103, 83727895, 769158, 31678925, 3294059, 73914, 3512407, 8089170, 1992939, 2120],
  [4567, 8092573, 45013, 29758, 530345, 618475, 12445683, 30127987, 366305, 297539],
  [139723, 45298716, 3295870, 3980, 253970, 579340, 6138, 432063, 81924982, 6583],
  [9813, 32145678, 84673, 139475, 58145469, 13820, 37428981, 63017980, 45607, 13925647],
  [34602458, 3643, 83921, 4512693, 4698723, 836438, 5801, 89063, 23972165, 3263],
  [42915, 5853, 72631, 34670654, 36135, 4626071, 83959, 4959398, 68130, 6301],
  [987302, 9672, 4286158, 7807347, 675246, 946053, 2002193, 6004745, 35671, 1061],
  [5732186, 45013, 84203, 56239, 671302, 3004, 38672168, 80873, 4108, 371903],
  [6837, 183820, 43612063, 90542145, 784352, 3956, 23781, 198378, 187123, 6004216],
  [3407, 1792635, 4067903, 98103, 5624, 780523, 56792604, 37801, 6356791, 93956467],
  [431025, 4297589, 83961, 56465421, 6138940, 4295901, 6476023, 97654985, 13283, 21243],
  [613947, 43169857, 4302, 3251673, 70765583, 760536, 37821245, 4623, 1308418, 9212494],
  [8077, 3824510, 53906, 4389, 80610972, 3120, 760530, 3940, 8405737, 89203],
  [579103, 970943, 42057, 87652143, 3048, 497538, 1230, 93745125, 19081257, 23456],
];

// Function to check if a number contains a '3'
const hasDigitThree = (number) => {
  return number.toString().includes('3');
};

const ClickPathVisualization = ({ pressedCoordinates }) => {
  const cellWidth = (width - 32) / 10; // 10 columns with some margin
  const cellHeight = cellWidth * 0.7; // Maintain a reasonable cell aspect ratio
  const svgHeight = cellHeight * 14; // 14 rows
  
  // Fallback if there's no valid data
  if (!pressedCoordinates || pressedCoordinates.length === 0) {
    return (
      <Card style={styles.card}>
        <Card.Title title="User Click Path Visualization" titleStyle={styles.cardTitle} />
        <Card.Content style={styles.cardContent}>
          <Text style={styles.noDataText}>No movement data available to visualize.</Text>
        </Card.Content>
      </Card>
    );
  }
  
  // Calculate positions for each coordinate with safety checks
  const positionData = pressedCoordinates.map((coord, index) => {
    const { row, col, digit } = coord;
    
    // Validate inputs to prevent NaN
    const validRow = Number.isFinite(row) ? row : 0;
    const validCol = Number.isFinite(col) ? col : 0;
    
    // Center position of the cell
    const x = validCol * cellWidth + cellWidth / 2;
    const y = validRow * cellHeight + cellHeight / 2;
    
    return {
      x,
      y,
      index,
      isDigit3: coord.value === '3',
      row: validRow,
      col: validCol
    };
  });

  // Function to draw an arrow between two points with enhanced styling and safety checks
  const createArrow = (x1, y1, x2, y2, isImportant = false) => {
    // Check for invalid coordinates
    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
      console.warn('Invalid coordinates detected', { x1, y1, x2, y2 });
      // Return safe default values to prevent rendering errors
      return {
        line: '',
        arrow: ''
      };
    }
    
    // Calculate distance between points
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Safety check for zero distance
    if (distance < 0.01) {
      return {
        line: '',
        arrow: ''
      };
    }
    
    // Calculate angle for arrowhead
    const angle = Math.atan2(dy, dx);
    
    // Adjust arrowhead size based on distance
    const arrowLength = Math.min(15, Math.max(8, distance * 0.15));
    
    // Make the arrow stop short of the target to avoid overlap with the circle
    const targetRadius = isImportant ? 15 : 10;
    // Ensure we don't go beyond the line length
    const shortenRatio = distance > targetRadius ? (distance - targetRadius) / distance : 0.5;
    const endX = x1 + dx * shortenRatio;
    const endY = y1 + dy * shortenRatio;
    
    // Calculate arrowhead points with safety checks
    const arrowX1 = endX - arrowLength * Math.cos(angle - Math.PI / 6);
    const arrowY1 = endY - arrowLength * Math.sin(angle - Math.PI / 6);
    const arrowX2 = endX - arrowLength * Math.cos(angle + Math.PI / 6);
    const arrowY2 = endY - arrowLength * Math.sin(angle + Math.PI / 6);
    
    // Ensure all calculated values are valid numbers
    if (isNaN(arrowX1) || isNaN(arrowY1) || isNaN(arrowX2) || isNaN(arrowY2)) {
      console.warn('Invalid arrow calculations', { 
        angle, arrowLength, endX, endY, arrowX1, arrowY1, arrowX2, arrowY2 
      });
      return {
        line: '',
        arrow: ''
      };
    }
    
    // Create a controlled curve (limit curve size to avoid extreme values)
    const maxControlOffset = Math.min(40, distance * 0.2);
    const controlX = (x1 + endX) / 2 + maxControlOffset * Math.cos(angle + Math.PI/2);
    const controlY = (y1 + endY) / 2 + maxControlOffset * Math.sin(angle + Math.PI/2);
    
    // Final safety check for all path coordinates
    if (isNaN(controlX) || isNaN(controlY)) {
      // Fallback to straight line if curve calculation fails
      return {
        line: `M${x1},${y1} L${endX},${endY}`,
        arrow: `M${endX},${endY} L${arrowX1},${arrowY1} L${arrowX2},${arrowY2} Z`
      };
    }
    
    return {
      line: `M${x1},${y1} Q${controlX},${controlY} ${endX},${endY}`,
      arrow: `M${endX},${endY} L${arrowX1},${arrowY1} L${arrowX2},${arrowY2} Z`
    };
  };

  return (
    <Card style={styles.card}>
      <Card.Title title="User Click Path Visualization" titleStyle={styles.cardTitle} />
      <Card.Content style={styles.cardContent}>
        <View style={styles.gridContainer}>
          {/* Draw the grid with numbers */}
          {gridData.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((cell, colIndex) => {
                const hasThree = hasDigitThree(cell);
                return (
                  <View 
                    key={`cell-${rowIndex}-${colIndex}`} 
                    style={[
                      styles.cell, 
                      { width: cellWidth, height: cellHeight },
                      hasThree && styles.digitThreeCell
                    ]}
                  >
                    <Text 
                      style={[
                        styles.cellText,
                        { fontSize: Math.min(cellWidth / (cell.toString().length + 1), 14) }
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="clip"
                    >
                      {cell}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}

          {/* SVG overlay for path visualization */}
          <Svg 
            style={styles.svgOverlay} 
            width={width - 32} 
            height={svgHeight}
            viewBox={`0 0 ${width - 32} ${svgHeight}`}
          >
            {/* Draw connection lines between consecutive points */}
            <G>
              {positionData.map((point, index) => {
                if (index === 0) return null;
                const prevPoint = positionData[index - 1];
                const isImportant = point.isDigit3 || prevPoint.isDigit3;
                const arrow = createArrow(
                  prevPoint.x, 
                  prevPoint.y, 
                  point.x, 
                  point.y, 
                  isImportant
                );
                
                // Skip rendering if paths are empty (indicates an error)
                if (!arrow.line || !arrow.arrow) return null;
                
                // Define gradient ID for this arrow
                const gradientId = `gradient-${index}`;
                const startColor = prevPoint.isDigit3 ? "#d32f2f" : "#1976d2";
                const endColor = point.isDigit3 ? "#d32f2f" : "#1976d2";
                
                return (
                  <G key={`connection-${index}`}>
                    {/* Define linear gradient for each arrow */}
                    <Defs>
                      <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor={startColor} stopOpacity="0.8" />
                        <Stop offset="100%" stopColor={endColor} stopOpacity="0.8" />
                      </LinearGradient>
                    </Defs>
                    
                    {/* Draw the curved path with gradient */}
                    <Path
                      d={arrow.line}
                      stroke={`url(#${gradientId})`}
                      strokeWidth={isImportant ? 3 : 2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    
                    {/* Draw the arrowhead filled */}
                    <Path
                      d={arrow.arrow}
                      fill={endColor}
                      stroke="none"
                    />
                  </G>
                );
              })}
            </G>
            
            {/* Draw nodes for each click */}
            <G>
              {positionData.map((point, index) => {
                // Define colors based on whether this is a "3" or not
                const fillColor = point.isDigit3 ? "#f44336" : "#2196f3";
                const strokeColor = point.isDigit3 ? "#d32f2f" : "#1976d2";
                const glowColor = point.isDigit3 ? "#ffcdd2" : "#bbdefb";
                const nodeSize = point.isDigit3 ? 15 : 12;
                
                // Gradient ID for this node
                const gradientId = `node-gradient-${index}`;
                
                return (
                  <G key={`node-${index}`}>
                    {/* Define radial gradient for each node */}
                    <Defs>
                      <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <Stop offset="0%" stopColor={fillColor} stopOpacity="0.9" />
                        <Stop offset="80%" stopColor={fillColor} stopOpacity="0.8" />
                        <Stop offset="100%" stopColor={fillColor} stopOpacity="0.6" />
                      </RadialGradient>
                    </Defs>
                    
                    {/* Outer glow effect */}
                    {point.isDigit3 && (
                      <Circle
                        cx={point.x}
                        cy={point.y}
                        r={nodeSize + 4}
                        fill={glowColor}
                        opacity={0.5}
                      />
                    )}
                    
                    {/* Main circle */}
                    <Circle
                      cx={point.x}
                      cy={point.y}
                      r={nodeSize}
                      fill={`url(#${gradientId})`}
                      stroke={strokeColor}
                      strokeWidth={2}
                    />
                    
                    {/* Highlight */}
                    <Circle
                      cx={point.x - nodeSize * 0.3}
                      cy={point.y - nodeSize * 0.3}
                      r={nodeSize * 0.3}
                      fill="rgba(255, 255, 255, 0.4)"
                    />
                    
                    {/* Text with better positioning and optional shadow */}
                    <SvgText
                      x={point.x}
                      y={point.y + nodeSize * 0.2}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fontSize={nodeSize * 0.9}
                      fontWeight="bold"
                      fill="white"
                      stroke="none"
                    >
                      {index + 1}
                    </SvgText>
                  </G>
                );
              })}
            </G>
          </Svg>
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendMarker, { 
              backgroundColor: '#2196f3', 
              borderWidth: 1, 
              borderColor: '#1976d2' 
            }]} />
            <Text style={styles.legendText}>Regular Clicks</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendMarker, { 
              backgroundColor: '#f44336', 
              borderWidth: 1, 
              borderColor: '#d32f2f' 
            }]} />
            <Text style={styles.legendText}>Number 3 Clicks</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendMarker, { 
              backgroundColor: '#FFF3E0', 
              borderWidth: 1, 
              borderColor: '#FFB74D' 
            }]} />
            <Text style={styles.legendText}>Contains Digit 3</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
    borderRadius: 12,
    marginVertical: 12,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  cardTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContent: {
    padding: 8,
  },
  gridContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10,
    position: 'relative',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
    padding: 20,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  digitThreeCell: {
    backgroundColor: '#FFF3E0', // Light orange background for cells with '3'
    borderWidth: 1,
    borderColor: '#FFB74D', // Stronger border to highlight cells with '3'
  },
  cellText: {
    color: '#333',
    textAlign: 'center',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 16,
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 6,
  },
  legendMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  legendText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
});

export default ClickPathVisualization;