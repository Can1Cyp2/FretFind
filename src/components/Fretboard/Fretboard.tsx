import React, { useCallback, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { FretRow } from './FretRow';
import { FretNumber } from './FretNumber';
import { StringLabels } from './StringLabels';
import {
  fretboardStyles,
  FRET_NUMBER_COL_WIDTH,
} from '../../styles/fretboardStyles';
import { STANDARD_TUNING } from '../../constants/tunings';
import { TOTAL_FRETS, NUM_STRINGS } from '../../constants/notes';
import { getPitchClassAtFret } from '../../engine/noteUtils';
import { FretSelection, PitchClass, StringIndex } from '../../types';

export function Fretboard() {
  // Selection state: one chosen fret (or null for none) per string
  const [selections, setSelections] = useState<(FretSelection | null)[]>(
    () => Array(NUM_STRINGS).fill(null),
  );

  const currentTuning = STANDARD_TUNING;
  const openNotes = currentTuning.notes as PitchClass[];
  const showOctaves = false;
  const preferFlats = false;

  // Tap toggles a fret: tapping the same fret again clears that string,
  // otherwise it selects the new fret (and works out the note it makes)
  const selectFret = useCallback(
    (stringIndex: StringIndex, fret: number) => {
      setSelections(prev => {
        const next = [...prev];
        const current = prev[stringIndex];
        if (current && current.fret === fret) {
          next[stringIndex] = null;
        } else {
          const pitchClass = getPitchClassAtFret(
            currentTuning.notes[stringIndex] as PitchClass,
            fret,
          );
          next[stringIndex] = { stringIndex, fret, pitchClass };
        }
        return next;
      });
    },
    [currentTuning.notes],
  );

  // When the fretboard is tapped, select that fret for the string, or clear it if its already selected
  const handleFretPress = useCallback(
    (stringIndex: StringIndex, fret: number) => {
      selectFret(stringIndex, fret);
    },
    [selectFret],
  );

  // Fill in the open notes 
  const handleFillOpenNotes = useCallback(() => {
    setSelections(prev =>
      prev.map((selection, stringIndex) => {
        if (selection) return selection;
        const si = stringIndex as StringIndex;
        const pitchClass = getPitchClassAtFret(currentTuning.notes[si] as PitchClass, 0);
        return { stringIndex: si, fret: 0, pitchClass };
      }),
    );
  }, [currentTuning.notes]);

  const frets: number[] = [];
  for (let f = 0; f <= TOTAL_FRETS; f++) frets.push(f);

  return (
    <View style={fretboardStyles.wrapper}>
      <View style={fretboardStyles.container}>
        {/* Fixed top: string labels */}
        <View style={fretboardStyles.stringLabelsRowWrapper}>
          <View style={{ width: FRET_NUMBER_COL_WIDTH }} />
          <StringLabels
            noteNames={currentTuning.noteNames}
            pitchClasses={currentTuning.notes as PitchClass[]}
            preferFlats={preferFlats}
            showOctaves={showOctaves}
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
                onOpenNotesPress={f === 0 ? handleFillOpenNotes : undefined}
              />
              <FretRow
                fret={f}
                isNut={f === 0}
                openNotes={openNotes}
                selections={selections}
                onFretPress={handleFretPress}
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
