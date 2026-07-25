/* The saved progressions sheet, opened from the Options sheet. The top section
   shows the current progression with a name box and a Save button, and under it
   the list of progressions saved on the device.

   Tapping a saved name lets the user rename it in place,
   Load puts it back into the strip (replacing what is there), and
   Delete asks first since it cannot be undone.

   When someone is signed in there is a second list underneath for progressions
   saved to the cloud, which work the same way but follow the account to another
   device. Signed out, that section is simply not there. */

import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ProgressionChord, SavedProgression } from '../../types';
import { COLORS } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';
import { formatChordName } from '../../engine/chordNamer';
import { backupKey } from '../../services/cloudProgressions';

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
  // The cloud side, only used while signed in
  isSignedIn: boolean;
  cloudProgressions: SavedProgression[];
  isCloudLoading: boolean;
  cloudError: string | null;
  onSaveToCloud: (name: string) => void;
  onLoadFromCloud: (id: string) => void;
  onDeleteFromCloud: (id: string) => void;
  onRenameInCloud: (id: string, name: string) => void;
  // Backs up one already saved device progression to the account (the cloud button)
  onBackUpProgression: (saved: SavedProgression) => void;
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
  isSignedIn,
  cloudProgressions,
  isCloudLoading,
  cloudError,
  onSaveToCloud,
  onLoadFromCloud,
  onDeleteFromCloud,
  onRenameInCloud,
  onBackUpProgression,
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

  // The cloud versions of the three actions. They do the same thing as the device
  // ones, just against the account instead of this phone.
  const handleSaveToCloud = useCallback(() => {
    if (progression.length === 0) return;
    onSaveToCloud(saveName);
    setSaveName('');
  }, [progression.length, saveName, onSaveToCloud]);

  const handleLoadFromCloud = useCallback(
    (id: string) => {
      onLoadFromCloud(id);
      onClose();
    },
    [onLoadFromCloud, onClose],
  );

  const handleDeleteFromCloud = useCallback(
    (id: string, name: string) => {
      Alert.alert('Delete Progression', `Delete "${name}" from the cloud?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteFromCloud(id) },
      ]);
    },
    [onDeleteFromCloud],
  );

  // The current progression written out as chord names, so the user can see what they are saving
  const currentChordSummary = progression
    .map(c => formatChordName(c.rootPitchClass, c.symbol, c.bassPitchClass, preferFlats))
    .join(' - ');

  /* Works out whether a device progression already has a copy on the account, using
     the same key the automatic backup uses, so the cloud button never appears on
     something that is actually already backed up. */
  const onAccountKeys = useMemo(
    () => new Set(cloudProgressions.map(backupKey)),
    [cloudProgressions],
  );
  const isBackedUp = useCallback(
    (sp: SavedProgression) => onAccountKeys.has(backupKey(sp)),
    [onAccountKeys],
  );

  /* One row in either list. The device list and the cloud list look and behave the
     same, so they share this instead of the whole block being written out twice.
     The rename handler is passed in, since which list the row belongs to decides
     whether the new name goes to the phone or the account.
     onBackUpRow is only given for device rows that are not on the account yet, and
     puts the little cloud button on that row. */
  const renderSavedRow = (
    sp: SavedProgression,
    onLoadRow: (id: string) => void,
    onDeleteRow: (id: string, name: string) => void,
    onRenameRow: (id: string, name: string) => void,
    onBackUpRow?: () => void,
  ) => (
    <View key={sp.id} style={styles.savedRow}>
      {/* Tapping the name area starts a rename in place */}
      <Pressable style={styles.savedInfo} onPress={() => handleStartRename(sp.id, sp.name)}>
        {renamingId === sp.id ? (
          <TextInput
            value={renameText}
            onChangeText={setRenameText}
            onBlur={() => {
              if (renameText.trim()) onRenameRow(sp.id, renameText.trim());
              setRenamingId(null);
              setRenameText('');
            }}
            onSubmitEditing={() => {
              if (renameText.trim()) onRenameRow(sp.id, renameText.trim());
              setRenamingId(null);
              setRenameText('');
            }}
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
        {/* Only on device rows that are not on the account yet: one tap backs this
            one up, without having to load it and save it again */}
        {onBackUpRow && (
          <Pressable onPress={onBackUpRow} style={styles.backUpButton} hitSlop={4}>
            <Text style={styles.backUpIcon}>{'☁'}</Text>
          </Pressable>
        )}
        <Pressable onPress={() => onLoadRow(sp.id)} style={styles.loadButton}>
          <Text style={styles.loadText}>Load</Text>
        </Pressable>
        <Pressable onPress={() => onDeleteRow(sp.id, sp.name)} style={commonStyles.deleteButton}>
          <Text style={commonStyles.deleteButtonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

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
                  {/* Signed in, the same name can also be sent to the account instead */}
                  {isSignedIn && (
                    <Pressable onPress={handleSaveToCloud} style={styles.cloudSaveButton}>
                      <Text style={styles.cloudSaveText}>Save to cloud</Text>
                    </Pressable>
                  )}
                </View>
              </>
            )}

            <Text style={commonStyles.sectionTitle}>
              {isSignedIn ? 'Saved On This Device' : 'Saved Progressions'}
            </Text>
            {savedProgressions.length === 0 ? (
              <Text style={styles.emptyText}>
                No saved progressions yet. Add chords to a progression and save it here.
              </Text>
            ) : (
              savedProgressions.map(sp =>
                renderSavedRow(
                  sp,
                  handleLoad,
                  handleDelete,
                  onRename,
                  // The cloud button only makes sense signed in, and only on the ones
                  // that are not already on the account
                  isSignedIn && !isBackedUp(sp)
                    ? () => onBackUpProgression(sp)
                    : undefined,
                ),
              )
            )}

            {/* The cloud list only exists while signed in. Signed out there is nothing
                here at all, so the sheet looks exactly as it did before accounts. */}
            {isSignedIn && (
              <>
                <Text style={commonStyles.sectionTitle}>Saved To Your Account</Text>
                {cloudError && <Text style={styles.errorText}>{cloudError}</Text>}
                {isCloudLoading ? (
                  <ActivityIndicator color={COLORS.accent} style={{ paddingVertical: 20 }} />
                ) : cloudProgressions.length === 0 ? (
                  <Text style={styles.emptyText}>
                    Nothing saved to your account yet. Use 'Save to cloud' above to keep a
                    progression on your account and load it on another device.
                  </Text>
                ) : (
                  cloudProgressions.map(sp =>
                    renderSavedRow(sp, handleLoadFromCloud, handleDeleteFromCloud, onRenameInCloud),
                  )
                )}
              </>
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
  // The cloud save button sits under the device save row, quieter than the main
  // Save button since it is the extra option, not the default one
  cloudSaveButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
    alignItems: 'center',
  },
  cloudSaveText: {
    color: COLORS.accentLight,
    fontSize: 13,
    fontWeight: '700',
  },
  // The little cloud button on a device progression that is not on the account yet
  backUpButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.accentDim,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backUpIcon: {
    color: COLORS.accentLight,
    fontSize: 15,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
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
