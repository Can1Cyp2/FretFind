/* The tuning popup, opened from the tuning fork button:

   - lists the common tunings, then any custom tunings saved on
   the device, tap either to switch to it straight away. Custom tunings can also be
   renamed in place (tap the name) or deleted.

   - 'Create Custom Tuning' button, swaps the list out for a small builder: 
   a stepper per string to pick its open note, and a name box

   Saving is local only for now (the same device storage every other saved list in
   the app already uses), cloud saving for tunings is planned for later (if I have time). */

import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PitchClass, Tuning } from '../../types';
import { COLORS } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';
import { pitchClassToName } from '../../engine/noteUtils';
import { STANDARD_TUNING } from '../../constants/tunings';
import { ModalSafeArea } from '../common/ModalSafeArea';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentTuningId: string;
  presetTunings: Tuning[];
  customTunings: Tuning[];
  preferFlats?: boolean;
  onSelectTuning: (id: string) => void;
  onCreateCustomTuning: (name: string, notes: PitchClass[], octaves: number[]) => void;
  onRenameCustomTuning: (id: string, name: string) => void;
  onDeleteCustomTuning: (id: string) => void;
}

/* Standard tuning's own absolute pitch, one semitone count per string (the same
   number getOpenStringMidi works out for the fretboard and audio). 
   
   Every string in the builder starts here and is stepped up or down from it, rather than the stepper
   just spinning a note name 0 to 11 on its own with no memory of which octave it is in. 
   
   Tracking the real semitone count is what lets stepping the low string down past
   its open note (E to D to C# ...) correctly drop it into the octave below, instead of
   silently wrapping back up to a B in the SAME octave, a whole octave too high and
   nowhere near the note that was actually picked. */
const STANDARD_ABSOLUTE = STANDARD_TUNING.notes.map(
  (pc, i) => (STANDARD_TUNING.octaves[i] + 1) * 12 + pc,
);

// How far a string can be stepped from its standard pitch, a full octave either way,
// which already covers every real alternate tuning a 6 string guitar is tuned to
const MAX_STEP_RANGE = 12;

function clampOffset(value: number): number {
  return Math.max(-MAX_STEP_RANGE, Math.min(MAX_STEP_RANGE, value));
}

function pitchClassOf(absolute: number): PitchClass {
  return (((absolute % 12) + 12) % 12) as PitchClass;
}

