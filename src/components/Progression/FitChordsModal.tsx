/* The 'chords that fit' sheet, opened from the button under the progression strip.

   It works out which key the progression most likely lives in, shows every key as
   a selectable chip (ordered best match first, with the best one picked by
   default), and lists the seven chords that key builds on its scale degrees, with
   roman numerals and their notes.

   Chords the progression already uses are marked so what is left to try stands out. */

import React, { memo, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChordMatch, ChordVoicing, ProgressionChord, Tuning } from '../../types';
import { COLORS } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';
import { resultStyles } from '../../styles/resultStyles';
import { rankKeys, getDiatonicChords, diatonicChordToMatch } from '../../engine/keyMatcher';
import { TRIAD_INTERVALS } from '../../constants/scales';
import { formatChordName, getNotesInChord } from '../../engine/chordNamer';
import { ChordDetailModal } from '../Results/ChordDetailModal';
import { InfoTooltip } from '../common/InfoTooltip';
import {
  KEYS_INFO,
  KEY_TYPE_INFO,
  NUMERALS_INFO,
  PROGRESSIONS_INFO,
  DEGREE_EXPLANATIONS,
  COMMON_PROGRESSIONS,
} from '../../constants/musicTheory';

interface Props {
  visible: boolean;
  onClose: () => void;
  progression: ProgressionChord[];
  preferFlats?: boolean;
  // Adds a suggested chord to the progression, along with the shape being looked at
  // when it was added, since a suggestion was never played on the fretboard itself
  onAddToProgression?: (match: ChordMatch, shownVoicing?: ChordVoicing | null) => void;
  isProgressionFull?: boolean; // hides the add option when the progression is at its cap
  tuning: Tuning;              // so a suggested chord can show real shapes for the current tuning
  onLoadVoicing?: (voicing: ChordVoicing) => void; // puts a suggested chord's shape onto the fretboard
}

/* A section heading with its 'i' button on the right, the same pattern and the same
   styles the chord breakdown uses, so the explanations in this sheet look and behave
   like the ones already in the app rather than like a second system. */
function SectionHeader({ title, onInfo }: { title: string; onInfo: () => void }) {
  return (
    <View style={resultStyles.detailSectionRow}>
      <View style={resultStyles.detailSectionHeader}>
        <Text style={resultStyles.detailSectionHeaderText}>{title}</Text>
      </View>
      <Pressable onPress={onInfo} style={resultStyles.infoButton} hitSlop={6}>
        <Text style={resultStyles.infoButtonText}>i</Text>
      </Pressable>
    </View>
  );
}

