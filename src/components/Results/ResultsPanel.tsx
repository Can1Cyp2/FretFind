/* Chord matches under the fretboard. Updates live as the
   user taps notes. With fewer than two notes it shows a short hint, otherwise it
   lists the matching chords from best to worst, with a small count of how many of
   them are perfect matches. */

import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { ChordMatch } from '../../types';
import { ChordResultCard } from './ChordResultCard';
import { resultStyles } from '../../styles/resultStyles';

interface Props {
  matches: ChordMatch[];
  activeCount: number;   // how many notes are currently selected on the fretboard
  preferFlats?: boolean;
}

export function ResultsPanel({ matches, activeCount, preferFlats }: Props) {
  const perfectCount = matches.filter(m => m.matchQuality === 'perfect').length;

  // Fewer than two notes is not a chord yet, so show a hint instead of results.
  if (activeCount < 2) {
    return (
      <View style={resultStyles.container}>
        <Text style={resultStyles.emptyText}>
          Tap at least 2 notes on the fretboard to find matching chords
        </Text>
      </View>
    );
  }

  // Two or more notes, but nothing in the chord table fits them
  if (matches.length === 0) {
    return (
      <View style={resultStyles.container}>
        <Text style={resultStyles.emptyText}>No matching chords found</Text>
      </View>
    );
  }

  return (
    <View style={resultStyles.container}>
      <View style={resultStyles.header}>
        <Text style={resultStyles.title}>Results</Text>
        <Text style={resultStyles.count}>
          {perfectCount > 0 ? `${perfectCount} perfect · ` : ''}{matches.length} total
        </Text>
      </View>
      <FlatList
        data={matches}
        keyExtractor={(item, index) => `${item.fullName}-${index}`}
        renderItem={({ item }) => <ChordResultCard match={item} preferFlats={preferFlats} />}
        showsVerticalScrollIndicator
        contentContainerStyle={{ paddingBottom: 8 }}
      />
    </View>
  );
}
