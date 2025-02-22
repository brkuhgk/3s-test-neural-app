// app/hooks/useGridDimensions.ts
import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

function calculateDimensions(window: ScaledSize) {
  const { width, height } = window;
  
  // Grid specifications
  const numColumns = 10;
  const numRows = 14;
  const minCellSize = 40; // Minimum touch target size
  
  // Calculate cell dimensions
  const cellWidth = Math.max(width / numColumns, minCellSize);
  const cellHeight = Math.max(height / (numRows + 2), minCellSize);
  
  // Calculate font size based on cell size
  const fontSize = Math.min(cellWidth, cellHeight) * 0.4;
  
  return {
    cellWidth,
    cellHeight,
    fontSize,
    gridWidth: width,
    gridHeight: height * 0.9, // Leave space for bottom button
    numColumns,
    numRows,
  };
}

export function useGridDimensions() {
  const [dimensions, setDimensions] = useState(calculateDimensions(Dimensions.get('window')));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(calculateDimensions(window));
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return dimensions;
}