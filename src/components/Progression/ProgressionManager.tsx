/* The saved progressions sheet, opened from the Options sheet. The top section
   shows the current progression with a name box and a Save button, and under it
   the list of progressions saved on the device.

   Tapping a saved name lets the user rename it in place,
   Load puts it back into the strip (replacing what is there), and
   Delete asks first since it cannot be undone.

   When someone is signed in there is a second list underneath for progressions
   saved to the cloud, which work the same way but follow the account to another
   device. Signed out, that section is simply not there.

   Once a progression is on the account (auto backup, or the cloud button), it
   drops out of the device list entirely, the two lists are meant to stay mutually
   exclusive rather than showing the same progression twice. The device button on a
   cloud row is the way back the other way: it copies that one down onto the device
   without removing it from the account, and that copy is flagged so it will not
   just get pushed straight back up, which the little note under it explains. */

import React, { memo, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ProgressionChord, SavedProgression } from '../../types';
import { COLORS } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';
import { formatChordName } from '../../engine/chordNamer';
import { backupKey } from '../../services/cloudProgressions';
import { AutoBackupStatus } from '../../hooks/useAutoBackup';

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
  // The cloud actions are awaited so the one button that started them can show a
  // spinner for exactly as long as it is actually waiting
  onSaveToCloud: (name: string) => Promise<void>;
  onRefreshCloud: () => void;    // fetches the account list again after it failed
  onLoadFromCloud: (id: string) => void;
  onDeleteFromCloud: (id: string) => Promise<void>;
  onRenameInCloud: (id: string, name: string) => void;
  // Backs up one already saved device progression to the account (the cloud button)
  onBackUpProgression: (saved: SavedProgression) => Promise<void>;
  // Copies one cloud progression back onto this device (the device button)
  onRestoreFromCloud: (cloudProgression: SavedProgression) => void;
  // What the automatic backup is up to, so the sheet can show it rather than the
  // uploading and any failures happening invisibly
  isAutoBackupOn: boolean;
  backupStatus: AutoBackupStatus;
}

