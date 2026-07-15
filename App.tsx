import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';
import { Fretboard } from './src/components/Fretboard/Fretboard';
import { ResultsPanel } from './src/components/Results/ResultsPanel';
import { SettingsModal } from './src/components/common/SettingsModal';
import { COLORS } from './src/styles/colors';
import { commonStyles } from './src/styles/commonStyles';
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

  // Display preferences, both flipped from the Options sheet:
  // Show octaves: when on, note labels include the octave number (E2 instead of just E),
  // so the user can see that the two E strings are the same note but two octaves apart.
  // Prefer flats: when on, notes are spelt with flats (Bb) instead of sharps (A#),
  // the same sounding notes just written the way the user prefers to read them.
  const [showOctaves, setShowOctaves] = useState(false);
  const [preferFlats, setPreferFlats] = useState(false);

  // Whether the Options sheet is open
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    <SafeAreaView style={commonStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>FretFind</Text>
        <View style={commonStyles.headerActions}>
          {/* Options button: opens the settings sheet with the display switches */}
          <Pressable
            onPress={() => setIsSettingsOpen(true)}
            style={commonStyles.headerActionButton}
          >
            <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: '800' }}>⚙</Text>
            <Text style={commonStyles.headerActionText}>Options</Text>
          </Pressable>
        </View>
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
      <SettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        showOctaves={showOctaves}
        preferFlats={preferFlats}
        onToggleOctaves={() => setShowOctaves(prev => !prev)}
        onTogglePreferFlats={() => setPreferFlats(prev => !prev)}
      />
    </SafeAreaView>
  );
}
