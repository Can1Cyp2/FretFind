/* Styles for the progression strip that sits between the fretboard and the
   results: the strip itself, the chord pills inside it, and their little
   move and remove buttons. Colours come from the global app. */

import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export const progressionStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.0,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '600',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // One chord in the strip: its position number, its name, and its buttons
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentDim,
    borderRadius: 16,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  pillIndex: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginRight: 6,
  },
  pillText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 4,
  },

  // The left and right arrows that move a chord one spot over
  arrowButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
  },
  arrowText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  removeButtonText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
  },

  // The button under the strip that opens the 'chords that fit' view
  fitButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
    backgroundColor: COLORS.accentDim,
    alignItems: 'center',
  },
  fitButtonText: {
    color: COLORS.accentLight,
    fontSize: 12,
    fontWeight: '700',
  },
});
