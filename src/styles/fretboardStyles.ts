import { StyleSheet, Dimensions, Platform } from 'react-native';
import { COLORS } from './colors'; 

const SCREEN_WIDTH = Dimensions.get('window').width;

// Vertical layout constants:
export const FRET_ROW_HEIGHT = 52;
export const NUT_ROW_HEIGHT = 40;
export const FRET_NUMBER_COL_WIDTH = 34;
export const STRING_LABEL_ROW_HEIGHT = 32;
export const MARKER_SIZE = 32;
export const STRING_LEFT_PAD = 20;
export const STRING_RIGHT_PAD = 26;
const MAX_FRETBOARD_WIDTH = 250;
export const FRETBOARD_CONTENT_WIDTH = Math.min(
  SCREEN_WIDTH - FRET_NUMBER_COL_WIDTH,
  MAX_FRETBOARD_WIDTH,
);
export const STRING_SPACING = (FRETBOARD_CONTENT_WIDTH - STRING_LEFT_PAD - STRING_RIGHT_PAD) / 5;

// Fret wire dimensions for realistic string 3D effect:
export const FRET_WIRE_HEIGHT = 3;
export const NUT_WIRE_HEIGHT = 5;

export const fretboardStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    width: FRETBOARD_CONTENT_WIDTH + FRET_NUMBER_COL_WIDTH,
    alignSelf: 'center',
    backgroundColor: COLORS.fretboardBg,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderLeftColor: '#4a3524',
    borderRightColor: '#2a1a10',
    borderRadius: 0,
    overflow: 'visible' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  // Binding for edge decoration
  containerInner: {
    flex: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: 'rgba(200, 170, 120, 0.15)',
    borderRightColor: 'rgba(200, 170, 120, 0.08)',
    overflow: 'visible' as const,
  },
  stringLabelsRowWrapper: {
    flexDirection: 'row',
    backgroundColor: COLORS.fretboardEdge,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  stringLabelsRow: {
    position: 'relative' as const,
    width: FRETBOARD_CONTENT_WIDTH,
    height: STRING_LABEL_ROW_HEIGHT,
  },
  stringLabel: { // for open string names (E A D G B E) at the top of the fretboard, the tuning can change, but that is default, colours stay the same
    position: 'absolute' as const,
    width: STRING_SPACING,
    height: STRING_LABEL_ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stringLabelText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    opacity: 0.85,
  },
  scrollView: {
    flex: 1,
  },
  fretRowWrapper: {
    flexDirection: 'row',
  },
  fretNumberCell: {
    width: FRET_NUMBER_COL_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.fretboardEdge,
  },
  openNotesButton: {
    position: 'absolute',
    top: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...Platform.select({
      ios: { // Subtle glow effect for open note indicators on iOS 
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      }, 
      android: { elevation: 3 }, // Slightly stronger elevation on Android for better visibility, as colours appear differently on each platform
    }),
  },
  openNotesButtonText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
  fretNumberText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  fretRow: {
    position: 'relative' as const,
    width: FRETBOARD_CONTENT_WIDTH,
    height: FRET_ROW_HEIGHT,
    overflow: 'visible' as const,
  },
  nutRow: {
    position: 'relative' as const,
    width: FRETBOARD_CONTENT_WIDTH,
    height: NUT_ROW_HEIGHT,
    overflow: 'visible' as const,
  },
  // 3D fret wire: sits at the bottom of each fret row
  fretWire: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: FRET_WIRE_HEIGHT,
    backgroundColor: COLORS.fretWire,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.fretWireHighlight,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.fretWireShadow,
  },
  // Nut: thicker, bonelike
  nutWire: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: NUT_WIRE_HEIGHT,
    backgroundColor: COLORS.nutColor,
    borderTopWidth: 1,
    borderTopColor: COLORS.nutHighlight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.nutShadow,
  },
  stringLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
  },
  tapArea: {
    position: 'absolute',
    width: STRING_SPACING,
    height: FRET_ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
  },
  tapAreaNut: {
    height: NUT_ROW_HEIGHT,
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInactive: {
    backgroundColor: 'transparent',
  },
  markerActive: {
    backgroundColor: COLORS.accent,
    borderWidth: 1.5,
    borderColor: COLORS.accentLight,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Pearl like inlay dots
  inlayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.inlayDot,
    borderWidth: 0.5,
    borderColor: COLORS.inlayDotHighlight,
  },
  inlayDotInner: {
    position: 'absolute',
    top: 1.5,
    left: 2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