function ProgressionManagerComponent({
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
  onRefreshCloud,
  onLoadFromCloud,
  onDeleteFromCloud,
  onRenameInCloud,
  onBackUpProgression,
  onRestoreFromCloud,
  isAutoBackupOn,
  backupStatus,
}: Props) {
  const [saveName, setSaveName] = useState('');

  const [backingUpId, setBackingUpId] = useState<string | null>(null);
  const [deletingCloudId, setDeletingCloudId] = useState<string | null>(null);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);

  const handleBackUpRow = useCallback(
    async (sp: SavedProgression) => {
      setBackingUpId(sp.id);
      try {
        await onBackUpProgression(sp);
      } finally {
        setBackingUpId(null);
      }
    },
    [onBackUpProgression],
  );

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
  const handleSaveToCloud = useCallback(async () => {
    if (progression.length === 0 || isSavingToCloud) return;
    setIsSavingToCloud(true);
    try {
      await onSaveToCloud(saveName);
      setSaveName('');
    } finally {
      setIsSavingToCloud(false);
    }
  }, [progression.length, saveName, onSaveToCloud, isSavingToCloud]);

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
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingCloudId(id);
            try {
              await onDeleteFromCloud(id);
            } finally {
              setDeletingCloudId(null);
            }
          },
        },
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

  /* The reverse check for the cloud list: whether a cloud progression already has a
     copy on this device, so the restore button only ever offers to bring down
     something that is not already here. */
  const onDeviceKeys = useMemo(() => new Set(savedProgressions.map(backupKey)), [savedProgressions]);
  const isOnDevice = useCallback(
    (sp: SavedProgression) => onDeviceKeys.has(backupKey(sp)),
    [onDeviceKeys],
  );

  /* One row in either list. The device list and the cloud list look and behave the
     same, so they share this instead of the whole block being written out twice.
     The rename handler is passed in, since which list the row belongs to decides
     whether the new name goes to the phone or the account.
     onBackUpRow is only given for device rows that are not on the account yet, and
     puts the little cloud button on that row. onRestoreRow is the same idea in
     reverse, only given for cloud rows with no copy on this device yet. */
  const renderSavedRow = (
    sp: SavedProgression,
    onLoadRow: (id: string) => void,
    onDeleteRow: (id: string, name: string) => void,
    onRenameRow: (id: string, name: string) => void,
    onBackUpRow?: () => void,
    onRestoreRow?: () => void,
  ) => (
    <View key={sp.id} style={styles.savedRowWrapper}>
      <View style={[styles.savedRow, sp.restoredFromCloud && styles.savedRowWithNote]}>
        {/* Tapping the name area starts a rename in place. Once it is a box, this
            stands down: it wraps the box, so tapping into the text to move the
            cursor was counting as another tap on the name and starting the rename
            over, throwing away whatever had been typed so far. */}
        <Pressable
          style={styles.savedInfo}
          onPress={() => handleStartRename(sp.id, sp.name)}
          disabled={renamingId === sp.id}
        >
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
              {/* A device row that auto backup has not got to yet. A cloud row can
                  never match this, its own key is always on the account, so the one
                  check covers both lists without needing to know which it is in. */}
              {isSignedIn && isAutoBackupOn && !sp.restoredFromCloud && !isBackedUp(sp) && (
                <Text style={styles.pendingNote}>
                  {backupStatus.backupError ? 'Not backed up yet' : 'Waiting to back up...'}
                </Text>
              )}
            </>
          )}
        </Pressable>
        <View style={styles.savedActions}>
          {/* On device rows while signed in: one tap sends this one to the account,
              without having to load it and save it again. It shows a spinner in
              place of the icon while that is actually happening. */}
          {onBackUpRow && (
            <Pressable
              onPress={onBackUpRow}
              disabled={backingUpId === sp.id}
              style={styles.backUpButton}
              hitSlop={4}
            >
              {backingUpId === sp.id ? (
                <ActivityIndicator size="small" color={COLORS.accentLight} />
              ) : (
                <Text style={styles.backUpIcon}>{'☁'}</Text>
              )}
            </Pressable>
          )}
          {/* Only on cloud rows with no copy on this device yet: one tap copies it down */}
          {onRestoreRow && (
            <Pressable onPress={onRestoreRow} style={styles.restoreButton} hitSlop={4}>
              <Text style={styles.restoreIcon}>{'📱'}</Text>
            </Pressable>
          )}
          <Pressable onPress={() => onLoadRow(sp.id)} style={styles.loadButton}>
            <Text style={styles.loadText}>Load</Text>
          </Pressable>
          {/* Only a cloud delete actually goes to the network, a device one is
              instant, so only that one ever sits here spinning */}
          <Pressable
            onPress={() => onDeleteRow(sp.id, sp.name)}
            disabled={deletingCloudId === sp.id}
            style={commonStyles.deleteButton}
          >
            {deletingCloudId === sp.id ? (
              <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
              <Text style={commonStyles.deleteButtonText}>Delete</Text>
            )}
          </Pressable>
        </View>
      </View>
      {/* Only on a device copy that was pulled down from the cloud on purpose, so it
          is clear why this one will not simply reappear on the account by itself: */}
      {sp.restoredFromCloud && (
        <View style={styles.restoredNoteBar}>
          <Text style={styles.restoredNoteIcon}>{'📱'}</Text>
          <Text style={styles.restoredNoteText}>
            Restored copy, will not be automatically returned to cloud
          </Text>
        </View>
      )}
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
      {/* The dark backdrop is its own layer sitting behind the sheet, not wrapped
          around it. Wrapped around, it covered every row and button in here and won
          the touch before they got it, so taps in the list needed a second go and
          the start of every scroll stuck for a moment. That is what made the panel
          feel like it kept locking up, even though nothing was actually stuck. The
          other list sheets were already moved to this shape for the same reason. */}
      <View style={commonStyles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={commonStyles.modalContent}>
          <View style={commonStyles.modalHandle} />
          <View style={commonStyles.modalHeader}>
            <Text style={commonStyles.modalTitle}>Progressions</Text>
            <Pressable onPress={onClose} style={commonStyles.modalCloseButton}>
              <Text style={commonStyles.modalCloseText}>{'✕'}</Text>
            </Pressable>
          </View>

          {/* Without this, a scroll view throws away the first tap that lands while
              the keyboard is up and uses it to close the keyboard instead. This
              sheet has a name box at the top and turns a row's name into a box to
              rename it, so once either had been typed in, the next tap on Load,
              Delete or the cloud button did nothing at all and had to be repeated.
              'handled' delivers the tap to the button and lets the keyboard go at
              the same time. */}
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                    <Pressable
                      onPress={handleSaveToCloud}
                      disabled={isSavingToCloud}
                      style={[styles.cloudSaveButton, isSavingToCloud && { opacity: 0.7 }]}
                    >
                      {isSavingToCloud ? (
                        <ActivityIndicator size="small" color={COLORS.accentLight} />
                      ) : (
                        <Text style={styles.cloudSaveText}>Save to cloud</Text>
                      )}
                    </Pressable>
                  )}
                </View>
              </>
            )}

            <Text style={commonStyles.sectionTitle}>
              {isSignedIn ? 'Saved On This Device' : 'Saved Progressions'}
            </Text>

            {/* What the automatic backup is doing right now: Before this, uploading
                and failing both happened completely silently, so a progression could
                sit on the device unbacked up with nothing on screen saying so. The
                failure case gets a Retry, since a failed run deliberately stops
                rather than hammering a connection that is not there */}
            {isSignedIn && isAutoBackupOn && backupStatus.backupError && (
              <View style={styles.syncBarError}>
                <Text style={styles.syncErrorText}>
                  Could not reach the cloud. {backupStatus.pendingCount} progression
                  {backupStatus.pendingCount === 1 ? '' : 's'} still to back up.
                </Text>
                <Pressable onPress={backupStatus.retryBackup} style={styles.retryButton}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            )}
            {isSignedIn && isAutoBackupOn && !backupStatus.backupError && backupStatus.isBackingUp && (
              <View style={styles.syncBar}>
                <ActivityIndicator size="small" color={COLORS.accentLight} />
                <Text style={styles.syncText}>
                  Backing up {backupStatus.pendingCount} progression
                  {backupStatus.pendingCount === 1 ? '' : 's'} to your account...
                </Text>
              </View>
            )}

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
                  /* The cloud button only makes sense signed in, but it belongs on
                     every device row then, including a restored copy. It used to be
                     hidden on anything already on the account, which left a restored
                     copy with no way back: the handler now knows not to upload a
                     second time, so the button here just means 'this lives on the
                     account only' either way. */
                  isSignedIn ? () => handleBackUpRow(sp) : undefined,
                ),
              )
            )}

            {/* The cloud list only exists while signed in. Signed out there is nothing
                here at all, so the sheet looks exactly as it did before accounts. */}
            {isSignedIn && (
              <>
                <Text style={commonStyles.sectionTitle}>Saved To Your Account</Text>
                {/* Fetching the list gives up rather than waiting forever now, so
                    this is a state the user can actually land on. Without a way to
                    ask again it would be a dead end until they signed out and back
                    in, so the message comes with a button rather than on its own. */}
                {cloudError && (
                  <View style={styles.syncBarError}>
                    <Text style={styles.syncErrorText}>{cloudError}</Text>
                    <Pressable onPress={onRefreshCloud} style={styles.retryButton}>
                      <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                  </View>
                )}
                {isCloudLoading ? (
                  <ActivityIndicator color={COLORS.accent} style={{ paddingVertical: 20 }} />
                ) : cloudProgressions.length === 0 ? (
                  <Text style={styles.emptyText}>
                    Nothing saved to your account yet. Use 'Save to cloud' above to keep a
                    progression on your account and load it on another device.
                  </Text>
                ) : (
                  cloudProgressions.map(sp =>
                    renderSavedRow(
                      sp,
                      handleLoadFromCloud,
                      handleDeleteFromCloud,
                      onRenameInCloud,
                      undefined,
                      isOnDevice(sp) ? undefined : () => onRestoreFromCloud(sp),
                    ),
                  )
                )}
              </>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* A sheet inside a Modal still gets rebuilt every time anything in the app changes,
   even while it is closed: it works out a fingerprint for every progression in both lists to decide which buttons each row should have. 
   so it is skipped entirely unless something it actually shows has changed. */
export const ProgressionManager = memo(ProgressionManagerComponent);

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
  // The device button on a cloud progression that has no copy here yet, (the reverse of the cloud button above)
  restoreButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.accentDim,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreIcon: {
    fontSize: 14,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },

  /* The strip above the device list saying what the backup is doing: */
  syncBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.accentDim,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.25)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  syncText: {
    color: COLORS.accentLight,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  syncBarError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.partialBg,
    borderWidth: 1,
    borderColor: COLORS.partialBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  syncErrorText: {
    color: COLORS.partial,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 17,
  },
  retryButton: {
    backgroundColor: COLORS.partialBg,
    borderWidth: 1,
    borderColor: COLORS.partialBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryText: {
    color: COLORS.partial,
    fontSize: 12,
    fontWeight: '700',
  },
  // The little line on a device row that has not made it to the account yet
  pendingNote: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
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
  // Wraps one row plus its optional disclaimer underneath, so the two move as one
  // block in the list rather than the spacing collapsing between them
  savedRowWrapper: {
    marginBottom: 6,
  },
  savedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
  },
  savedRowWithNote: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  /* The note joined onto the bottom of a device copy that was pulled down from the
     cloud on purpose */
  restoredNoteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  restoredNoteIcon: {
    fontSize: 11,
    marginRight: 6,
  },
  restoredNoteText: {
    color: COLORS.partial,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
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
