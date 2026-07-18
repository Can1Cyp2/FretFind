/* The music theory breakdown for a tapped chord. It slides up over the app and
   explains the chord in plain language: the notes it is made of, the formula as
   interval names, every interval with its full name and the note it lands on,
   and the voicing when the chord is an inversion or a slash chord.

   Every section heading has a little 'i' button, and every interval chip and row
   can be tapped. Both open a short plain-language explanation, so someone who
   does not know any theory can still learn from what they are playing. */

import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { ChordMatch, PitchClass } from '../../types';
import { COLORS } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';
import { resultStyles } from '../../styles/resultStyles';
import { intervalToName, intervalToFullName, pitchClassToName } from '../../engine/noteUtils';
import { formatChordName, getNotesInChord } from '../../engine/chordNamer';
import { InfoTooltip } from '../common/InfoTooltip';
import {
  NOTES_INFO,
  FORMULA_INFO,
  INTERVALS_INFO,
  VOICING_INFO,
  INTERVAL_EXPLANATIONS,
} from '../../constants/musicTheory';

interface Props {
  match: ChordMatch | null; // the tapped chord, null when nothing is open
  visible: boolean;
  onClose: () => void;
  preferFlats?: boolean;
}

// The badge for the three match grades, same colours as the result cards so they read as one system
const QUALITY_BADGES = {
  perfect: { badge: resultStyles.badgePerfect, text: resultStyles.badgeTextPerfect, label: 'Perfect Match' },
  partial: { badge: resultStyles.badgePartial, text: resultStyles.badgeTextPartial, label: 'Partial Match' },
  weak: { badge: resultStyles.badgeWeak, text: resultStyles.badgeTextWeak, label: 'Weak Match' },
};

// A section heading with its 'i' info button on the right
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

