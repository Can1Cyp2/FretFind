/* Styles for the results area under the fretboard: the panel
   itself, each chord result row, and the perfect or partial badge. The colours
   come from the shared colour palette so the results match the rest of the app. */

import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export const resultStyles = StyleSheet.create({
  // The results panel that sits under the fretboard. No fixed height here:
  // the panel sets its own height, since the user can drag it bigger or smaller.
  container: {
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 12,
  },

  // The drag handle at the top of the panel: a small grab bar with an arrow hint under it
  dragHandleRow: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
  },
  dragHandleBar: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.borderLight,
  },
  dragHandleHint: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },

  // Shown when there is nothing to match yet (fewer than two notes, or no match):
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
    lineHeight: 19,
  },

  // The Results heading row, with a small count on the right
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  count: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },

  // One chord result row
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  cardPerfect: { borderColor: COLORS.perfectBorder },
  cardPartial: { borderColor: COLORS.partialBorder },
  cardWeak: { borderColor: COLORS.weakBorder },
  chordName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  chordNotes: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  chordSubtext: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  // The perfect or partial badge on the right of a row:
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgePerfect: {
    backgroundColor: COLORS.perfectBg,
    borderColor: COLORS.perfectBorder,
  },
  badgePartial: {
    backgroundColor: COLORS.partialBg,
    borderColor: COLORS.partialBorder,
  },
  badgeWeak: {
    backgroundColor: COLORS.weakBg,
    borderColor: COLORS.weakBorder,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  badgeTextPerfect: { color: COLORS.perfect },
  badgeTextPartial: { color: COLORS.partial },
  badgeTextWeak: { color: COLORS.weak },
});
