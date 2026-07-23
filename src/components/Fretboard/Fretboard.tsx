/* This file draws the whole fretboard and reports taps back to the app. The
   selected notes are passed in as props (the app owns them now, so the fretboard
   and the chord results always agree on what is selected). When a fret is tapped,
   the fretboard calls onFretPress and lets the app update the selection. */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { FretRow } from './FretRow';
import { FretNumber } from './FretNumber';
import { StringLabels } from './StringLabels';
import { StrumButton } from './StrumButton';
import { playNote, playStrum, preloadNotes } from '../../audio/notePlayer';
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
      // (as planned in d5) d6 - These same numbers now also decide which sound to play: a tapped fret is just its string's open MIDI number plus the fret.
  // Memoized so the array keeps the same identity between renders, otherwise every fret row would think its props changed and redraw on every tap
  const baseMidi = useMemo(() => getOpenStringMidi(tuning), [tuning]);

  // Ready the open string sounds in the background when the board loads so they're ready to be played and not have to wait
  useEffect(() => {
    preloadNotes(baseMidi);
  }, [baseMidi]);

  // Whether enough notes are selected to strum (fewer than two is not a chord):
  const hasChord = selections.filter(Boolean).length >= 2;

  // The tap handlers read the selections through a ref, so the handlers themselves
  // stay the exact same function between renders. 
  // That keeps the fret rows memoization working, only the tapped row redraws instead of all 23 of them
  const selectionsRef = useRef(selections);
  selectionsRef.current = selections;

  // A tap plays the note it selects, so the fretboard is heard and visual.
  // Tapping an already selected fret clears it, and clearing doesnt play audio
  const handleFretPress = useCallback(
    (stringIndex: StringIndex, fret: number) => {
      const isClearing = selectionsRef.current[stringIndex]?.fret === fret;
      if (!isClearing) {
        playNote(baseMidi[stringIndex] + fret);
      }
      onFretPress(stringIndex, fret);
    },
    [baseMidi, onFretPress],
  );

  // Strum the selected notes from the low string to the high string,
  // the way a pick actually crosses the strings
  const handleStrum = useCallback(() => {
    const midiNotes: number[] = [];
    selectionsRef.current.forEach((selection, i) => {
      if (selection) midiNotes.push(baseMidi[i] + selection.fret);
    });
    playStrum(midiNotes);
  }, [baseMidi]);

  // Build the list of fret numbers, 0 (the nut) up to the last fret:
  const frets: number[] = [];
  for (let f = 0; f <= TOTAL_FRETS; f++) frets.push(f);

  return (
    <View style={fretboardStyles.wrapper}>
      <View style={fretboardStyles.container}>
        {/* The strum button floats to the right of the board while a chord is selected */}
        <StrumButton visible={hasChord} onStrum={handleStrum} />

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
                onFretPress={handleFretPress}
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
