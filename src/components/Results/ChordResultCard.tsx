/* Shows the chord name, the notes that make it up, the chord type, and a badge for how well the tapped
   notes fit (perfect, partial, or weak). Row only redraws when its own match changes */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { ChordMatch } from '../../types';
import { resultStyles } from '../../styles/resultStyles';
import { formatChordName, getNotesInChord } from '../../engine/chordNamer';

interface Props {
  match: ChordMatch;
  preferFlats?: boolean;
}

// Picks the card border, badge, and label for a given match quality, so (green = perfect, amber = partial, red = weak)
const QUALITY_STYLES = {
  perfect: { card: resultStyles.cardPerfect, badge: resultStyles.badgePerfect, text: resultStyles.badgeTextPerfect, label: 'Perfect' },
  partial: { card: resultStyles.cardPartial, badge: resultStyles.badgePartial, text: resultStyles.badgeTextPartial, label: 'Partial' },
  weak: { card: resultStyles.cardWeak, badge: resultStyles.badgeWeak, text: resultStyles.badgeTextWeak, label: 'Weak' },
};

function ChordResultCardComponent({ match, preferFlats }: Props) {
  const quality = QUALITY_STYLES[match.matchQuality]; // Get the styles for this quality of match

  // The actual note names of this chord, and the name to display.
  const chordNotes = getNotesInChord(match.rootPitchClass, match.chordType.intervals, preferFlats);
  const displayName = formatChordName(match.rootPitchClass, match.chordType.symbol, match.bassPitchClass, preferFlats);

  return (
    <View style={[resultStyles.card, quality.card]}>
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
    </View>
  );
}

export const ChordResultCard = memo(ChordResultCardComponent);
