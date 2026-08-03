import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Fretboard } from './src/components/Fretboard/Fretboard';
import { TuningModal } from './src/components/Fretboard/TuningModal';
import { setMasterVolume } from './src/audio/notePlayer';
import { ResultsPanel } from './src/components/Results/ResultsPanel';
import { SettingsModal } from './src/components/common/SettingsModal';
import { WalkthroughModal } from './src/components/common/WalkthroughModal';
import { ProgressionBar } from './src/components/Progression/ProgressionBar';
import { ProgressionManager } from './src/components/Progression/ProgressionManager';
import { FitChordsModal } from './src/components/Progression/FitChordsModal';
import { AccountModal } from './src/components/common/AccountModal';
import { useProgression, MAX_PROGRESSION_LENGTH } from './src/hooks/useProgression';
import { useSettings } from './src/hooks/useSettings';
import { useTunings } from './src/hooks/useTunings';
import { useAuth } from './src/hooks/useAuth';
import { useCloudProgressions } from './src/hooks/useCloudProgressions';
import { useAutoBackup } from './src/hooks/useAutoBackup';
import { backupKey } from './src/services/cloudProgressions';
import { COLORS } from './src/styles/colors';
import { commonStyles } from './src/styles/commonStyles';
import { NUM_STRINGS } from './src/constants/notes';
import { getPitchClassAtFret } from './src/engine/noteUtils';
import { identifyChords } from './src/engine/chordMatcher';
import { formatChordName } from './src/engine/chordNamer';
import { ChordMatch, ChordVoicing, FretSelection, PitchClass, ProgressionChord, SavedProgression, StringIndex } from './src/types';

