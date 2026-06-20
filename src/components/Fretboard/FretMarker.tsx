import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { fretboardStyles, MARKER_SIZE } from '../../styles/fretboardStyles';

interface Props {
  isSelected: boolean;
  noteName: string;
  octave?: number;
  showOctaves?: boolean;
  onPress: () => void;
}

// Single fret marker on the fretboard. It shows the note name and octave (if enabled) when selected, 
// and has a glass highlight effect to make it look more realistic. 
// The marker is pressable, allowing the user to select or deselect the note on that fret.
function FretMarkerComponent({ isSelected, noteName, octave, showOctaves, onPress }: Props) {
  const label = showOctaves && octave !== undefined ? `${noteName}${octave}` : noteName;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        fretboardStyles.marker,
        isSelected ? fretboardStyles.markerActive : fretboardStyles.markerInactive,
        pressed && !isSelected && {
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
        },
        pressed && isSelected && {
          opacity: 0.85,
          transform: [{ scale: 0.93 }],
        },
      ]}
      hitSlop={6}
    >
      {isSelected && (
        <>
          {/* Glassy look on top half to make it stand out */}
          <View
            style={{
              position: 'absolute',
              top: 1,
              left: MARKER_SIZE * 0.15,
              right: MARKER_SIZE * 0.15,
              height: MARKER_SIZE * 0.35,
              borderRadius: MARKER_SIZE * 0.3,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            }}
          />
          <Text style={fretboardStyles.markerText}>{label}</Text> {/* Note name and octave */}
        </>
      )}
    </Pressable>
  );
}

export const FretMarker = memo(FretMarkerComponent);