function FitChordsModalComponent({
  visible,
  onClose,
  progression,
  preferFlats,
  onAddToProgression,
  isProgressionFull,
  tuning,
  onLoadVoicing,
}: Props) {
  /* Every key ranked against the progression, best match first. Only worked out
     while the sheet is actually open: this component stays mounted when closed, so
     without the visible check every change to the progression (each tap of a
     reorder arrow, say) re-ranked all the keys for a sheet nobody was looking at. */
  const rankedKeys = useMemo(
    () => (visible ? rankKeys(progression, preferFlats) : []),
    [visible, progression, preferFlats],
  );

  // Which key chip is selected (0 is the best match, and the default)
  const [selectedIndex, setSelectedIndex] = useState(0);

  // The suggested chord the user tapped to read about (null when none is open)
  const [selectedChord, setSelectedChord] = useState<ChordMatch | null>(null);

  // The explanation popup that is currently open (null when none is)
  const [tooltipInfo, setTooltipInfo] = useState<{ title: string; text: string } | null>(null);

  // Snap back to the best match whenever the sheet opens fresh
  useEffect(() => {
    if (visible) setSelectedIndex(0);
  }, [visible]);

  const selectedKey = rankedKeys[selectedIndex] ?? rankedKeys[0];
  const diatonicChords = useMemo(
    () => (selectedKey ? getDiatonicChords(selectedKey, progression) : []),
    [selectedKey, progression],
  );

  /* (in order to mitigate issues I faced:) Keeping both mounted the whole time and just handing visibility from one to the other, rather than ever having two native modal
     windows open at once, avoids that regardless of which one is closed first: */
  const showThisSheet = visible && selectedChord === null;

  return (
    <>
    <Modal visible={showThisSheet} transparent animationType="slide" onRequestClose={onClose}>
      {/* The dark backdrop is a layer behind the sheet rather than wrapped around it,
          so the list inside can scroll without the backdrop stealing the touch */}
      <View style={commonStyles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={commonStyles.modalContent}>
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

            <SectionHeader
              title="The Key"
              onInfo={() => setTooltipInfo({ title: 'What a key is', text: KEYS_INFO })}
            />

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

            {/* How the selected key tends to feel emotionally/mood wise, for the major and minor keys, with the fuller explanation of
                why the two types differ when you tap on it*/}
            {selectedKey && (
              <Pressable
                onPress={() => setTooltipInfo({ title: 'Major and minor', text: KEY_TYPE_INFO })}
                style={styles.feelCard}
              >
                <Text style={styles.feelText}>
                  {selectedKey.type === 'major'
                    ? 'Major keys tend to sound bright, settled and resolved. Most pop, rock, country and folk sits here.'
                    : 'Minor keys tend to sound darker, heavier or sadder. Most metal, a lot of rap and electronic music, and most tense film music sits here.'}
                </Text>
                <Text style={styles.feelHint}>Tap to read why</Text>
              </Pressable>
            )}

            <SectionHeader
              title="Chords In This Key"
              onInfo={() => setTooltipInfo({ title: 'What the numerals mean', text: NUMERALS_INFO })}
            />

            {/* The seven chords the selected key is built from. Tapping one opens its
                theory breakdown, where it can also be added to the progression */}
            {diatonicChords.map((chord, degree) => {
              const name = formatChordName(chord.rootPitchClass, chord.symbol, undefined, preferFlats);
              const notes = getNotesInChord(chord.rootPitchClass, TRIAD_INTERVALS[chord.quality], preferFlats);
              return (
                <Pressable
                  key={chord.numeral}
                  onPress={() => setSelectedChord(diatonicChordToMatch(chord, preferFlats))}
                  style={({ pressed }) => [styles.chordRow, pressed && { opacity: 0.8 }]}
                >
                  {/* The numeral itself is its own button, so tapping the numeral
                      explains what that numeral does in a key while tapping the rest
                      of the row still opens the chord's own breakdown. The two
                      questions someone has here are different, so they get their
                      own targets rather than sharing one. */}
                  <Pressable
                    onPress={() =>
                      setTooltipInfo({
                        title: `${chord.numeral} in a ${selectedKey.type === 'major' ? 'major' : 'minor'} key`,
                        text: DEGREE_EXPLANATIONS[selectedKey.type][degree],
                      })
                    }
                    style={styles.numeralBadge}
                    hitSlop={6}
                  >
                    <Text style={styles.numeralText}>{chord.numeral}</Text>
                    <Text style={styles.numeralHint}>i</Text>
                  </Pressable>
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
              Tap a numeral to read what that chord does in the key.
            </Text>

            {/* The progressions that often found in real songs: explanations written for the
                numerals and then spelled out as the actual chords of whichever key is selected, 
                so it is both showcasing transferable patterns and something that can be played right now 
                without the user working anything out */}
            {selectedKey && (
              <>
                <SectionHeader
                  title="Progressions That Work"
                  onInfo={() =>
                    setTooltipInfo({ title: 'Common progressions', text: PROGRESSIONS_INFO })
                  }
                />
                {COMMON_PROGRESSIONS[selectedKey.type].map(prog => {
                  const numerals = prog.degrees.map(d => diatonicChords[d]?.numeral ?? '').join('  -  ');
                  const chordNames = prog.degrees
                    .map(d => {
                      const c = diatonicChords[d];
                      return c ? formatChordName(c.rootPitchClass, c.symbol, undefined, preferFlats) : '';
                    })
                    .join('  -  ');
                  return (
                    <View key={prog.name} style={styles.progCard}>
                      <View style={styles.progHeaderRow}>
                        <Text style={styles.progNumerals}>{numerals}</Text>
                        <Text style={styles.progName}>{prog.name}</Text>
                      </View>
                      <Text style={styles.progChords}>{chordNames}</Text>
                      <Text style={styles.progFeel}>{prog.feel}</Text>
                    </View>
                  );
                })}
              </>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>

    {/* The theory breakdown for a tapped suggestion, the same view the results use.
        It sits outside the sheet above so the two are never nested. */}
    <ChordDetailModal
      match={selectedChord}
      visible={selectedChord !== null}
      onClose={() => setSelectedChord(null)}
      preferFlats={preferFlats}
      isSuggestion
      tuning={tuning}

      /* A suggested chord never came off the fretboard, so before this it was only
         something to read about. Loading one of its shapes puts it onto the fretboard
         so it can be heard and strummed, which was issue 2 in the d6 issues file. 
         
         Both sheets close so the fretboard is visible. */
      onLoadVoicing={
        onLoadVoicing
          ? voicing => {
              onLoadVoicing(voicing);
              setSelectedChord(null);
              onClose();
            }
          : undefined
      }
      /* The shape showing in the breakdown goes with it */
      onAddToProgression={
        onAddToProgression && !isProgressionFull && selectedChord
          ? shownVoicing => onAddToProgression(selectedChord, shownVoicing)
          : undefined
      }
    />
    </>
  );
}

// Skipped entirely while nothing it shows has changed, same reasoning as the other sheets: 
// it stays mounted when closed, and closed sheets dont need to do anyrthing on every tap elsewhere in the app
export const FitChordsModal = memo(FitChordsModalComponent);

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

  // An 'i' under the numeral, so it is clear the numeral itself can be tapped rather than it looking like a plain label
  numeralHint: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },

  // The line describing how the selected key tends to feel:
  feelCard: {
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  feelText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  feelHint: {
    color: COLORS.accentLight,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },

  // One common progression: its numerals and nickname, the real chords it becomes in this key, and what it tends to sound like and get used for
  progCard: {
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  progHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  progNumerals: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progName: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flexShrink: 1,
    textAlign: 'right',
  },
  progChords: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  progFeel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
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