export default function App() {
  // The selected notes, both the fretboard and the results share them here
  const [selections, setSelections] = useState<(FretSelection | null)[]>(
    () => Array(NUM_STRINGS).fill(null),
  );

  /* Whatever the fretboard held right before the last Clear tap, so that tap can be
     undone. Not null only in the narrow window between a clear and whatever the
     user does next, at which point it is thrown away, see the invalidation below. */
  const [lastCleared, setLastCleared] = useState<(FretSelection | null)[] | null>(null);

  /* Mirrors of the two above, read by handleClearFretboard below instead of
     selections/lastCleared themselves, so that callback can keep one stable
     identity across every render rather than a new one on every single tap. The
     fretboard is memoized specifically so a tap only redraws the row it touched
     rather than the whole board, and a prop that is a new function on every tap
     would quietly defeat that the same way an unmemoized fretboard did before. */
  const selectionsRef = useRef(selections);
  selectionsRef.current = selections;
  const lastClearedRef = useRef(lastCleared);
  lastClearedRef.current = lastCleared;

  // The tuning the fretboard is currently using, the presets and any custom ones
  // the user has built, all remembered between launches by the hook. Switching
  // tuning only ever changes the open notes here, everything downstream (the
  // fretboard, the matcher, the audio) already works from open notes alone.
  const {
    currentTuning,
    currentTuningId,
    presetTunings,
    customTunings,
    selectTuning,
    addCustomTuning,
    renameCustomTuning,
    deleteCustomTuning,
  } = useTunings();
  const [isTuningOpen, setIsTuningOpen] = useState(false);

  // The user's preferences, flipped from the Options sheet and remembered between
  // launches by the hook:
  // Show octaves: when on, note labels include the octave number (E2 instead of just E),
  // so the user can see that the two E strings are the same note but two octaves apart.
  // Prefer flats: when on, notes are spelt with flats (Bb) instead of sharps (A#),
  // the same sounding notes just written the way the user prefers to read them.
  // Auto backup: when on, saving a progression also copies it to the account.
  const {
    showOctaves,
    preferFlats,
    autoBackup,
    volume,
    toggleOctaves,
    togglePreferFlats,
    toggleAutoBackup,
    setVolume,
  } = useSettings();

  // The audio player lives outside React, so the volume setting is pushed into it
  // whenever it changes (and once on start, after the stored value has loaded)
  useEffect(() => {
    setMasterVolume(volume);
  }, [volume]);

  // Whether the Options sheet is open, and whether the how-to-use-the-app walkthrough is
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  // The chord progression: the strip the user is building, the progressions saved
  // on the device, and the actions for both (all persisted by the hook)
  const {
    progression,
    savedProgressions,
    addChord,
    removeChord,
    reorderChord,
    clearProgression,
    replaceProgression,
    saveProgression,
    loadProgression,
    deleteSavedProgression,
    deleteSavedProgressions,
    renameSavedProgression,
    restoreProgressionsFromCloud,
    isFull,
  } = useProgression();

  // Whether the saved progressions sheet is open, and whether the 'chords that fit' sheet is:
  const [isProgressionsOpen, setIsProgressionsOpen] = useState(false);
  const [isFitChordsOpen, setIsFitChordsOpen] = useState(false);

  /* The handlers that only open a sheet. 
  
  They are built once here rather than written inline where they are passed, because the fretboard now skips redrawing while its props hold values
 */
  const openTuning = useCallback(() => setIsTuningOpen(true), []);
  const openFitChords = useCallback(() => setIsFitChordsOpen(true), []);
  const closeProgressions = useCallback(() => setIsProgressionsOpen(false), []);

  // The optional account, and the progressions saved to it. Everything above works signed out, 
  // these only add keeping progressions on the account instead of just this phone, so they can be loaded on another device.
  const auth = useAuth();
  const cloud = useCloudProgressions(auth.isSignedIn);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  /* While auto backup is on, this keeps the account copy up to date on its own. 

     It covers progressions saved before the switch was turned on as well as new ones,
     so turning it on backs up everything already on the phone rather too not what comes after. 

     It sends what it is currently happening so failures can be properly shown to the user */
  const backupStatus = useAutoBackup({
    enabled: autoBackup,
    isSignedIn: auth.isSignedIn,
    isCloudLoading: cloud.isLoading,
    savedProgressions,
    cloudProgressions: cloud.cloudProgressions,
    saveToCloud: cloud.saveToCloud,
    onBackedUp: deleteSavedProgressions,
  });

  const { saveToCloud, cloudProgressions, deleteManyFromCloud } = cloud;

  /* stands for: anything at all going on with the account: a request in the air, or the backup
     working in the queue. One value because multiple arent needed */
  const isCloudBusy = cloud.isBusy || backupStatus.isBackingUp;

  // Saving to the cloud sends the progression currently in the strip:
  const handleSaveToCloud = useCallback(
    async (name: string) => {
      const error = await saveToCloud(name, progression);
      Alert.alert(error ? 'Could not save' : 'Saved to your account', error ?? undefined);
    },
    [saveToCloud, progression],
  );

  /* The cloud button on a device progression: copies that one to the account as it
     is, without having to load it into the strip and save it again. Same as auto
     backup, once it is safely on the account the device does not need its own copy
     any more, so a successful back up also removes it from the device list.

     A copy restored back down from the cloud is already up there, so there is
     nothing to upload for it. Sending it again would only make the duplicate the
     user is trying to avoid, so in that case this just drops the device copy,
     which lands it in exactly the same place: on the account, and nowhere else. 
     That makes this button the true opposite of the device button on a cloud row. */
  const handleBackUpProgression = useCallback(
    async (saved: SavedProgression) => {
      const alreadyOnAccount = cloudProgressions.some(
        cp => backupKey(cp) === backupKey(saved),
      );
      if (!alreadyOnAccount) {
        const error = await saveToCloud(saved.name, saved.chords);
        if (error) {
          Alert.alert('Could not back up', error);
          return;
        }
      }
      deleteSavedProgression(saved.id);
    },
    [cloudProgressions, saveToCloud, deleteSavedProgression],
  );

  // Loading a cloud progression puts it into the strip, same as a device one:
  const handleLoadFromCloud = useCallback(
    (id: string) => {
      const found = cloudProgressions.find(p => p.id === id);
      if (found) replaceProgression(found.chords);
    },
    [cloudProgressions, replaceProgression],
  );

  /* Which cloud progressions do not already have a copy on this device, worked out
     the same way auto backup tells the two lists apart: by name and the actual
     shape of every chord, not the id, since the phone and the server each make
     their own ids for the same progression */
  const restorableCloudProgressions = useMemo(() => {
    const onDevice = new Set(savedProgressions.map(backupKey));
    return cloudProgressions.filter(cp => !onDevice.has(backupKey(cp)));
  }, [savedProgressions, cloudProgressions]);

  // The device icon on a cloud progression: copies that one back onto this device.
  // The cloud copy is untouched, this only ever adds a local copy.
  const handleRestoreFromCloud = useCallback(
    (cloudProgression: SavedProgression) => {
      restoreProgressionsFromCloud([cloudProgression]);
    },
    [restoreProgressionsFromCloud],
  );

  /* The bulk version in Settings. 
     Similar to the device button on a cloud row, but unlike it because this is a proper move: everything comes down to
     the phone and is then removed from the account, so each progression ends up in one place (which is the device).

     The device copies are made first and the account side is only cleared once they are actually here. 
     Doing it the other way round would mean a failure halfway
     through loses the progression altogether, whereas this way the worst case is a
     copy in both places, which the user can tidy up themselves */
  const handleTransferAllFromCloud = useCallback(async () => {
    const moving = restorableCloudProgressions;
    if (moving.length === 0) return;

    restoreProgressionsFromCloud(moving);
    const error = await deleteManyFromCloud(moving.map(cp => cp.id));

    if (error) {
      Alert.alert(
        'Only partly transferred',
        `The progressions are on this device now, but they could not be removed from your account: ${error}`,
      );
      return;
    }
    Alert.alert(
      'Transferred',
      `${moving.length} progression${moving.length === 1 ? '' : 's'} moved to this device and removed from your account. They will not be automatically backed up again.`,
    );
  }, [restorableCloudProgressions, restoreProgressionsFromCloud, deleteManyFromCloud]);

  // Switching tuning changes what every open string (and so every fret) actually sounds, 
  // so whatever was already selected no longer means what it looked like it meant. 
  // Clearing the board on a tuning change keeps the selection and the
  // tuning always in agreement, rather than leaving stale notes behind.
  const handleSelectTuning = useCallback(
    (id: string) => {
      selectTuning(id);
      setSelections(Array(NUM_STRINGS).fill(null));
      // The frets that were cleared belonged to the old tuning, so restoring them
      // under the new one would put back the wrong notes
      setLastCleared(null);
    },
    [selectTuning],
  );

  const handleCreateCustomTuning = useCallback(
    (name: string, notes: PitchClass[], octaves: number[]) => {
      addCustomTuning(name, notes, octaves);
      setSelections(Array(NUM_STRINGS).fill(null));
      setLastCleared(null);
    },
    [addCustomTuning],
  );

  // Tap toggles a fret: tapping the same fret again clears that string,
  // otherwise it selects the new fret (and works out the note it makes).
  const handleFretPress = useCallback(
    (stringIndex: StringIndex, fret: number) => {
      // Any direct fretboard tap means there is no longer one specific 'previous
      // chord' to undo back to, whether this tap adds a note or clears one string
      setLastCleared(null);
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
    setLastCleared(null);
    setSelections(prev =>
      prev.map((selection, stringIndex) => {
        if (selection) return selection;
        const si = stringIndex as StringIndex;
        const pitchClass = getPitchClassAtFret(currentTuning.notes[si] as PitchClass, 0);
        return { stringIndex: si, fret: 0, pitchClass };
      }),
    );
  }, [currentTuning.notes]);

  /* The clear fretboard button: */
  const handleClearFretboard = useCallback(() => {
    if (lastClearedRef.current) {
      setSelections(lastClearedRef.current);
      setLastCleared(null);
    } else {
      setLastCleared(selectionsRef.current);
      setSelections(Array(NUM_STRINGS).fill(null));
    }
  }, []);

  // Adding a chord to the progression keeps the exact shape currently on the fretboard,
  // so the progression remembers how the chord was actually played. The confirmation
  // that this worked lives on the + button itself (it flashes green), not here, since
  // a banner can end up hidden behind a phone's camera cutout and the button never can.
  const handleAddToProgression = useCallback(
    (match: ChordMatch) => {
      addChord(match, selections);
    },
    [addChord, selections],
  );

  /* Adding a suggested chord from the key view. It did not come from the fretboard,
     so the shape it is saved with is whichever one the user had open in the Shapes
     section at the time, shape 3 of 8 or whatever they had swiped to.

     This used to store no shape at all, which meant a chord added this way went into
     the progression as a name with nothing behind it: tapping its pill later did
     nothing, and it could not be heard or strummed. Only this path does it, chords
     added from the results keep the exact shape the user played rather than a
     generated one, which is the whole point of the progression remembering shapes.

     A chord with no playable shape in this tuning still falls back to no shape,
     which behaves exactly as it did before. */
  const handleAddSuggestedChord = useCallback(
    (match: ChordMatch, shownVoicing?: ChordVoicing | null) => {
      addChord(match, shownVoicing ? shownVoicing.selections : Array(NUM_STRINGS).fill(null));
    },
    [addChord],
  );

  /* Loading a shape from the Shapes section of a chords breakdown:
     It replaces whatever is on the fretboard, the same as recalling a progression chord does,
     since the point is to see that one shape in place and be able to strum it */
  const handleLoadVoicing = useCallback((voicing: ChordVoicing) => {
    setLastCleared(null);
    setSelections(voicing.selections.map(s => (s ? { ...s } : null)));
  }, []);

  // Tapping a pill puts that chord's saved shape back onto the fretboard
  // (this replaces whatever is currently selected)
  const handleRecallShape = useCallback((chord: ProgressionChord) => {
    // Chords added from the key suggestions have no saved shape, so there is nothing to recall:
    if (!chord.selections.some(Boolean)) return;
    setLastCleared(null);
    setSelections(chord.selections.map(s => (s ? { ...s } : null)));
  }, []);

  // The Save button in the header: one tap keeps the current progression, named
  // after its chords (renameable later in the Progressions sheet). With auto backup
  // on, the sync above picks it up and copies it to the account on its own.
  const handleQuickSave = useCallback(() => {
    if (progression.length === 0) return;
    const names = progression.map(c =>
      formatChordName(c.rootPitchClass, c.symbol, c.bassPitchClass, preferFlats),
    );
    // Long progressions get a shortened name so the saved list stays readable
    const name =
      names.length > 4 ? `${names.slice(0, 4).join(' - ')} +${names.length - 4} more` : names.join(' - ');
    saveProgression(name);
    Alert.alert(
      'Saved',
      autoBackup && auth.isSignedIn
        ? `"${name}" was saved and backed up to your account.`
        : `"${name}" was added to your saved progressions.`,
    );
  }, [progression, preferFlats, saveProgression, autoBackup, auth.isSignedIn]);

  // Work out the matching chords whenever the selection changes (in real time):
  const chordResults = useMemo(() => {
    const active = selections.filter(Boolean) as FretSelection[];
    if (active.length < 2) return [];
    return identifyChords(active, preferFlats);
  }, [selections, preferFlats]);

  const activeCount = selections.filter(Boolean).length;

  /* The clear button shows for either of two reasons: there is something on the
     board worth clearing or the last thing that happened was clearing something
     and need to display the undo button */
  const showClearButton = activeCount > 0 || lastCleared !== null;
  const clearButtonMode: 'clear' | 'undo' = lastCleared !== null ? 'undo' : 'clear';

  /* SafeAreaProvider has to wrap the tree. Without this, Android in particular has nothing keeping content out 
  from under the status bar and the gesture bar / back button area: React Native's own SafeAreaView only ever did anything on iOS */
  return (
    <SafeAreaProvider>
    <SafeAreaView style={commonStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={commonStyles.header}>
        {/* The title, with a quiet spinner beside it whenever anything is talking to
            the account. Talking to the account is the one thing in the app that is
            not instant, and it can be set off from several places (saving, the
            backup running on its own, transferring), so saying so once here covers
            all of them wherever the user happens to be, rather than only being
            visible on whichever sheet started it. */}
        <View style={commonStyles.headerTitleRow}>
          <Text style={commonStyles.headerTitle}>FretFind</Text>
          {isCloudBusy && (
            <View style={commonStyles.headerSyncBadge}>
              <ActivityIndicator size="small" color={COLORS.accentLight} />
              <Text style={commonStyles.headerSyncText}>Syncing</Text>
            </View>
          )}
        </View>
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
        onOpenTuning={openTuning}
        showClearButton={showClearButton}
        clearButtonMode={clearButtonMode}
        onClearFretboard={handleClearFretboard}
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
        onShowFitChords={openFitChords}
      />
      <ResultsPanel
        matches={chordResults}
        activeCount={activeCount}
        preferFlats={preferFlats}
        onAddToProgression={handleAddToProgression}
        isProgressionFull={isFull}
        tuning={currentTuning}
        onLoadVoicing={handleLoadVoicing}
      />
      <SettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        showOctaves={showOctaves}
        preferFlats={preferFlats}
        volume={volume}
        onToggleOctaves={toggleOctaves}
        onTogglePreferFlats={togglePreferFlats}
        onVolumeChange={setVolume}
        isAccountAvailable={auth.isAvailable}
        isSignedIn={auth.isSignedIn}
        accountEmail={auth.email}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
      />
      <WalkthroughModal
        visible={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />
      <ProgressionManager
        visible={isProgressionsOpen}
        onClose={closeProgressions}
        progression={progression}
        savedProgressions={savedProgressions}
        preferFlats={preferFlats}
        onSave={saveProgression}
        onLoad={loadProgression}
        onDelete={deleteSavedProgression}
        onRename={renameSavedProgression}
        isSignedIn={auth.isSignedIn}
        cloudProgressions={cloud.cloudProgressions}
        isCloudLoading={cloud.isLoading}
        cloudError={cloud.error}
        onSaveToCloud={handleSaveToCloud}
        onRefreshCloud={cloud.refresh}
        onLoadFromCloud={handleLoadFromCloud}
        onDeleteFromCloud={cloud.deleteFromCloud}
        onRenameInCloud={cloud.renameInCloud}
        onBackUpProgression={handleBackUpProgression}
        onRestoreFromCloud={handleRestoreFromCloud}
        isAutoBackupOn={autoBackup}
        backupStatus={backupStatus}
      />
      <FitChordsModal
        visible={isFitChordsOpen}
        onClose={() => setIsFitChordsOpen(false)}
        progression={progression}
        preferFlats={preferFlats}
        onAddToProgression={handleAddSuggestedChord}
        isProgressionFull={isFull}
        tuning={currentTuning}
        onLoadVoicing={handleLoadVoicing}
      />
      <TuningModal
        visible={isTuningOpen}
        onClose={() => setIsTuningOpen(false)}
        currentTuningId={currentTuningId}
        presetTunings={presetTunings}
        customTunings={customTunings}
        preferFlats={preferFlats}
        onSelectTuning={handleSelectTuning}
        onCreateCustomTuning={handleCreateCustomTuning}
        onRenameCustomTuning={renameCustomTuning}
        onDeleteCustomTuning={deleteCustomTuning}
      />
      <AccountModal
        visible={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        isSignedIn={auth.isSignedIn}
        email={auth.email}
        autoBackup={autoBackup}
        onToggleAutoBackup={toggleAutoBackup}
        restorableCloudCount={restorableCloudProgressions.length}
        onTransferAllFromCloud={handleTransferAllFromCloud}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
        onSignOut={auth.signOut}
      />
    </SafeAreaView>
    </SafeAreaProvider>
  );
}
