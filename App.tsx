import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';
import { Fretboard } from './src/components/Fretboard/Fretboard';
import { ResultsPanel } from './src/components/Results/ResultsPanel';
import { SettingsModal } from './src/components/common/SettingsModal';
import { ProgressionBar } from './src/components/Progression/ProgressionBar';
import { ProgressionManager } from './src/components/Progression/ProgressionManager';
import { FitChordsModal } from './src/components/Progression/FitChordsModal';
import { useProgression, MAX_PROGRESSION_LENGTH } from './src/hooks/useProgression';
import { COLORS } from './src/styles/colors';
import { commonStyles } from './src/styles/commonStyles';
import { STANDARD_TUNING } from './src/constants/tunings';
import { NUM_STRINGS } from './src/constants/notes';
import { getPitchClassAtFret } from './src/engine/noteUtils';
import { identifyChords } from './src/engine/chordMatcher';
import { formatChordName } from './src/engine/chordNamer';
import { ChordMatch, FretSelection, PitchClass, ProgressionChord, StringIndex } from './src/types';

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

  // The chord progression: the strip the user is building, the progressions saved
  // on the device, and the actions for both (all persisted by the hook)
  const {
    progression,
    savedProgressions,
    addChord,
    removeChord,
    reorderChord,
    clearProgression,
    saveProgression,
    loadProgression,
    deleteSavedProgression,
    renameSavedProgression,
    isFull,
  } = useProgression();

  // Whether the saved progressions sheet is open, and whether the 'chords that fit' sheet is:
  const [isProgressionsOpen, setIsProgressionsOpen] = useState(false);
  const [isFitChordsOpen, setIsFitChordsOpen] = useState(false);

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

  // Adding a chord to the progression keeps the exact shape currently on the fretboard,
  // so the progression remembers how the chord was actually played
  const handleAddToProgression = useCallback(
    (match: ChordMatch) => {
      addChord(match, selections);
    },
    [addChord, selections],
  );

  // Adding a suggested chord from the key view: it did not come from the fretboard,
  // so it is stored without a shape (recalling it later simply does nothing)
  const handleAddSuggestedChord = useCallback(
    (match: ChordMatch) => {
      addChord(match, Array(NUM_STRINGS).fill(null));
    },
    [addChord],
  );

  // Tapping a pill puts that chord's saved shape back onto the fretboard
  // (this replaces whatever is currently selected)
  const handleRecallShape = useCallback((chord: ProgressionChord) => {
    // Chords added from the key suggestions have no saved shape, so there is nothing to recall:
    if (!chord.selections.some(Boolean)) return;
    setSelections(chord.selections.map(s => (s ? { ...s } : null)));
  }, []);

  // The Save button in the header: one tap keeps the current progression, named
  // after its chords (renameable later in the Progressions sheet)
  const handleQuickSave = useCallback(() => {
    if (progression.length === 0) return;
    const names = progression.map(c =>
      formatChordName(c.rootPitchClass, c.symbol, c.bassPitchClass, preferFlats),
    );
    // Long progressions get a shortened name so the saved list stays readable
    const name =
      names.length > 4 ? `${names.slice(0, 4).join(' - ')} +${names.length - 4} more` : names.join(' - ');
    saveProgression(name);
    Alert.alert('Saved', `"${name}" was added to your saved progressions.`);
  }, [progression, preferFlats, saveProgression]);

  // Work out the matching chords whenever the selection changes (in real time):
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
          {/* The split button: Progressions opens the manager, and Save (its extension
              on the right) keeps the current progression in one tap.
              The Save part only shows once there is a progression to save */}
          <View style={commonStyles.headerSplitButton}>
            <Pressable
              onPress={() => setIsProgressionsOpen(true)}
              style={commonStyles.headerSplitLeft}
            >
              <Text style={commonStyles.headerActionText}>Progressions</Text>
            </Pressable>
            {progression.length > 0 && (
              <>
                <View style={commonStyles.headerSplitDivider} />
                <Pressable onPress={handleQuickSave} style={commonStyles.headerSplitRight}>
                  <Text style={commonStyles.headerSplitSaveText}>Save</Text>
                </Pressable>
              </>
            )}
          </View>
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
      {/* The progression strip (hides itself while the progression is empty) */}
      <ProgressionBar
        progression={progression}
        maxLength={MAX_PROGRESSION_LENGTH}
        preferFlats={preferFlats}
        onPillPress={handleRecallShape}
        onRemove={removeChord}
        onReorder={reorderChord}
        onClear={clearProgression}
        onShowFitChords={() => setIsFitChordsOpen(true)}
      />
      <ResultsPanel
        matches={chordResults}
        activeCount={activeCount}
        preferFlats={preferFlats}
        onAddToProgression={handleAddToProgression}
        isProgressionFull={isFull}
      />
      <SettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        showOctaves={showOctaves}
        preferFlats={preferFlats}
        onToggleOctaves={() => setShowOctaves(prev => !prev)}
        onTogglePreferFlats={() => setPreferFlats(prev => !prev)}
      />
      <ProgressionManager
        visible={isProgressionsOpen}
        onClose={() => setIsProgressionsOpen(false)}
        progression={progression}
        savedProgressions={savedProgressions}
        preferFlats={preferFlats}
        onSave={saveProgression}
        onLoad={loadProgression}
        onDelete={deleteSavedProgression}
        onRename={renameSavedProgression}
      />
      <FitChordsModal
        visible={isFitChordsOpen}
        onClose={() => setIsFitChordsOpen(false)}
        progression={progression}
        preferFlats={preferFlats}
        onAddToProgression={handleAddSuggestedChord}
        isProgressionFull={isFull}
      />
    </SafeAreaView>
  );
}