export function ChordDetailModal({ match, visible, onClose, preferFlats }: Props) {
  // The explanation popup that is currently open (null when none is)
  const [tooltipInfo, setTooltipInfo] = useState<{ title: string; text: string } | null>(null);

  if (!match) return null;

  const chordNotes = getNotesInChord(match.rootPitchClass, match.chordType.intervals, preferFlats);
  const displayName = formatChordName(match.rootPitchClass, match.chordType.symbol, match.bassPitchClass, preferFlats);
  const quality = QUALITY_BADGES[match.matchQuality];
  const essentialSet = new Set(match.chordType.essentialIntervals);

  // A perfect match can still be missing optional notes (like the fifth), which is worth pointing out
  const hasMissingOptional = match.matchQuality === 'perfect' && match.missingIntervals.length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Tapping the dark area outside the sheet closes it, taps inside the sheet stay put */}
      <Pressable style={commonStyles.modalOverlay} onPress={onClose}>
        <Pressable style={commonStyles.modalContent} onPress={event => event.stopPropagation()}>
          <View style={commonStyles.modalHandle} />
          <View style={commonStyles.modalHeader}>
            <Text style={[commonStyles.modalTitle, { fontSize: 28, fontWeight: '900' }]}>{displayName}</Text>
            <Pressable onPress={onClose} style={commonStyles.modalCloseButton}>
              <Text style={commonStyles.modalCloseText}>{'✕'}</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* The match grade and the full chord type name */}
            <View style={[resultStyles.badge, quality.badge, { alignSelf: 'flex-start', marginBottom: 12 }]}>
              <Text style={[resultStyles.badgeText, quality.text]}>{quality.label}</Text>
            </View>
            <Text style={{ color: COLORS.textSecondary, fontSize: 15, fontWeight: '500' }}>
              {match.chordType.name}
            </Text>

            {/* Notes: the actual notes the chord is made of */}
            <SectionHeader title="Notes" onInfo={() => setTooltipInfo({ title: 'Notes', text: NOTES_INFO })} />
            <View style={resultStyles.chipRow}>
              {chordNotes.map((note, i) => (
                <View key={i} style={resultStyles.chip}>
                  <Text style={resultStyles.chipText}>{note}</Text>
                </View>
              ))}
            </View>

            {/* Formula: the chord spelt as interval names. Purple chips are notes that were
                tapped, red chips are essential notes that are missing, and amber chips are
                optional notes that are missing. Tapping any chip explains that interval. */}
            <SectionHeader title="Formula" onInfo={() => setTooltipInfo({ title: 'Formula', text: FORMULA_INFO })} />
            <View style={resultStyles.chipRow}>
              {match.chordType.intervals.map((iv, i) => {
                const isMatched = match.matchedIntervals.includes(iv);
                const isEssential = essentialSet.has(iv);
                return (
                  <Pressable
                    key={i}
                    onPress={() => setTooltipInfo({ title: intervalToFullName(iv), text: INTERVAL_EXPLANATIONS[iv] ?? '' })}
                    style={[
                      resultStyles.chip,
                      {
                        backgroundColor: isMatched ? COLORS.accentDim : isEssential ? COLORS.dangerBg : COLORS.partialBg,
                        borderColor: isMatched
                          ? 'rgba(108, 99, 255, 0.25)'
                          : isEssential ? 'rgba(239, 68, 68, 0.2)'
                          : COLORS.partialBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        resultStyles.chipText,
                        { color: isMatched ? COLORS.accentLight : isEssential ? COLORS.danger : COLORS.partial },
                      ]}
                    >
                      {intervalToName(iv)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Intervals: every interval listed out with its full name, whether it is
                essential or optional, and the actual note it lands on for this root */}
            <SectionHeader title="Intervals" onInfo={() => setTooltipInfo({ title: 'Intervals', text: INTERVALS_INFO })} />
            {match.chordType.intervals.map((iv, i) => {
              // The note this interval lands on: the root plus the gap, wrapped around the 12 notes
              const pc = ((match.rootPitchClass + iv) % 12) as PitchClass;
              const isMatched = match.matchedIntervals.includes(iv);
              const isEssential = essentialSet.has(iv);
              return (
                <Pressable
                  key={i}
                  onPress={() => setTooltipInfo({ title: intervalToFullName(iv), text: INTERVAL_EXPLANATIONS[iv] ?? '' })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 4 }}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: isMatched ? COLORS.accent : isEssential ? COLORS.danger : COLORS.partial,
                        marginRight: 12,
                      }}
                    />
                    <Text
                      style={{
                        color: isMatched ? COLORS.textPrimary : COLORS.textMuted,
                        fontSize: 14,
                        flex: 1,
                        fontWeight: '500',
                      }}
                    >
                      {intervalToName(iv)} ({intervalToFullName(iv)})
                    </Text>
                    <Text
                      style={{
                        color: isEssential ? COLORS.accent : COLORS.textMuted,
                        fontSize: 10,
                        fontWeight: '600',
                        marginRight: 8,
                      }}
                    >
                      {isEssential ? 'essential' : 'optional'}
                    </Text>
                    <Text
                      style={{
                        color: isMatched ? COLORS.textSecondary : isEssential ? COLORS.danger : COLORS.partial,
                        fontSize: 14,
                        fontWeight: '600',
                      }}
                    >
                      {pitchClassToName(pc, preferFlats)}
                      {!isMatched ? '  missing' : ''}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
            {/* Hint that each row above is tappable, since there is no other visual cue for it */}
            <Text style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 4, paddingHorizontal: 4 }}>
              Tap an interval to see details about that specific interval.
            </Text>

            {/* Voicing: only shown when the lowest note is not the root (inversion or slash chord) */}
            {match.isInversion && (
              <>
                <SectionHeader title="Voicing" onInfo={() => setTooltipInfo({ title: 'Voicing', text: VOICING_INFO })} />
                <Text style={{ color: COLORS.textPrimary, fontSize: 16, paddingLeft: 4, fontWeight: '600' }}>
                  {match.inversionNumber
                    ? `${match.inversionNumber}${match.inversionNumber === 1 ? 'st' : match.inversionNumber === 2 ? 'nd' : 'rd'} inversion (bass: ${match.bassNote})`
                    : `Slash chord (bass: ${match.bassNote})`}
                </Text>
              </>
            )}

            {/* A perfect match with optional notes left out still counts, explain why: */}
            {hasMissingOptional && (
              <View style={resultStyles.optionalNoteBox}>
                <Text style={resultStyles.optionalNoteText}>
                  All essential notes are present. The {match.missingIntervals.map(iv => intervalToFullName(iv)).join(', ')}{' '}
                  {match.missingIntervals.length === 1 ? 'is' : 'are'} optional and can be left out without changing what the chord is.
                </Text>
              </View>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>

          <InfoTooltip
            visible={tooltipInfo !== null}
            title={tooltipInfo?.title ?? ''}
            text={tooltipInfo?.text ?? ''}
            onClose={() => setTooltipInfo(null)}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
