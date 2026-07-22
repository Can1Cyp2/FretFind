/* The saved progressions sheet, opened from the Options sheet. The top section
   shows the current progression with a name box and a Save button, and under it
   the list of progressions saved on the device. 
   
   Tapping a saved name lets the user rename it in place, 
   Load puts it back into the strip (replacing what is there), and 
   Delete asks first since it cannot be undone. */

import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ProgressionChord, SavedProgression } from '../../types';
import { COLORS } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';
import { formatChordName } from '../../engine/chordNamer';

interface Props {
  visible: boolean;
  onClose: () => void;
  progression: ProgressionChord[];
  savedProgressions: SavedProgression[];
  preferFlats?: boolean;
  onSave: (name: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export function ProgressionManager({
  visible,
  onClose,
  progression,
  savedProgressions,
  preferFlats,
  onSave,
  onLoad,
  onDelete,
  onRename,
}: Props) {
  const [saveName, setSaveName] = useState('');

  // Which saved progression is being renamed right now, and the text typed so far:
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');

  const handleSave = useCallback(() => {
    if (progression.length === 0) return;
    onSave(saveName);
    setSaveName('');
  }, [progression.length, saveName, onSave]);

  // Loading replaces the current strip, then closes the sheet so the result is visible:
  const handleLoad = useCallback(
    (id: string) => {
      onLoad(id);
      onClose();
    },
    [onLoad, onClose],
  );

  // Deleting cannot be undone, so ask first:
  const handleDelete = useCallback(
    (id: string, name: string) => {
      Alert.alert('Delete Progression', `Delete "${name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(id) },
      ]);
    },
    [onDelete],
  );

  const handleStartRename = useCallback((id: string, currentName: string) => {
    setRenamingId(id);
    setRenameText(currentName);
  }, []);

  const handleFinishRename = useCallback(() => {
    if (renamingId && renameText.trim()) {
      onRename(renamingId, renameText.trim());
    }
    setRenamingId(null);
    setRenameText('');
  }, [renamingId, renameText, onRename]);

  // The current progression written out as chord names, so the user can see what they are saving
  const currentChordSummary = progression
    .map(c => formatChordName(c.rootPitchClass, c.symbol, c.bassPitchClass, preferFlats))
    .join(' - ');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* The avoiding view shifts the whole sheet up when the keyboard opens, so the
          name inputs near the bottom of the screen stay visible while typing.
          iOS and Android move their windows differently, so each gets its own behaviour */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      {/* Tapping the dark area outside the sheet closes it, taps inside the sheet stay put */}
      <Pressable style={commonStyles.modalOverlay} onPress={onClose}>
        <Pressable style={commonStyles.modalContent} onPress={event => event.stopPropagation()}>
          <View style={commonStyles.modalHandle} />
          <View style={commonStyles.modalHeader}>
            <Text style={commonStyles.modalTitle}>Progressions</Text>
            <Pressable onPress={onClose} style={commonStyles.modalCloseButton}>
              <Text style={commonStyles.modalCloseText}>{'✕'}</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {progression.length > 0 && (
              <>
                <Text style={commonStyles.sectionTitle}>Current Progression</Text>
                <View style={styles.currentSection}>
                  <Text style={styles.currentChords}>{currentChordSummary}</Text>
                  <View style={styles.saveRow}>
                    <TextInput
                      value={saveName}
                      onChangeText={setSaveName}
                      placeholder="Progression name..."
                      placeholderTextColor={COLORS.textMuted}
                      style={styles.textInput}
                    />
                    <Pressable onPress={handleSave} style={commonStyles.saveButton}>
                      <Text style={commonStyles.saveButtonText}>Save</Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}

            <Text style={commonStyles.sectionTitle}>Saved Progressions</Text>
            {savedProgressions.length === 0 ? (
              <Text style={styles.emptyText}>
                No saved progressions yet. Add chords to a progression and save it here.
              </Text>
            ) : (
              savedProgressions.map(sp => (
                <View key={sp.id} style={styles.savedRow}>
                  {/* Tapping the name area starts a rename in place */}
                  <Pressable style={styles.savedInfo} onPress={() => handleStartRename(sp.id, sp.name)}>
                    {renamingId === sp.id ? (
                      <TextInput
                        value={renameText}
                        onChangeText={setRenameText}
                        onBlur={handleFinishRename}
                        onSubmitEditing={handleFinishRename}
                        autoFocus
                        style={styles.renameInput}
                      />
                    ) : (
                      <>
                        <Text style={styles.savedName}>{sp.name}</Text>
                        <Text style={styles.savedMeta}>
                          {sp.chords.length} chord{sp.chords.length !== 1 ? 's' : ''}
                        </Text>
                      </>
                    )}
                  </Pressable>
                  <View style={styles.savedActions}>
                    <Pressable onPress={() => handleLoad(sp.id)} style={styles.loadButton}>
                      <Text style={styles.loadText}>Load</Text>
                    </Pressable>
                    <Pressable onPress={() => handleDelete(sp.id, sp.name)} style={commonStyles.deleteButton}>
                      <Text style={commonStyles.deleteButtonText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}

            <View style={{ height: 24 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Styles only this sheet uses, the shared modal pieces come from commonStyles
const styles = StyleSheet.create({
  currentSection: {
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  currentChords: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  saveRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: COLORS.bgElevated,
    color: COLORS.textPrimary,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    fontSize: 15,
    flex: 1,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  savedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: COLORS.bgElevated,
  },
  savedInfo: {
    flex: 1,
    marginRight: 12,
  },
  savedName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  savedMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
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
  savedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadButton: {
    backgroundColor: COLORS.accentDim,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  loadText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
