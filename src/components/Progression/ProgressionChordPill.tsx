/* One chord in the progression strip

It shows its position number and its name, left and right arrows to move it one spot over (only when there is a spot to
move to), and a remove button. Tapping the pill itself recalls its saved shape
onto the fretboard. Only updates when the props change */

import React, { memo } from 'react';
import { Text, Pressable } from 'react-native';
import { ProgressionChord } from '../../types';
import { progressionStyles } from '../../styles/progressionStyles';
import { formatChordName } from '../../engine/chordNamer';

interface Props {
  chord: ProgressionChord;
  index: number;            // position in the strip, shown as a small number
  preferFlats?: boolean;
  onPress: () => void;        // recalls this chords shape onto the fretboard
  onRemove: () => void;
  onMoveLeft?: () => void;    // only given when there is a spot to the left
  onMoveRight?: () => void;    // only given when there is a spot to the right
}

function ProgressionChordPillComponent({
  chord,
  index,
  preferFlats,
  onPress,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: Props) {
  // Rebuild the display name from the stored root and symbol, so the pill adheres to
  // sharp or flat preference even if it changed after the chord was added
  const displayName = formatChordName(chord.rootPitchClass, chord.symbol, chord.bassPitchClass, preferFlats);

  return (
    <Pressable style={progressionStyles.pill} onPress={onPress}>
      <Text style={progressionStyles.pillIndex}>{index + 1}</Text>
      <Text style={progressionStyles.pillText}>{displayName}</Text>
      {onMoveLeft && (
        <Pressable onPress={onMoveLeft} style={progressionStyles.arrowButton} hitSlop={4}>
          <Text style={progressionStyles.arrowText}>{'←'}</Text>
        </Pressable>
      )}
      {onMoveRight && (
        <Pressable onPress={onMoveRight} style={progressionStyles.arrowButton} hitSlop={4}>
          <Text style={progressionStyles.arrowText}>{'→'}</Text>
        </Pressable>
      )}
      <Pressable onPress={onRemove} style={progressionStyles.removeButton} hitSlop={4}>
        <Text style={progressionStyles.removeButtonText}>{'✕'}</Text>
      </Pressable>
    </Pressable>
  );
}

export const ProgressionChordPill = memo(ProgressionChordPillComponent);
