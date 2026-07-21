/* The 'chords that fit' sheet, opened from the button under the progression strip.
   It works out which key the progression most likely lives in, shows every key as
   a selectable chip (ordered best match first, with the best one picked by
   default), and lists the seven chords that key builds on its scale degrees, with
   roman numerals and their notes.
   Chords the progression already uses are marked so what is left to try stands out. */

import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChordMatch, ProgressionChord } from '../../types';
import { COLORS } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';
import { rankKeys, getDiatonicChords, diatonicChordToMatch } from '../../engine/keyMatcher';
import { TRIAD_INTERVALS } from '../../constants/scales';
import { formatChordName, getNotesInChord } from '../../engine/chordNamer';
import { ChordDetailModal } from '../Results/ChordDetailModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  progression: ProgressionChord[];
  preferFlats?: boolean;
  onAddToProgression?: (match: ChordMatch) => void; // adds a suggested chord to the progression
  isProgressionFull?: boolean; // hides the add option when the progression is at its cap
}

export function FitChordsModal({
  visible,
  onClose,
  progression,
  preferFlats,
  onAddToProgression,
  isProgressionFull,
}: Props) {
  // Every key ranked against the progression, best match first
  const rankedKeys = useMemo(() => rankKeys(progression, preferFlats), [progression, preferFlats]);

  // Which key chip is selected (0 is the best match, and the default)
  const [selectedIndex, setSelectedIndex] = useState(0);

  // The suggested chord the user tapped to read about (null when none is open)
  const [selectedChord, setSelectedChord] = useState<ChordMatch | null>(null);

  // Snap back to the best match whenever the sheet opens fresh
  useEffect(() => {
    if (visible) setSelectedIndex(0);
  }, [visible]);

  const selectedKey = rankedKeys[selectedIndex] ?? rankedKeys[0];
  const diatonicChords = useMemo(
    () => (selectedKey ? getDiatonicChords(selectedKey, progression) : []),
    [selectedKey, progression],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Tapping the dark area outside the sheet closes it, taps inside the sheet stay put */}
      <Pressable style={commonStyles.modalOverlay} onPress={onClose}>
        <Pressable style={commonStyles.modalContent} onPress={event => event.stopPropagation()}>
          <View style={commonStyles.modalHandle} />
          <View style={commonStyles.modalHeader}>
            <Text style={commonStyles.modalTitle}>Chords That Fit</Text>
            <Pressable onPress={onClose} style={commonStyles.modalCloseButton}>
              <Text style={commonStyles.modalCloseText}>{'✕'}</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.explainer}>
              Chords in the same key usually sound good together. The keys below are
              ordered by how well they match your progression, tap one to see its chords.
            </Text>

            {/* The key selector: every key as a chip, best match first and picked by default */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.keyRow}
            >
              {rankedKeys.map((key, i) => {
                const isSelected = i === selectedIndex;
                return (
                  <Pressable
                    key={`${key.tonicPc}-${key.type}`}
                    onPress={() => setSelectedIndex(i)}
                    style={[styles.keyChip, isSelected && styles.keyChipSelected]}
                  >
                    <Text style={[styles.keyChipText, isSelected && styles.keyChipTextSelected]}>
                      {key.name}
                    </Text>
                    {i === 0 && <Text style={styles.bestMatchTag}>best match</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* The seven chords the selected key is built from. Tapping one opens its
                theory breakdown, where it can also be added to the progression */}
            {diatonicChords.map(chord => {
              const name = formatChordName(chord.rootPitchClass, chord.symbol, undefined, preferFlats);
              const notes = getNotesInChord(chord.rootPitchClass, TRIAD_INTERVALS[chord.quality], preferFlats);
              return (
                <Pressable
                  key={chord.numeral}
                  onPress={() => setSelectedChord(diatonicChordToMatch(chord, preferFlats))}
                  style={({ pressed }) => [styles.chordRow, pressed && { opacity: 0.8 }]}
                >
                  <View style={styles.numeralBadge}>
                    <Text style={styles.numeralText}>{chord.numeral}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chordName}>{name}</Text>
                    <Text style={styles.chordNotes}>{notes.join('  -  ')}</Text>
                  </View>
                  {chord.inProgression && (
                    <View style={styles.inUseTag}>
                      <Text style={styles.inUseText}>in progression</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}

            <Text style={styles.footnote}>
              Tap a chord to see its notes and theory, and to add it to the progression.
            </Text>

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* The theory breakdown for a tapped suggestion, same view the results use */}
          <ChordDetailModal
            match={selectedChord}
            visible={selectedChord !== null}
            onClose={() => setSelectedChord(null)}
            preferFlats={preferFlats}
            isSuggestion
            onAddToProgression={
              onAddToProgression && !isProgressionFull && selectedChord
                ? () => onAddToProgression(selectedChord)
                : undefined
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Styles only this sheet uses, the shared modal pieces come from commonStyles
const styles = StyleSheet.create({
  explainer: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  keyChip: {
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  keyChipSelected: {
    backgroundColor: COLORS.accentDim,
    borderColor: COLORS.accent,
  },
  keyChipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  keyChipTextSelected: {
    color: COLORS.accentLight,
  },
  bestMatchTag: {
    color: COLORS.perfect,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  numeralBadge: {
    width: 44,
    alignItems: 'center',
    marginRight: 10,
  },
  numeralText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '800',
  },
  chordName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  chordNotes: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  inUseTag: {
    backgroundColor: COLORS.perfectBg,
    borderWidth: 1,
    borderColor: COLORS.perfectBorder,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inUseText: {
    color: COLORS.perfect,
    fontSize: 10,
    fontWeight: '700',
  },
  footnote: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },
});
