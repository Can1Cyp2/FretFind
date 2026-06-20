/* This file defines the FretNumber component, which is responsible for rendering the fret numbers on the 
left side of the fretboard. It also renders the open string note names above the nut, 
and allows the user to tap on them to show a list of open string notes. 
The component is memoized to prevent unnecessary re-renders when the fretboard state changes. */


import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  fretboardStyles,
  FRET_ROW_HEIGHT,
  NUT_ROW_HEIGHT,
} from '../../styles/fretboardStyles';

interface Props {
  fret: number;
  isNut?: boolean;
  onOpenNotesPress?: () => void;
}

// Shows fret numbers on the left side of the fretboard, and open string note names above the nut 
function FretNumberComponent({ fret, isNut, onOpenNotesPress }: Props) {
  const height = isNut ? NUT_ROW_HEIGHT : FRET_ROW_HEIGHT;

  return (
    <View style={[fretboardStyles.fretNumberCell, { height }]}>
      {isNut && onOpenNotesPress && (
        <Pressable onPress={onOpenNotesPress} style={fretboardStyles.openNotesButton}>
          <Text style={fretboardStyles.openNotesButtonText}>O</Text>
        </Pressable>
      )}
      {fret > 0 && <Text style={fretboardStyles.fretNumberText}>{fret}</Text>}
    </View>
  );
}

export const FretNumber = memo(FretNumberComponent);
