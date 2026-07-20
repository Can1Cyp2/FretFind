/* Shows the chord name, the notes that make it up, the chord type, and a badge for how well the tapped
   notes fit (perfect, partial, or weak). Tapping the card opens the music theory breakdown for that
   chord. Row only redraws when its own match changes */

import React, { memo } from 'react';
import { Pressable, View, Text } from 'react-native';
import { ChordMatch } from '../../types';
import { resultStyles } from '../../styles/resultStyles';
import { commonStyles } from '../../styles/commonStyles';
import { formatChordName, getNotesInChord } from '../../engine/chordNamer';

interface Props {
  match: ChordMatch;
  preferFlats?: boolean;
  onPress: () => void; // opens the theory breakdown for this chord
  onAddToProgression?: () => void; // adds this chord to the progression (hidden when the progression is full)
}

// Picks the card border, badge, and label for a given match quality, so (green = perfect, amber = partial, red = weak)
const QUALITY_STYLES = {
  perfect: { card: resultStyles.cardPerfect, badge: resultStyles.badgePerfect, text: resultStyles.badgeTextPerfect, label: 'Perfect' },
  partial: { card: resultStyles.cardPartial, badge: resultStyles.badgePartial, text: resultStyles.badgeTextPartial, label: 'Partial' },
  weak: { card: resultStyles.cardWeak, badge: resultStyles.badgeWeak, text: resultStyles.badgeTextWeak, label: 'Weak' },
};

function ChordResultCardComponent({ match, preferFlats, onPress, onAddToProgression }: Props) {
  const quality = QUALITY_STYLES[match.matchQuality]; // Get the styles for this quality of match

  // The actual note names of this chord, and the name to display.
  const chordNotes = getNotesInChord(match.rootPitchClass, match.chordType.intervals, preferFlats);
  const displayName = formatChordName(match.rootPitchClass, match.chordType.symbol, match.bassPitchClass, preferFlats);

  return (
    // Pressable instead of a plain View so a tap can open the detail view (dims slightly while pressed)
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [resultStyles.card, quality.card, pressed && { opacity: 0.8 }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={resultStyles.chordName}>{displayName}</Text>
        <Text style={resultStyles.chordNotes}>{chordNotes.join('  -  ')}</Text>
        <Text style={resultStyles.chordSubtext}>
          {match.chordType.name}
          {match.isInversion && match.bassNote ? ` · bass: ${match.bassNote}` : ''}
        </Text>
      </View>
      <View style={[resultStyles.badge, quality.badge]}>
        <Text style={[resultStyles.badgeText, quality.text]}>{quality.label}</Text>
      </View>
      
      {/* The + button adds this chord (with its current shape) to the progression */}
      {onAddToProgression && (
        <Pressable onPress={onAddToProgression} style={commonStyles.addProgressionButton} hitSlop={4}>
          <Text style={commonStyles.addProgressionButtonText}>+</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

export const ChordResultCard = memo(ChordResultCardComponent);
