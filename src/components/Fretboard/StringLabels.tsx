import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { fretboardStyles, STRING_LEFT_PAD, STRING_SPACING } from '../../styles/fretboardStyles';
import { NoteName, PitchClass } from '../../types';
import { pitchClassToName } from '../../engine/noteUtils';

interface Props {
  noteNames: NoteName[];
  pitchClasses: PitchClass[];
  preferFlats?: boolean;
  showOctaves?: boolean;
  octaves?: number[];
}

// Label the strings at the top of the fretboard with their open string note names, and optionally octaves
// The labels are positioned above the nut, centered on each string. 
// They can show just the note name (example: E) or also the octave (example: E2) depending on the showOctaves prop (bool that will allow user to toggle show octaves on and off)
// The preferFlats prop controls whether to show flats (example: Eb) instead of sharps (example: D#) for the note names 
                        // (bool that will allow users to toggle between flats and sharps for the note names). This is only a visual preference, unless the person using the app already knows theory enough for this to matter to their understanding of the fretboard.
function StringLabelsComponent({ noteNames, pitchClasses, preferFlats, showOctaves, octaves }: Props) {
  return (
    <View style={fretboardStyles.stringLabelsRow}>
      {noteNames.map((name, i) => (
        <View
          key={i}
          style={[
            fretboardStyles.stringLabel,
            { left: STRING_LEFT_PAD + i * STRING_SPACING - STRING_SPACING / 2 },
          ]}
        >
          <Text style={fretboardStyles.stringLabelText}>
            {showOctaves && octaves
              ? `${pitchClassToName(pitchClasses[i], preferFlats)}${octaves[i]}`
              : pitchClassToName(pitchClasses[i], preferFlats)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export const StringLabels = memo(StringLabelsComponent);