export function TuningModal({
  visible,
  onClose,
  currentTuningId,
  presetTunings,
  customTunings,
  preferFlats,
  onSelectTuning,
  onCreateCustomTuning,
  onRenameCustomTuning,
  onDeleteCustomTuning,
}: Props) {
  // Whether the builder is showing instead of the tuning lists:
  const [isCreating, setIsCreating] = useState(false);
  // How far each string has been stepped from standard tuning, not the notes
  const [draftOffsets, setDraftOffsets] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [draftName, setDraftName] = useState('');

  // Which custom tuning is being renamed in place right now, and the text typed so far
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');

  const handleSelect = useCallback(
    (id: string) => {
      onSelectTuning(id);
      onClose();
    },
    [onSelectTuning, onClose],
  );

  const handleStartCreate = useCallback(() => {
    setDraftOffsets([0, 0, 0, 0, 0, 0]);
    setDraftName('');
    setIsCreating(true);
  }, []);

  const stepNote = useCallback((stringIndex: number, direction: 1 | -1) => {
    setDraftOffsets(prev => {
      const next = [...prev];
      next[stringIndex] = clampOffset(next[stringIndex] + direction);
      return next;
    });
  }, []);

  const handleSaveCustom = useCallback(() => {
    const absolutes = draftOffsets.map((offset, i) => STANDARD_ABSOLUTE[i] + offset);
    const notes = absolutes.map(pitchClassOf);
    // The same octave math getOpenStringMidi uses in reverse: an absolute semitone count back into which octave it falls in
    const octaves = absolutes.map(absolute => Math.floor(absolute / 12) - 1);
    onCreateCustomTuning(draftName, notes, octaves);
    setIsCreating(false);
    onClose();
  }, [draftName, draftOffsets, onCreateCustomTuning, onClose]);

  const handleStartRename = useCallback((id: string, currentName: string) => {
    setRenamingId(id);
    setRenameText(currentName);
  }, []);

  const finishRename = useCallback(() => {
    if (renamingId && renameText.trim()) onRenameCustomTuning(renamingId, renameText.trim());
    setRenamingId(null);
    setRenameText('');
  }, [renamingId, renameText, onRenameCustomTuning]);

  const handleDeleteCustom = useCallback(
    (id: string, name: string) => {
      Alert.alert('Delete Tuning', `Delete "${name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteCustomTuning(id) },
      ]);
    },
    [onDeleteCustomTuning],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ModalSafeArea>
      {/* Shifts the sheet up when the keyboard covers the name field the same fix
          already used in AccountModal for the same reason */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Pressable style={commonStyles.modalOverlay} onPress={onClose}>
        <Pressable style={commonStyles.modalContent} onPress={event => event.stopPropagation()}>
          <View style={commonStyles.modalHandle} />
          <View style={commonStyles.modalHeader}>
            <Text style={commonStyles.modalTitle}>{isCreating ? 'Custom Tuning' : 'Tuning'}</Text>
            <Pressable
              onPress={isCreating ? () => setIsCreating(false) : onClose}
              style={commonStyles.modalCloseButton}
              hitSlop={8}
            >
              <Text style={commonStyles.modalCloseText}>{isCreating ? '‹' : '✕'}</Text>
            </Pressable>
          </View>

          {isCreating ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.builderHint}>
                Pick the open note for each string, from the lowest (String 1) to the highest (String 6).
              </Text>
              {draftOffsets.map((offset, i) => {
                // Worked out fresh from the offset each render,
                // so what is shown while building is exactly what gets saved octave included
                const absolute = STANDARD_ABSOLUTE[i] + offset;
                const pc = pitchClassOf(absolute);
                const octave = Math.floor(absolute / 12) - 1;
                return (
                  <View key={i} style={styles.stringRow}>
                    <Text style={styles.stringLabel}>String {i + 1}</Text>
                    <View style={styles.stepper}>
                      <Pressable
                        onPress={() => stepNote(i, -1)}
                        style={styles.stepButton}
                        hitSlop={6}
                      >
                        <Text style={styles.stepButtonText}>{'−'}</Text>
                      </Pressable>
                      <Text style={styles.stepValue}>
                        {pitchClassToName(pc, preferFlats)}{octave}
                      </Text>
                      <Pressable
                        onPress={() => stepNote(i, 1)}
                        style={styles.stepButton}
                        hitSlop={6}
                      >
                        <Text style={styles.stepButtonText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}

              <TextInput
                value={draftName}
                onChangeText={setDraftName}
                placeholder="Tuning name..."
                placeholderTextColor={COLORS.textMuted}
                style={styles.textInput}
              />

              <Pressable onPress={handleSaveCustom} style={[commonStyles.saveButton, styles.saveButtonWide]}>
                <Text style={commonStyles.saveButtonText}>Save Tuning</Text>
              </Pressable>
              <View style={{ height: 24 }} />
            </ScrollView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={commonStyles.sectionTitle}>Common Tunings</Text>
              {presetTunings.map(t => {
                const isActive = t.id === currentTuningId;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => handleSelect(t.id)}
                    style={[styles.presetRow, isActive && styles.presetRowActive]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.tuningName, isActive && styles.tuningNameActive]}>{t.name}</Text>
                      <Text style={styles.tuningNotes}>
                        {t.notes.map(pc => pitchClassToName(pc as PitchClass, preferFlats)).join(' ')}
                      </Text>
                    </View>
                    {isActive && <Text style={styles.activeCheck}>{'✓'}</Text>}
                  </Pressable>
                );
              })}

              <Text style={commonStyles.sectionTitle}>Custom Tunings</Text>
              {customTunings.length === 0 ? (
                <Text style={styles.emptyText}>
                  No custom tunings yet. Create one below to tune the fretboard your own way.
                </Text>
              ) : (
                customTunings.map(t => {
                  const isActive = t.id === currentTuningId;
                  return (
                    <View key={t.id} style={styles.customRow}>
                      <Pressable
                        style={styles.customInfo}
                        onPress={() => handleStartRename(t.id, t.name)}
                      >
                        {renamingId === t.id ? (
                          <TextInput
                            value={renameText}
                            onChangeText={setRenameText}
                            onBlur={finishRename}
                            onSubmitEditing={finishRename}
                            autoFocus
                            style={styles.renameInput}
                          />
                        ) : (
                          <>
                            <Text style={[styles.tuningName, isActive && styles.tuningNameActive]}>
                              {t.name}
                            </Text>
                            <Text style={styles.tuningNotes}>
                              {t.notes.map(pc => pitchClassToName(pc as PitchClass, preferFlats)).join(' ')}
                            </Text>
                          </>
                        )}
                      </Pressable>
                      <View style={styles.customActions}>
                        <Pressable
                          onPress={() => handleSelect(t.id)}
                          style={[styles.useButton, isActive && styles.useButtonActive]}
                        >
                          <Text style={[styles.useText, isActive && styles.useTextActive]}>
                            {isActive ? 'Active' : 'Use'}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeleteCustom(t.id, t.name)}
                          style={commonStyles.deleteButton}
                        >
                          <Text style={commonStyles.deleteButtonText}>Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })
              )}

              <Pressable onPress={handleStartCreate} style={styles.createButton}>
                <Text style={styles.createButtonText}>{'+ Create Custom Tuning'}</Text>
              </Pressable>

              <View style={{ height: 24 }} />
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
      </ModalSafeArea>
    </Modal>
  );
}

const styles = StyleSheet.create({
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  presetRowActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  tuningName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  tuningNameActive: {
    color: COLORS.accentLight,
  },
  tuningNotes: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 3,
    letterSpacing: 1,
  },
  activeCheck: {
    color: COLORS.accentLight,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  customRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.bgElevated,
  },
  customInfo: {
    flex: 1,
    marginRight: 10,
  },
  customActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  useButton: {
    backgroundColor: COLORS.bgHover,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  useButtonActive: {
    backgroundColor: COLORS.accentDim,
  },
  useText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  useTextActive: {
    color: COLORS.accentLight,
  },
  renameInput: {
    backgroundColor: COLORS.bgCard,
    color: COLORS.textPrimary,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent,
    fontSize: 15,
  },
  createButton: {
    marginTop: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
    alignItems: 'center',
  },
  createButtonText: {
    color: COLORS.accentLight,
    fontSize: 14,
    fontWeight: '700',
  },
  builderHint: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  stringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  stringLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.bgHover,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  stepValue: {
    color: COLORS.accentLight,
    fontSize: 15,
    fontWeight: '800',
    minWidth: 38, // wide enough for the octave number now shown alongside the note, e.g. "C#2"
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: COLORS.bgElevated,
    color: COLORS.textPrimary,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    fontSize: 15,
    marginTop: 8,
    marginBottom: 16,
  },
  saveButtonWide: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
});
