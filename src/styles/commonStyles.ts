/* Shared styles used across the whole app: the safe area, the header bar, the
   bottom sheet modals (the Options sheet for now, detail sheets later), and the
   setting cards inside them. 
   
   The colours come from the shared colour palette so everything still matches the rest of the app. */

import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export const commonStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header bar: the app title on the left, the action buttons on the right:
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  headerActionText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  // The split button in the header: Progressions on the left, Save attached on its
  // right like an extension, sharing one pill outline
  headerSplitButton: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: COLORS.bgElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  headerSplitLeft: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  headerSplitDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
  },
  headerSplitRight: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    backgroundColor: COLORS.accentDim,
  },
  headerSplitSaveText: {
    color: COLORS.accentLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // Bottom sheet modals: a dark overlay behind and a rounded sheet that slides up from the bottom
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '82%',
  },
  // The little grab bar at the top of the sheet to adjust height of results
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderLight,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    padding: 8,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Setting cards inside the Options sheet: a title with the current choice shown underneath
  // and an indicator on the right so the state is obvious at a glance
  settingCard: {
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  settingCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  settingValue: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // The on/off switch on the right of a setting card:
  // slides across and turns green (the app's 'good' colour) when the setting is on
  switchTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 3,
    backgroundColor: COLORS.bgHover,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: COLORS.perfectBg,
    borderColor: COLORS.perfectBorder,
  },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.textMuted,
    alignSelf: 'flex-start',
  },
  switchThumbOn: {
    backgroundColor: COLORS.perfect,
    alignSelf: 'flex-end',
  },

  // The two note spellings shown side by side (C# and Db), the one in use is lit up.
  // This is a pair of choices rather than on/off, so it gets the accent colour instead of green
  spellingChoiceRow: {
    flexDirection: 'row',
    gap: 6,
  },
  spellingChoice: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.bgHover,
  },
  spellingChoiceActive: {
    backgroundColor: COLORS.accentDim,
    borderColor: COLORS.accent,
  },
  spellingChoiceText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  spellingChoiceTextActive: {
    color: COLORS.accentLight,
  },

  // Small uppercase section titles inside the sheets (Current Progression, Saved Progressions)
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingTop: 20,
    paddingBottom: 8,
  },

  // The main action button in a sheet (saving a progression), and the destructive one (deleting)
  saveButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: 'center',
  },
  saveButtonText: {
    color: COLORS.textOnAccent,
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.dangerBg,
  },
  deleteButtonText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
  },

  // The round + button on a chord result that adds it to the progression
  addProgressionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addProgressionButtonText: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '700',
  },
});
