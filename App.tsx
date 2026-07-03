import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Fretboard } from './src/components/Fretboard/Fretboard';
import { ResultsPanel } from './src/components/Results/ResultsPanel';
import { COLORS } from './src/styles/colors';
import { STANDARD_TUNING } from './src/constants/tunings';
import { NUM_STRINGS } from './src/constants/notes';
import { getPitchClassAtFret } from './src/engine/noteUtils';
import { identifyChords } from './src/engine/chordMatcher';
import { FretSelection, PitchClass, StringIndex } from './src/types';

export default function App() {
  // The selected notes, both the fretboard and the results share them here
  const [selections, setSelections] = useState<(FretSelection | null)[]>(
    () => Array(NUM_STRINGS).fill(null),
  );

  const currentTuning = STANDARD_TUNING;
  const showOctaves = false;
  const preferFlats = false;

  // Tap toggles a fret: tapping the same fret again clears that string,
  // otherwise it selects the new fret (and works out the note it makes).
  const handleFretPress = useCallback(
    (stringIndex: StringIndex, fret: number) => {
      setSelections(prev => {
        const next = [...prev];
        const current = prev[stringIndex];
        if (current && current.fret === fret) {
          next[stringIndex] = null;
        } else {
          const pitchClass = getPitchClassAtFret(currentTuning.notes[stringIndex] as PitchClass, fret);
          next[stringIndex] = { stringIndex, fret, pitchClass };
        }
        return next;
      });
    },
    [currentTuning.notes],
  );

  // Fill every empty string with its open note (the 'o' button at the nut)
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

  // Work out the matching chords whenever the selection changes (real time, no analyze button)
  const chordResults = useMemo(() => {
    const active = selections.filter(Boolean) as FretSelection[];
    if (active.length < 2) return [];
    return identifyChords(active, preferFlats);
  }, [selections, preferFlats]);

  const activeCount = selections.filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <Text style={styles.title}>FretFind</Text>
      </View>
      <Fretboard
        selections={selections}
        tuning={currentTuning}
        showOctaves={showOctaves}
        preferFlats={preferFlats}
        onFretPress={handleFretPress}
        onFillOpenNotes={handleFillOpenNotes}
      />
      <ResultsPanel matches={chordResults} activeCount={activeCount} preferFlats={preferFlats} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
