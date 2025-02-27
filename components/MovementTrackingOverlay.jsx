import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const MovementTrackingOverlay = ({ pressedCoordinates, cellDimensions }) => {
  if (!pressedCoordinates || pressedCoordinates.length === 0) {
    return null;
  }

  // Calculate the actual positions based on cellDimensions
  const positionData = pressedCoordinates.map((coord, index) => {
    const { row, col, digit } = coord;
    // Calculate the position within the cell for the digit
    // Each digit takes roughly 1/maxDigits of the cell width
    const digitPosition = digit / (pressedCoordinates[0]?.value?.length || 1);
    
    // Calculate the center position of this cell with offset for the specific digit
    const x = (col * cellDimensions.width) + (cellDimensions.width * (0.1 + (digitPosition * 0.8)));
    const y = (row * cellDimensions.height) + (cellDimensions.height / 2);
    
    return { x, y, index, isDigit3: coord.value === '3' };
  });

  return (
    <View style={styles.overlay}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Draw lines between consecutive points to show movement path */}
        <G>
          {positionData.map((point, index) => {
            if (index === 0) return null;
            const prevPoint = positionData[index - 1];
            return (
              <Line
                key={`line-${index}`}
                x1={prevPoint.x}
                y1={prevPoint.y}
                x2={point.x}
                y2={point.y}
                stroke="rgba(33, 150, 243, 0.4)"
                strokeWidth={2}
              />
            );
          })}
        </G>
        
        {/* Draw circles for each point, with special highlight for "3"s */}
        <G>
          {positionData.map((point, index) => (
            <Circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r={point.isDigit3 ? 10 : 6}
              fill={point.isDigit3 ? "rgba(244, 67, 54, 0.7)" : "rgba(33, 150, 243, 0.7)"}
              stroke={point.isDigit3 ? "#d32f2f" : "#1976d2"}
              strokeWidth={1}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
});

export default MovementTrackingOverlay;