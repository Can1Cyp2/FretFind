/* One chord shape drawn as a small fretboard diagram

   It is drawn the same way as the main fretboard but less styling: the strings run down the
   screen from the low string on the left, and the frets are the lines across. That way a shape here looks like 
   the same shape once it is loaded onto the real fretboard, rather than the user having to mentally rotate it.

   Under the diagram the shape is also written out the way guitarists actually write
   chords down (x 3 2 0 1 0), since that is the quickest thing to read off if users do not need to analyze the visual */

import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FretSelection } from '../../types';
import { COLORS } from '../../styles/colors';

interface Props {
  selections: (FretSelection | null)[];
}

const STRING_GAP = 24;
const FRET_HEIGHT = 26;
const DOT_SIZE = 17;
const MIN_ROWS = 4;

function VoicingDiagramComponent({ selections }: Props) {
  const numStrings = selections.length;
  const fretted = selections.filter(s => s && s.fret > 0).map(s => (s as FretSelection).fret);

  const lowest = fretted.length > 0 ? Math.min(...fretted) : 1;
  const highest = fretted.length > 0 ? Math.max(...fretted) : 1;

  /* Shapes near the nut are drawn starting from the first fret with the nut itself
     shown, which is how the open shapes are recognizable at a glance. Shapes higher
     up start at their own lowest fret instead, with that fret number labelled on the
     left, since drawing every fret from the nut upward would waste most of the space */
  const showNut = lowest <= 2;
  const startFret = showNut ? 1 : lowest;
  const rowCount = Math.max(MIN_ROWS, highest - startFret + 1);

  const boardWidth = (numStrings - 1) * STRING_GAP;

  return (
    <View style={styles.wrapper}>
      {/* Open and muted markers sit above the nut, the same convention every chord chart uses: */}
      <View style={[styles.markerRow, { width: boardWidth }]}>
        {selections.map((selection, i) => (
          <Text
            key={i}
            style={[
              styles.openMuteMark,
              { left: i * STRING_GAP - STRING_GAP / 2, width: STRING_GAP },
              !selection && styles.mutedMark,
            ]}
          >
            {!selection ? '✕' : selection.fret === 0 ? '○' : ''}
          </Text>
        ))}
      </View>

      <View style={styles.boardRow}>
        {/* The position label, only needed once the shape has moved off the nut */}
        <View style={styles.positionLabel}>
          {!showNut && <Text style={styles.positionText}>{startFret}fr</Text>}
        </View>

        <View style={{ width: boardWidth, height: rowCount * FRET_HEIGHT }}>
          {/* The nut, or the fret line the diagram starts on */}
          <View style={[showNut ? styles.nut : styles.topFret, { width: boardWidth }]} />

          {/* The frets across: */}
          {Array.from({ length: rowCount }).map((_, row) => (
            <View
              key={`fret-${row}`}
              style={[styles.fretLine, { top: (row + 1) * FRET_HEIGHT, width: boardWidth }]}
            />
          ))}

          {/* The strings down: */}
          {Array.from({ length: numStrings }).map((_, i) => (
            <View key={`string-${i}`} style={[styles.stringLine, { left: i * STRING_GAP }]} />
          ))}

          {/* A dot for each fretted note, centred in its fret: */}
          {selections.map((selection, i) => {
            if (!selection || selection.fret === 0) return null;
            const row = selection.fret - startFret;
            return (
              <View
                key={`dot-${i}`}
                style={[
                  styles.dot,
                  {
                    left: i * STRING_GAP - DOT_SIZE / 2,
                    top: row * FRET_HEIGHT + (FRET_HEIGHT - DOT_SIZE) / 2,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* The same shape written out the way it would be in a chord book: */}
      <Text style={styles.tabText}>
        {selections.map(s => (s ? s.fret : 'x')).join('  ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  positionLabel: {
    width: 26,
    alignItems: 'flex-end',
    paddingRight: 6,
    paddingTop: 4,
  },
  positionText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  markerRow: {
    height: 16,
    marginBottom: 4,
    marginLeft: 26,
    position: 'relative',
  },
  openMuteMark: {
    position: 'absolute',
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  mutedMark: {
    color: COLORS.textMuted,
  },
  nut: {
    position: 'absolute',
    top: 0,
    height: 4,
    borderRadius: 1,
    backgroundColor: COLORS.nutColor,
  },
  topFret: {
    position: 'absolute',
    top: 0,
    height: 1.5,
    backgroundColor: COLORS.fretWire,
  },
  fretLine: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: COLORS.fretWire,
  },
  stringLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: COLORS.stringColor,
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.accentLight,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 10,
  },
});

export const VoicingDiagram = memo(VoicingDiagramComponent);
