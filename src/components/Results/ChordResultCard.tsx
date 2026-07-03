/* Shows the chord name, the notes that make it up, the chord type, and a badge for how well the tapped
   notes fit (perfect or partial). It is memoized so a row only redraws when its own match changes. */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { ChordMatch } from '../../types';
import { resultStyles } from '../../styles/resultStyles';
import { formatChordName, getNotesInChord } from '../../engine/chordNamer';

interface Props {
  match: ChordMatch;
  preferFlats?: boolean;
}

function ChordResultCardComponent({ match, preferFlats }: Props) {
  const isPerfect = match.matchQuality === 'perfect';
  // The actual note names of this chord, and the name to display.
  const chordNotes = getNotesInChord(match.rootPitchClass, match.chordType.intervals, preferFlats);
  const displayName = formatChordName(match.rootPitchClass, match.chordType.symbol, match.bassPitchClass, preferFlats);

  return (
    <View style={[resultStyles.card, isPerfect ? resultStyles.cardPerfect : resultStyles.cardPartial]}>
      <View style={{ flex: 1 }}>
        <Text style={resultStyles.chordName}>{displayName}</Text>
        <Text style={resultStyles.chordNotes}>{chordNotes.join('  -  ')}</Text>
        <Text style={resultStyles.chordSubtext}>
          {match.chordType.name}
          {match.isInversion && match.bassNote ? ` · bass: ${match.bassNote}` : ''}
        </Text>
      </View>
      <View style={[resultStyles.badge, isPerfect ? resultStyles.badgePerfect : resultStyles.badgePartial]}>
        <Text style={[resultStyles.badgeText, isPerfect ? resultStyles.badgeTextPerfect : resultStyles.badgeTextPartial]}>
          {isPerfect ? 'Perfect' : 'Partial'}
        </Text>
      </View>
    </View>
  );
}

export const ChordResultCard = memo(ChordResultCardComponent);
