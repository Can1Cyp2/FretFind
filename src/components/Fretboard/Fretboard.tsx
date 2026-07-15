/* This file draws the whole fretboard and reports taps back to the app. The
   selected notes are passed in as props (the app owns them now, so the fretboard
   and the chord results always agree on what is selected). When a fret is tapped,
   the fretboard calls onFretPress and lets the app update the selection. */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { FretRow } from './FretRow';
import { FretNumber } from './FretNumber';
import { StringLabels } from './StringLabels';
import {
  fretboardStyles,
  FRET_NUMBER_COL_WIDTH,
} from '../../styles/fretboardStyles';
import { TOTAL_FRETS } from '../../constants/notes';
import { getOpenStringMidi } from '../../constants/tunings';
import { FretSelection, PitchClass, StringIndex, Tuning } from '../../types';

interface Props {
  selections: (FretSelection | null)[]; // one selected fret (or null) per string
  tuning: Tuning;                        // the open notes of each string
  showOctaves?: boolean;
  preferFlats?: boolean;
  onFretPress: (stringIndex: StringIndex, fret: number) => void; // a fret was tapped
  onFillOpenNotes: () => void;           // the 'O' button at the nut was tapped, which fills in all open notes
}

export function Fretboard({
  selections,
  tuning,
  showOctaves = false,
  preferFlats = false,
  onFretPress,
  onFillOpenNotes,
}: Props) {
  const openNotes = tuning.notes as PitchClass[];

  // The MIDI number of each open string, so the fret rows can work out which octave any fretted note lands in when the octave labels are switched on.
      // (current) d5 - This will also help finding which sound to play when the user wants to hear the note/chord but that is for a later deliverable. 
  const baseMidi = getOpenStringMidi(tuning);

  // Build the list of fret numbers, 0 (the nut) up to the last fret:
  const frets: number[] = [];
  for (let f = 0; f <= TOTAL_FRETS; f++) frets.push(f);

  return (
    <View style={fretboardStyles.wrapper}>
      <View style={fretboardStyles.container}>
        {/* Fixed top: string labels */}
        <View style={fretboardStyles.stringLabelsRowWrapper}>
          <View style={{ width: FRET_NUMBER_COL_WIDTH }} />
          <StringLabels
            noteNames={tuning.noteNames}
            pitchClasses={tuning.notes as PitchClass[]}
            preferFlats={preferFlats}
            showOctaves={showOctaves}
            octaves={tuning.octaves}
          />
        </View>

        {/* Vertical scrollable fretboard/grid (for coding sake) */}
        <ScrollView
          style={fretboardStyles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {frets.map(f => (
            <View key={f} style={fretboardStyles.fretRowWrapper}>
              <FretNumber
                fret={f}
                isNut={f === 0}
                onOpenNotesPress={f === 0 ? onFillOpenNotes : undefined}
              />
              <FretRow
                fret={f}
                isNut={f === 0}
                openNotes={openNotes}
                selections={selections}
                onFretPress={onFretPress}
                baseMidi={baseMidi}
                showOctaves={showOctaves}
                preferFlats={preferFlats}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
